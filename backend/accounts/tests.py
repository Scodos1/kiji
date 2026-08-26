from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.test import APIClient

# DRF binds DEFAULT_THROTTLE_RATES into the throttle classes at import time, so
# tests must reassign the class attributes rather than rely on override_settings.
HIGH_RATES = {'anon': '10000/hour', 'user': '10000/hour', 'auth': '10000/minute'}
LOW_RATES = {'anon': '10000/hour', 'user': '10000/hour', 'auth': '3/minute'}


def _set_throttle_rates(rates):
    AnonRateThrottle.THROTTLE_RATES = rates
    UserRateThrottle.THROTTLE_RATES = rates


def _now():
    return timezone.now().isoformat()


class _BaseAuth(TestCase):
    def setUp(self):
        cache.clear()
        _set_throttle_rates(HIGH_RATES)
        self.client = APIClient()
        r = self.client.post('/api/auth/register/', {
            'email': 'owner@example.com', 'name': 'Owner', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 201)
        r = self.client.post('/api/auth/login/', {
            'email': 'owner@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')
        r = self.client.post('/api/business/', {
            'name': 'Owner Shop', 'category': 'retail', 'location': 'Lagos'
        }, format='json')
        self.assertEqual(r.status_code, 201)


class TechnicalAuditTest(_BaseAuth):
    """Stage 1: security, isolation, validation."""

    def test_blank_phone_customers_are_allowed(self):
        for i in range(3):
            r = self.client.post('/api/customers/', {'name': f'No Phone {i}'}, format='json')
            self.assertEqual(r.status_code, 201)

    def test_duplicate_phone_rejected_with_clean_error(self):
        self.client.post('/api/customers/', {'name': 'A', 'phone': '080111'}, format='json')
        r = self.client.post('/api/customers/', {'name': 'B', 'phone': '080111'}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('already exists', str(r.json()))

    def test_duplicate_phone_across_businesses_allowed(self):
        self.client.post('/api/customers/', {'name': 'A', 'phone': '080111'}, format='json')
        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'other@example.com', 'name': 'Other', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 201)
        r = other.post('/api/auth/login/', {
            'email': 'other@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        other.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')
        other.post('/api/business/', {'name': 'Other Shop', 'category': 'retail'}, format='json')
        r = other.post('/api/customers/', {'name': 'B', 'phone': '080111'}, format='json')
        self.assertEqual(r.status_code, 201)

    def test_cross_tenant_product_reference_rejected(self):
        """A sale must not reference another business's product."""
        r = self.client.post('/api/products/', {
            'name': 'Shoes', 'selling_price': '5000', 'cost_price': '2000'
        }, format='json')
        product_id = r.json()['id']

        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'intruder@example.com', 'name': 'Intruder', 'password': 'TestPass@2026!'
        }, format='json')
        r = other.post('/api/auth/login/', {
            'email': 'intruder@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        other.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')
        other.post('/api/business/', {'name': 'Intruder Shop', 'category': 'retail'}, format='json')

        r = other.post('/api/sales/', {
            'product': product_id, 'quantity': 1, 'unit_price': '5000',
            'sale_date': _now()
        }, format='json')
        self.assertIn(r.status_code, (400, 404))

    def test_cross_tenant_customer_reference_rejected(self):
        r = self.client.post('/api/customers/', {'name': 'Sarah', 'phone': '080222'}, format='json')
        customer_id = r.json()['id']

        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'intruder2@example.com', 'name': 'I2', 'password': 'TestPass@2026!'
        }, format='json')
        r = other.post('/api/auth/login/', {
            'email': 'intruder2@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        other.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')
        other.post('/api/business/', {'name': 'I2 Shop', 'category': 'retail'}, format='json')

        r = other.post('/api/sales/', {
            'customer': customer_id, 'quantity': 1, 'unit_price': '1000',
            'sale_date': _now()
        }, format='json')
        self.assertIn(r.status_code, (400, 404))

    def test_negative_sale_rejected(self):
        r = self.client.post('/api/sales/', {
            'quantity': 0, 'unit_price': '5000', 'sale_date': _now()
        }, format='json')
        self.assertEqual(r.status_code, 400)
        r = self.client.post('/api/sales/', {
            'quantity': 1, 'unit_price': '-5', 'sale_date': _now()
        }, format='json')
        self.assertEqual(r.status_code, 400)

    def test_negative_expense_rejected(self):
        r = self.client.post('/api/expenses/', {
            'category': 'other', 'amount': '-100', 'expense_date': _now()
        }, format='json')
        self.assertEqual(r.status_code, 400)

    def test_negative_product_price_rejected(self):
        r = self.client.post('/api/products/', {
            'name': 'Bad', 'selling_price': '-5', 'cost_price': '10'
        }, format='json')
        self.assertEqual(r.status_code, 400)

    def test_cost_exceeds_selling_rejected(self):
        r = self.client.post('/api/products/', {
            'name': 'Bad2', 'selling_price': '100', 'cost_price': '200'
        }, format='json')
        self.assertEqual(r.status_code, 400)

    def test_unauthenticated_requests_rejected(self):
        anon = APIClient()
        for url in ['/api/products/', '/api/sales/', '/api/analytics/overview/', '/api/ai/insights/']:
            r = anon.get(url)
            self.assertIn(r.status_code, (401, 403))

    def test_user_cannot_access_another_business(self):
        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'looker@example.com', 'name': 'Looker', 'password': 'TestPass@2026!'
        }, format='json')
        r = other.post('/api/auth/login/', {
            'email': 'looker@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        other.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')
        other.post('/api/business/', {'name': 'Looker Shop', 'category': 'retail'}, format='json')

        r = self.client.post('/api/products/', {'name': 'Secret', 'selling_price': '1'}, format='json')
        secret_id = r.json()['id']

        r = other.get(f'/api/products/{secret_id}/')
        self.assertIn(r.status_code, (404, 403))

    def test_unknown_route_returns_consistent_json(self):
        r = self.client.get('/api/does-not-exist/')
        self.assertEqual(r.status_code, 404)
        self.assertIsInstance(r.json(), dict)
        self.assertIn('detail', r.json())

    def test_customer_status_filter_paginates(self):
        """?status= must keep a queryset so DRF pagination works (regression)."""
        now = timezone.now()
        for name, phone, days in [
            ('Recent', '08010000001', 5),
            ('Old', '08010000002', 90),
            ('Mid', '08010000003', 45),
        ]:
            r = self.client.post('/api/customers/', {'name': name, 'phone': phone}, format='json')
            self.assertEqual(r.status_code, 201)
            self.client.post('/api/sales/', {
                'customer': r.json()['id'], 'quantity': 1, 'unit_price': '1000',
                'sale_date': (now - timedelta(days=days)).isoformat()
            }, format='json')

        for status, expected in [('active', 1), ('at_risk', 1), ('inactive', 1)]:
            r = self.client.get(f'/api/customers/?status={status}')
            self.assertEqual(r.status_code, 200)
            body = r.json()
            self.assertIn('results', body)
            self.assertEqual(len(body['results']), expected)

    def test_cannot_update_or_delete_another_business(self):
        r = self.client.post('/api/products/', {'name': 'Target', 'selling_price': '100'}, format='json')
        product_id = r.json()['id']
        r = self.client.post('/api/customers/', {'name': 'Target C', 'phone': '080555'}, format='json')
        customer_id = r.json()['id']

        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'raider@example.com', 'name': 'Raider', 'password': 'TestPass@2026!'
        }, format='json')
        r = other.post('/api/auth/login/', {
            'email': 'raider@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        other.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')
        other.post('/api/business/', {'name': 'Raider Shop', 'category': 'retail'}, format='json')

        r = other.patch(f'/api/products/{product_id}/', {'selling_price': '1'}, format='json')
        self.assertIn(r.status_code, (404, 403))
        r = other.delete(f'/api/products/{product_id}/')
        self.assertIn(r.status_code, (404, 403))
        r = other.patch(f'/api/customers/{customer_id}/', {'name': 'Hacked'}, format='json')
        self.assertIn(r.status_code, (404, 403))

    def test_password_change_flow(self):
        r = self.client.post('/api/auth/password/', {
            'old_password': 'TestPass@2026!', 'new_password': 'NewStrong@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 200)

        # Old password no longer works; new one does.
        r = self.client.post('/api/auth/login/', {
            'email': 'owner@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 401)
        r = self.client.post('/api/auth/login/', {
            'email': 'owner@example.com', 'password': 'NewStrong@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 200)

    def test_password_change_rejects_wrong_old_password(self):
        r = self.client.post('/api/auth/password/', {
            'old_password': 'wrong-password', 'new_password': 'NewStrong@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('incorrect', str(r.json()))

    def test_sale_model_computes_total_from_raw_values(self):
        """Direct ORM creation with string prices must not string-concatenate."""
        from products.models import Product
        from sales.models import Sale

        r = self.client.post('/api/products/', {'name': 'Bag', 'selling_price': '45000'}, format='json')
        product = Product.objects.get(id=r.json()['id'])
        sale = Sale.objects.create(
            business=product.business, product=product, quantity=2,
            unit_price='45000', sale_date=timezone.now(),
        )
        self.assertEqual(float(sale.total_amount), 90000.0)
        self.assertEqual(float(sale.cost_price), float(product.cost_price))

    def test_duplicate_product_name_rejected_with_clean_error(self):
        r = self.client.post('/api/products/', {'name': 'Bag', 'selling_price': '5000'}, format='json')
        self.assertEqual(r.status_code, 201)
        r = self.client.post('/api/products/', {'name': 'Bag', 'selling_price': '6000'}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('already have a product', str(r.json()))

    def test_whatsapp_links_use_international_format(self):
        """Local Nigerian numbers (0803...) must become 234803... in wa.me links."""
        r = self.client.post('/api/customers/', {'name': 'Amina', 'phone': '08031234567'}, format='json')
        self.assertEqual(r.status_code, 201)
        r = self.client.post('/api/marketing/campaigns/', {
            'campaign_type': 'reengagement', 'tone': 'friendly', 'targets': 'all'
        }, format='json')
        self.assertEqual(r.status_code, 200)
        messages = r.json()['messages']
        self.assertGreater(len(messages), 0)
        self.assertIn('https://wa.me/2348031234567?', messages[0]['wa_link'])


class ThrottleTest(TestCase):
    """Auth endpoints are rate-limited per IP."""

    def setUp(self):
        cache.clear()
        _set_throttle_rates(LOW_RATES)
        self.client = APIClient()

    def test_register_and_login_rate_limited(self):
        for i in range(3):
            r = self.client.post('/api/auth/register/', {
                'email': f'rl{i}@example.com', 'name': 'RL', 'password': 'TestPass@2026!'
            }, format='json')
            self.assertEqual(r.status_code, 201)
        r = self.client.post('/api/auth/register/', {
            'email': 'rl3@example.com', 'name': 'RL', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 429)
        r = self.client.post('/api/auth/login/', {
            'email': 'rl0@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 429)


class AIAuditTest(_BaseAuth):
    """Stage 4: AI never invents numbers; budget cap works."""

    def _seed(self):
        r = self.client.post('/api/products/', {
            'name': 'Bags', 'selling_price': '15000', 'cost_price': '8000'
        }, format='json')
        self.assertEqual(r.status_code, 201)
        now = timezone.now()
        for name, days, phone in [
            ('Active C', 5, '08000000001'),
            ('AtRisk C', 45, '08000000002'),
            ('Inactive C', 90, '08000000003'),
        ]:
            r = self.client.post('/api/customers/', {'name': name, 'phone': phone}, format='json')
            self.assertEqual(r.status_code, 201)
            self.client.post('/api/sales/', {
                'product': 1, 'customer': r.json()['id'], 'quantity': 1,
                'unit_price': '15000', 'sale_date': (now - timedelta(days=days)).isoformat()
            }, format='json')
        self.client.post('/api/sales/', {
            'product': 1, 'quantity': 2, 'unit_price': '15000',
            'sale_date': now.isoformat()
        }, format='json')
        r = self.client.post('/api/expenses/', {
            'category': 'rent', 'amount': '5000', 'expense_date': now.isoformat()
        }, format='json')
        self.assertEqual(r.status_code, 201)

    def _ask(self, question):
        r = self.client.post('/api/ai/ask/', {'question': question}, format='json')
        self.assertEqual(r.status_code, 200)
        return r.json()['answer']

    def test_answers_cite_real_computed_numbers(self):
        """Answers must reference seeded amounts, never invented ones."""
        self._seed()

        ans = self._ask('What are my best-selling products?')
        self.assertIn('Bags', ans)
        self.assertIn('45,000.00', ans)   # 3 units x 15,000 within 30d
        self.assertIn('3 units', ans)

        ans = self._ask('Why did my profit decrease?')
        self.assertIn('40,000.00', ans)   # 45,000 revenue - 5,000 expense
        self.assertIn('45,000.00', ans)
        self.assertIn('5,000.00', ans)

        ans = self._ask('Who are my most valuable customers?')
        self.assertIn('1 inactive', ans)
        self.assertIn('1 active', ans)

        ans = self._ask('How can I increase my sales?')
        self.assertIn('Bags', ans)

    def test_ai_budget_caps_at_five_questions(self):
        self._seed()
        for i in range(5):
            r = self.client.post('/api/ai/ask/', {'question': 'What are my best products?'}, format='json')
            self.assertEqual(r.status_code, 200)
        r = self.client.post('/api/ai/ask/', {'question': 'What are my best products?'}, format='json')
        self.assertEqual(r.status_code, 429)

    def test_off_topic_question_does_not_hallucinate(self):
        self._seed()
        r = self.client.post('/api/ai/ask/', {'question': 'Who is the president of Nigeria?'}, format='json')
        self.assertEqual(r.status_code, 200)
        answer = r.json()['answer']
        self.assertIn('business data', answer)
        self.assertNotIn('president of Nigeria', answer.replace('Who is the president of Nigeria?', ''))


class EndToEndSmokeTest(TestCase):
    """Full-stack API smoke test across all modules."""

    def setUp(self):
        cache.clear()
        _set_throttle_rates(HIGH_RATES)
        self.client = APIClient()

    def _register_and_auth(self, email, name):
        r = self.client.post('/api/auth/register/', {
            'email': email, 'name': name, 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 201)
        r = self.client.post('/api/auth/login/', {
            'email': email, 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')

    def test_full_flow(self):
        self._register_and_auth('aisha@example.com', 'Aisha')

        r = self.client.post('/api/business/', {
            'name': 'Aisha Fashion', 'category': 'fashion',
            'location': 'Lagos', 'currency': 'NGN'
        }, format='json')
        self.assertEqual(r.status_code, 201)

        for name, sell, cost in [('Sneakers', '45000', '30000'), ('Shirt', '25000', '15000')]:
            r = self.client.post('/api/products/', {
                'name': name, 'selling_price': sell,
                'cost_price': cost, 'stock_quantity': 20
            }, format='json')
            self.assertEqual(r.status_code, 201)

        r = self.client.post('/api/customers/', {'name': 'Sarah', 'phone': '08012345678'}, format='json')
        self.assertEqual(r.status_code, 201)
        customer_id = r.json()['id']
        self.client.post('/api/customers/', {'name': 'John', 'phone': '08087654321'}, format='json')
        self.assertEqual(r.status_code, 201)

        sale_id = None
        for _ in range(3):
            r = self.client.post('/api/sales/', {
                'product': 1, 'customer': customer_id, 'quantity': 2,
                'unit_price': '45000', 'payment_method': 'transfer',
                'sale_date': _now()
            }, format='json')
            self.assertEqual(r.status_code, 201)
            sale_id = r.json()['id']
        # Sale total auto-calculated (2 x 45000 = 90000)
        self.assertEqual(float(r.json()['total_amount']), 90000.0)

        for category, amount in [('transportation', '50000'), ('inventory', '200000')]:
            r = self.client.post('/api/expenses/', {
                'category': category, 'amount': amount,
                'expense_date': _now()
            }, format='json')
            self.assertEqual(r.status_code, 201)

        # Analytics
        r = self.client.get('/api/analytics/overview/')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreater(data['revenue'], 0)
        self.assertIn('trends', data)
        self.assertIn('best_products', data)

        r = self.client.get('/api/analytics/revenue/?period=7d')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 7)

        r = self.client.get('/api/analytics/expenses/')
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 2)

        # AI
        r = self.client.get('/api/ai/insights/')
        self.assertEqual(r.status_code, 200)
        r = self.client.post('/api/ai/ask/', {'question': 'Why did my profit decrease?'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()['answer'])

        # Marketing
        r = self.client.get('/api/marketing/opportunities/')
        self.assertEqual(r.status_code, 200)
        self.assertIn('count', r.json())

        r = self.client.post('/api/marketing/campaigns/', {
            'campaign_type': 'reengagement', 'tone': 'friendly', 'targets': 'all'
        }, format='json')
        self.assertEqual(r.status_code, 200)
        messages = r.json()['messages']
        self.assertGreater(len(messages), 0)
        self.assertTrue(messages[0]['wa_link'])

        # Data isolation
        other = APIClient()
        r = other.post('/api/auth/register/', {
            'email': 'tunde@example.com', 'name': 'Tunde', 'password': 'TestPass@2026!'
        }, format='json')
        self.assertEqual(r.status_code, 201)
        r = other.post('/api/auth/login/', {
            'email': 'tunde@example.com', 'password': 'TestPass@2026!'
        }, format='json')
        other.credentials(HTTP_AUTHORIZATION=f'Bearer {r.json()["access"]}')
        r = other.get('/api/products/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json().get('results', [])), 0)
