"""Billing: Paystack integration stub. Real verification lives here; tests mock _paystack_request."""

import logging

import requests
from django.conf import settings
from django.utils import timezone

from ai_advisor.models import AIQuery

from .models import PLAN_LIMITS, PLAN_PRICE_NGN, Plan, Subscription

logger = logging.getLogger('kiji')

PAYSTACK_BASE = 'https://api.paystack.co'


def get_or_create_subscription(user):
    sub, _ = Subscription.objects.get_or_create(user=user, defaults={'plan': Plan.FREE})
    return sub


def remaining_queries(user):
    """Remaining AI queries this month for user's current plan."""
    sub = get_or_create_subscription(user)
    limit = sub.limit()
    start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    used = AIQuery.objects.filter(user=user, created_at__gte=start).count()
    return max(limit - used, 0), limit, used


def plan_info(user):
    sub = get_or_create_subscription(user)
    remaining, limit, used = remaining_queries(user)
    return {
        'plan': sub.plan,
        'plan_label': sub.get_plan_display(),
        'is_active': sub.is_active,
        'limit': limit,
        'used': used,
        'remaining': remaining,
        'price_ngn': PLAN_PRICE_NGN[sub.plan],
        'plans': [
            {'plan': k, 'limit': v, 'price_ngn': PLAN_PRICE_NGN[k]}
            for k, v in PLAN_LIMITS.items()
        ],
    }


def _paystack_request(method, path, **kwargs):
    secret = settings.PAYSTACK_SECRET_KEY
    if not secret:
        return None
    headers = {'Authorization': f'Bearer {secret}'}
    try:
        resp = requests.request(method, f"{PAYSTACK_BASE}{path}", headers=headers, timeout=10, **kwargs)
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:  # pragma: no cover
        logger.warning('Paystack %s %s failed: %s', method, path, exc)
        return None


def initialize_transaction(user, plan=Plan.STARTER, callback_url=''):
    """Create a Paystack transaction for upgrading to `plan`. Returns authorization_url or None."""
    if plan not in PLAN_LIMITS or plan == Plan.FREE:
        return None
    amount_kobo = PLAN_PRICE_NGN[plan] * 100
    data = {'email': user.email, 'amount': amount_kobo, 'metadata': {'plan': plan, 'user_id': user.id}}
    if callback_url:
        data['callback_url'] = callback_url
    res = _paystack_request('POST', '/transaction/initialize', json=data)
    if not res or not res.get('status'):
        return None
    return res['data']


def verify_transaction(reference):
    """Verify a transaction by reference. Returns Paystack data or None."""
    res = _paystack_request('GET', f'/transaction/verify/{reference}')
    if not res or not res.get('status'):
        return None
    return res['data']


def activate_plan(user, plan):
    sub = get_or_create_subscription(user)
    sub.plan = plan
    sub.is_active = True
    sub.save(update_fields=['plan', 'is_active', 'updated_at'])
    return sub
