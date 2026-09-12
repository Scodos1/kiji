"""Customer acquisition: opportunities + AI campaign generator."""

import logging

from django.conf import settings
from django.utils import timezone

from analytics import service as analytics

logger = logging.getLogger(__name__)

CAMPAIGN_TYPES = [
    ('reengagement', 'Customer re-engagement'),
    ('new_product', 'New product'),
    ('discount', 'Discount'),
    ('referral', 'Referral'),
    ('general', 'General promotion'),
]

TONES = ['friendly', 'professional', 'exciting', 'polite']


def find_opportunities(business, days=60):
    """Customers who haven't purchased in the last `days` days. Optimized to 1 query."""
    from decimal import Decimal

    from django.db.models import DecimalField, Max, Sum, Value
    from django.db.models.functions import Coalesce

    from customers.models import Customer

    cutoff = timezone.now() - timezone.timedelta(days=days)
    now = timezone.now()
    rows = (
        Customer.objects.filter(business=business)
        .annotate(
            last_sale_date=Max('sales__sale_date'),
            total_spent=Coalesce(
                Sum('sales__total_amount'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=14, decimal_places=2),
            ),
        )
        .values('id', 'name', 'phone', 'last_sale_date', 'total_spent')
    )
    inactive = []
    total_value = 0.0
    for r in rows:
        last_date = r['last_sale_date']
        if not last_date or last_date < cutoff:
            spent = float(r['total_spent'] or 0)
            total_value += spent
            inactive.append({
                'id': r['id'],
                'name': r['name'],
                'phone': r['phone'],
                'days_since_purchase': (now - last_date).days if last_date else None,
                'total_spent': round(spent, 2),
            })
    return {
        'count': len(inactive),
        'days': days,
        'customers': inactive,
        'total_spent': round(total_value, 2),
    }


def _templates(campaign_type, tone, product_name=None):
    """Rule-based message templates (used when no LLM is configured)."""
    if campaign_type == 'reengagement':
        return (
            f"Hey {{name}} \U0001F44B It's been a while! We've got some new "
            f"arrivals you might love. Enjoy 10% off your next order this week. "
            f"Come see us soon \U0001F495",
            "Mention this message when you visit to get your discount.",
        )
    if campaign_type == 'new_product':
        product = product_name or 'our new product'
        return (
            f"Hey {{name}} \U0001F525 We just launched {product} and we think "
            "you'll love it! Want to see it?",
            "Reply or come in today for a first look.",
        )
    if campaign_type == 'discount':
        return (
            f"Hey {{name}} \U0001F389 Special offer just for you — enjoy a "
            "discount on your next purchase this week. Don't miss out!",
            "Offer ends soon. Visit us now.",
        )
    if campaign_type == 'referral':
        return (
            f"Hey {{name}} \U0001F4AA Bring a friend and you both get a reward "
            "on your next purchase. Thanks for being a valued customer!",
            "Simply recommend us to a friend this week.",
        )
    return (
        f"Hey {{name}} \U0001F49B We miss you! Come see what's new at the shop "
        "— there's something special waiting for you.",
        "We can't wait to welcome you back.",
    )


def generate_campaign(business, campaign_type, tone, product_name=None, customers=None):
    """Return a ready-to-copy message list (optionally personalized per customer)."""
    tone = tone if tone in TONES else 'friendly'
    campaign_type = campaign_type if campaign_type in dict(CAMPAIGN_TYPES) else 'general'
    body, cta = _templates(campaign_type, tone, product_name)

    result = {
        'campaign_type': campaign_type,
        'campaign_type_label': dict(CAMPAIGN_TYPES)[campaign_type],
        'tone': tone,
        'cta': cta,
        'template': body,
        'messages': [],
        'llm_enhanced': False,
    }

    if customers:
        for c in customers:
            result['messages'].append({
                'customer_id': c['id'],
                'name': c['name'],
                'phone': c['phone'],
                'message': body.format(name=c['name'].split()[0]),
                'wa_link': _wa_link(c['phone'], body.format(name=c['name'].split()[0])),
            })
    else:
        result['messages'].append({
            'customer_id': None,
            'name': '{name}',
            'phone': '',
            'message': body,
            'wa_link': '',
        })

    # Optional LLM enhancement
    if settings.LLM_API_KEY:
        try:
            enhanced = _llm_campaign(campaign_type, tone, product_name, business)
            if enhanced:
                result['llm_enhanced'] = True
                for m in result['messages']:
                    m['message'] = enhanced.format(name=m['name'])
        except Exception as exc:  # pragma: no cover
            logger.warning('LLM campaign generation failed: %s', exc)

    return result


def _llm_campaign(campaign_type, tone, product_name, business):
    from openai import OpenAI

    kwargs = {'api_key': settings.LLM_API_KEY}
    if settings.LLM_BASE_URL:
        kwargs['base_url'] = settings.LLM_BASE_URL
    client = OpenAI(**kwargs)

    o = analytics.overview(business, '30d')
    product_hint = product_name or (
        o['best_products'][0]['product'] if o['best_products'] else ''
    )
    system = (
        "You write WhatsApp marketing messages for Nigerian small businesses. "
        "The customer is a real person the owner knows. Write one short, friendly "
        "WhatsApp message in English with light emoji. Use {name} as a placeholder "
        "for the customer's first name. Under 60 words. Return ONLY the message text."
    )
    user = (
        f"Campaign type: {dict(CAMPAIGN_TYPES)[campaign_type]}. "
        f"Tone: {tone}. " + (f"Product/service: {product_hint}. " if product_hint else '')
        + "Write the message."
    )
    response = client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ],
        temperature=0.8,
        max_tokens=150,
    )
    return response.choices[0].message.content.strip()


def _normalize_phone(phone):
    """Convert a stored phone number to international format for wa.me.

    Nigerian local numbers (0803...) become 234803...
    """
    digits = ''.join(ch for ch in phone if ch.isdigit())
    if digits.startswith('234'):
        return digits
    if digits.startswith('0'):
        return '234' + digits[1:]
    if len(digits) == 10:
        return '234' + digits
    return digits


def _wa_link(phone, message):
    if not phone:
        return ''
    from urllib.parse import quote

    return f'https://wa.me/{_normalize_phone(phone)}?text={quote(message)}'
