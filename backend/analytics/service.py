"""Analytics engine.

Computes all business metrics with database-level aggregation.
This layer feeds the dashboard and the AI advisor with structured data.
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, Max, Q, Sum, Value
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone

from customers.models import Customer
from expenses.models import Expense
from products.models import Product
from sales.models import Sale

PERIOD_DAYS = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
}


def _window(days):
    """Return (current_start, current_end, previous_start, previous_end)."""
    now = timezone.now()
    current_start = now - timedelta(days=days)
    previous_start = current_start - timedelta(days=days)
    return current_start, now, previous_start, current_start


def _to_float(value):
    return round(float(value or 0), 2)


def _pct_change(current, previous):
    if not previous:
        return None
    return round((current - previous) / previous * 100, 1)


def overview(business, period='30d'):
    days = PERIOD_DAYS.get(period, 30)
    current_start, now, previous_start, current_start_prev = _window(days)

    sales_current = Sale.objects.filter(
        business=business, sale_date__gte=current_start, sale_date__lte=now
    )
    sales_previous = Sale.objects.filter(
        business=business,
        sale_date__gte=previous_start,
        sale_date__lt=current_start,
    )

    revenue = _to_float(sales_current.aggregate(s=Sum('total_amount'))['s'])
    revenue_prev = _to_float(sales_previous.aggregate(s=Sum('total_amount'))['s'])

    expenses_current = Expense.objects.filter(
        business=business, expense_date__gte=current_start, expense_date__lte=now
    )
    expenses_previous = Expense.objects.filter(
        business=business,
        expense_date__gte=previous_start,
        expense_date__lt=current_start,
    )

    expenses = _to_float(expenses_current.aggregate(s=Sum('amount'))['s'])
    expenses_prev = _to_float(expenses_previous.aggregate(s=Sum('amount'))['s'])

    profit = round(revenue - expenses, 2)
    profit_prev = round(revenue_prev - expenses_prev, 2)
    profit_margin = round(profit / revenue * 100, 1) if revenue else 0.0
    margin_prev = round(profit_prev / revenue_prev * 100, 1) if revenue_prev else 0.0

    total_sales = sales_current.count()
    total_customers = Customer.objects.filter(business=business).count()

    # Customer behaviour in the period
    active_customers_current = (
        sales_current.values('customer')
        .filter(customer__isnull=False)
        .distinct()
        .count()
    )
    new_customers = (
        Customer.objects.filter(business=business, created_at__gte=current_start).count()
    )
    returning_customers = active_customers_current - new_customers
    if returning_customers < 0:
        returning_customers = 0

    now_dt = timezone.now()
    inactive_customers = (
        Customer.objects.filter(business=business)
        .annotate(last_sale_ts=Max('sales__sale_date'))
        .filter(
            Q(last_sale_ts__isnull=True)
            | Q(last_sale_ts__lt=now_dt - timedelta(days=60))
        )
        .count()
    )

    # Top products by revenue
    product_rows = (
        sales_current.filter(product__isnull=False)
        .values('product__name')
        .annotate(units=Sum('quantity'), revenue=Sum('total_amount'))
        .order_by('-revenue')[:5]
    )
    best_products = [
        {
            'product': row['product__name'],
            'units_sold': row['units'],
            'revenue': _to_float(row['revenue']),
        }
        for row in product_rows
    ]

    recent_sales = [
        {
            'id': s.id,
            'date': s.sale_date.isoformat(),
            'customer': s.customer.name if s.customer else 'Walk-in',
            'product': s.product.name if s.product else '-',
            'amount': _to_float(s.total_amount),
            'payment_method': s.get_payment_method_display(),
        }
        for s in sales_current.order_by('-sale_date')[:10]
    ]

    return {
        'period': period,
        'revenue': revenue,
        'expenses': expenses,
        'profit': profit,
        'profit_margin': profit_margin,
        'total_sales': total_sales,
        'total_customers': total_customers,
        'new_customers': new_customers,
        'returning_customers': returning_customers,
        'inactive_customers': inactive_customers,
        'best_products': best_products,
        'recent_sales': recent_sales,
        'trends': {
            'revenue_change': _pct_change(revenue, revenue_prev),
            'expenses_change': _pct_change(expenses, expenses_prev),
            'profit_change': _pct_change(profit, profit_prev),
            'margin_change': (
                round(profit_margin - margin_prev, 1) if revenue_prev else None
            ),
        },
    }


def revenue_series(business, period='30d'):
    """Daily buckets of revenue/expenses/profit for the chart."""
    days = PERIOD_DAYS.get(period, 30)
    current_start, now, _, _ = _window(days)

    tz = timezone.get_current_timezone()
    sales = (
        Sale.objects.filter(business=business, sale_date__gte=current_start)
        .annotate(day=TruncDate('sale_date', tzinfo=tz))
        .values('day')
        .annotate(revenue=Sum('total_amount'))
    )
    expenses = (
        Expense.objects.filter(business=business, expense_date__gte=current_start)
        .annotate(day=TruncDate('expense_date', tzinfo=tz))
        .values('day')
        .annotate(amount=Sum('amount'))
    )

    rev_map = {str(row['day']): _to_float(row['revenue']) for row in sales}
    exp_map = {str(row['day']): _to_float(row['amount']) for row in expenses}

    # Build exactly `days` calendar buckets ending today, in the local
    # timezone (matching the TruncDate bucketing above), so today's sales are
    # included. Previously the loop started at now - N days with a time
    # component, which dropped today and charted a partial first day.
    local_now = timezone.localtime(now)
    start_day = (local_now - timedelta(days=days - 1)).date()
    end_day = local_now.date()
    points = []
    for i in range((end_day - start_day).days + 1):
        day = start_day + timedelta(days=i)
        key = day.isoformat()
        revenue = rev_map.get(key, 0.0)
        expense = exp_map.get(key, 0.0)
        points.append({
            'date': key,
            'revenue': revenue,
            'expenses': expense,
            'profit': round(revenue - expense, 2),
        })
    return points


def expense_breakdown(business, period='30d'):
    days = PERIOD_DAYS.get(period, 30)
    current_start, now, _, _ = _window(days)

    rows = (
        Expense.objects.filter(business=business, expense_date__gte=current_start)
        .values('category')
        .annotate(amount=Sum('amount'))
        .order_by('-amount')
    )
    labels = dict(Expense._meta.get_field('category').choices)
    return [
        {
            'category': row['category'],
            'label': labels.get(row['category'], row['category']),
            'amount': _to_float(row['amount']),
        }
        for row in rows
    ]


def product_performance(business, period='30d'):
    days = PERIOD_DAYS.get(period, 30)
    current_start, now, _, _ = _window(days)

    rows = (
        Sale.objects.filter(business=business, sale_date__gte=current_start, product__isnull=False)
        .values('product__name', 'product_id')
        .annotate(units=Sum('quantity'), revenue=Sum('total_amount'), cost=Sum('cost_price'))
        .order_by('-revenue')
    )
    return [
        {
            'product': row['product__name'],
            'units_sold': row['units'],
            'revenue': _to_float(row['revenue']),
            'gross_profit': round(_to_float(row['revenue']) - _to_float(row['cost']), 2),
        }
        for row in rows
    ]


def _status_from_last_date(last_date, now=None):
    """Mirror Customer.status() logic without per-customer queries."""
    if not last_date:
        return 'inactive'
    if now is None:
        now = timezone.now()
    days = (now - last_date).days
    if days <= 30:
        return 'active'
    if days <= 60:
        return 'at_risk'
    return 'inactive'


def customer_segments(business):
    # Single annotated query instead of 2 queries per customer (N+1).
    customers = (
        Customer.objects.filter(business=business)
        .annotate(
            last_sale_ts=Max('sales__sale_date'),
            spent=Coalesce(
                Sum('sales__total_amount'),
                Value(
                    Decimal('0'),
                    output_field=DecimalField(max_digits=14, decimal_places=2),
                ),
            ),
        )
    )
    counts = {'active': 0, 'at_risk': 0, 'inactive': 0}
    value = {'active': 0.0, 'at_risk': 0.0, 'inactive': 0.0}
    now = timezone.now()
    for c in customers:
        status = _status_from_last_date(c.last_sale_ts, now)
        counts[status] += 1
        value[status] += float(c.spent or 0)
    return {
        status: {'count': counts[status], 'total_spent': round(value[status], 2)}
        for status in counts
    }
