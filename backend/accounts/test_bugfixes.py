from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from accounts.tests import _BaseAuth, _now


class BugFixRegressionTests(_BaseAuth):
    """Regression tests for the 2026-08 bug-fix pass."""

    def _add_product(self, name='Widget', sell='5000', cost='2000'):
        r = self.client.post('/api/products/', {
            'name': name, 'selling_price': sell, 'cost_price': cost,
        }, format='json')
        self.assertEqual(r.status_code, 201)
        return r.json()

    def test_product_full_update_keeps_business(self):
        """PUT (full update) must not null out business_id (regression)."""
        product = self._add_product()
        r = self.client.put(f'/api/products/{product["id"]}/', {
            'name': 'Widget v2', 'selling_price': '6000', 'cost_price': '2500',
            'stock_quantity': 5,
        }, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['name'], 'Widget v2')

        # And the product is still visible/editable afterwards.
        r = self.client.get(f'/api/products/{product["id"]}/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(float(r.json()['cost_price']), 2500.0)

    def test_register_colliding_email_local_parts(self):
        """alice@gmail.com and alice@yahoo.com must both register (regression)."""
        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'alice@gmail.com', 'name': 'Alice G', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 201)
        r = other.post('/api/auth/register/', {
            'email': 'alice@yahoo.com', 'name': 'Alice Y', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 201)

    def test_revenue_series_includes_today(self):
        """The chart's last bucket must be today and include today's sales."""
        self._add_product()
        self.client.post('/api/sales/', {
            'product': 1, 'quantity': 2, 'unit_price': '5000',
            'sale_date': _now(),
        }, format='json')
        r = self.client.get('/api/analytics/revenue/?period=7d')
        self.assertEqual(r.status_code, 200)
        series = r.json()
        self.assertEqual(len(series), 7)
        self.assertEqual(series[-1]['date'], timezone.localdate().isoformat())
        self.assertEqual(series[-1]['revenue'], 10000.0)

    def test_margin_change_sign_direction(self):
        """margin_change must be current - previous (positive = improved)."""
        self._add_product(sell='100', cost='0')
        now = timezone.now()
        # Previous period: 100 revenue, no expenses -> 100% margin.
        self.client.post('/api/sales/', {
            'product': 1, 'quantity': 1, 'unit_price': '100',
            'sale_date': (now - timedelta(days=40)).isoformat(),
        }, format='json')
        # Current period: 100 revenue, 50 expenses -> 50% margin.
        self.client.post('/api/sales/', {
            'product': 1, 'quantity': 1, 'unit_price': '100', 'sale_date': _now(),
        }, format='json')
        self.client.post('/api/expenses/', {
            'category': 'other', 'amount': '50', 'expense_date': _now(),
        }, format='json')

        r = self.client.get('/api/analytics/overview/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['trends']['margin_change'], -50.0)

    def test_marketing_opportunities_invalid_days(self):
        """A non-numeric ?days= must not crash (regression)."""
        r = self.client.get('/api/marketing/opportunities/?days=abc')
        self.assertEqual(r.status_code, 200)
        self.assertIn('count', r.json())

    def test_ai_spend_question_routes_to_customers(self):
        """'Who spent the most?' must hit the customer branch, not expenses."""
        self.client.post('/api/customers/', {'name': 'Ada'}, format='json')
        self.client.post('/api/sales/', {
            'quantity': 1, 'unit_price': '1000', 'sale_date': _now(),
        }, format='json')

        r = self.client.post('/api/ai/ask/', {
            'question': 'Who spent the most?'
        }, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertIn('customers', r.json()['answer'])

    def test_create_without_business_returns_clean_400(self):
        """A user with no business gets a 400, not a 500, on create endpoints."""
        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'nobiz@example.com', 'name': 'No Biz', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 201)
        r = other.post('/api/auth/login/', {
            'email': 'nobiz@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        other.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')

        r = other.post('/api/products/', {'name': 'X', 'selling_price': '100'}, format='json')
        self.assertEqual(r.status_code, 400)
        r = other.post('/api/expenses/', {
            'category': 'other', 'amount': '100', 'expense_date': _now(),
        }, format='json')
        self.assertEqual(r.status_code, 400)