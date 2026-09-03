"""AI Business Advisor.

Architecture (per PRD):
    Business Database -> Analytics Engine -> Structured Data -> LLM -> Insight

The analytics engine always computes the numbers; the LLM explains them.
If no LLM key is configured (or the call fails), a rule-based explainer
answers using the same structured data — keeping the product usable at ₦0.
"""

import json
import logging

from django.conf import settings
from django.utils import timezone

from analytics import service as analytics

logger = logging.getLogger(__name__)


def _build_context(business):
    """Structured snapshot of the business the AI reasons over."""
    overview = analytics.overview(business, '30d')
    breakdown = analytics.expense_breakdown(business, '30d')
    products = analytics.product_performance(business, '30d')
    segments = analytics.customer_segments(business)
    return {
        'overview': overview,
        'expense_breakdown': breakdown,
        'top_products': products[:5],
        'customer_segments': segments,
    }


def _llm_client():
    if not settings.LLM_API_KEY:
        return None
    kwargs = {'api_key': settings.LLM_API_KEY}
    if settings.LLM_BASE_URL:
        kwargs['base_url'] = settings.LLM_BASE_URL
    try:
        from openai import OpenAI

        return OpenAI(**kwargs)
    except Exception:  # pragma: no cover
        return None


def _llm_explain(question, context):
    client = _llm_client()
    if client is None:
        return None
    system = (
        "You are a business advisor for Nigerian SME owners. The user is not an "
        "accountant or analyst. Answer in clear, plain language. Base every claim "
        "strictly on the provided data — never invent numbers. If the data cannot "
        "answer the question, say so and suggest what data to record. Keep answers "
        "under 150 words. End with one practical recommendation when possible."
    )
    payload = json.dumps(context)
    try:
        response = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {'role': 'system', 'content': system},
                {
                    'role': 'user',
                    'content': (
                        f'Business data (JSON): {payload}\n\n'
                        f'Question: {question}'
                    ),
                },
            ],
            temperature=0.3,
            max_tokens=500,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:  # pragma: no cover
        logger.warning('LLM call failed: %s', exc)
        return None


def _fmt_ngn(value):
    return f'₦{value:,.2f}'


def _rule_answer(question, context):
    """Plain-language explanation generated from computed metrics."""
    o = context['overview']
    trends = o['trends']
    lines = []
    rev = o['revenue']
    exp = o['expenses']
    profit = o['profit']

    if rev == 0 and exp == 0:
        return (
            "You don't have enough data yet. Record your sales and expenses for at "
            "least a few days, then I can give you a real picture of your business."
        )

    q = question.lower()

    NON_BUSINESS = [
        'president', 'minister', 'government', 'weather', 'football', 'match',
        'movie', 'song', 'capital of', 'population', 'election', 'who won',
        'celebrity', 'history',
    ]
    if any(w in q for w in NON_BUSINESS):
        return (
            "I can only answer questions about your business data — sales, "
            "expenses, profit, customers, and products. Ask me something like "
            "\u201cWhy did my profit drop?\u201d or \u201cWho are my inactive customers?\u201d"
        )

    if any(w in q for w in ['profit', 'decreas', 'declin', 'drop']):
        lines.append(
            f"Profit for the period is {_fmt_ngn(profit)} "
            f"(revenue {_fmt_ngn(rev)} minus expenses {_fmt_ngn(exp)})."
        )
        c = trends['profit_change']
        if c is not None and c < 0:
            lines.append(f"That's down {abs(c)}% vs the previous period.")
        rev_c = trends['revenue_change']
        exp_c = trends['expenses_change']
        if rev_c is not None and exp_c is not None and exp_c > 0 and rev_c <= 0:
            lines.append(
                f"Revenue fell {abs(rev_c)}% while expenses rose {exp_c}% — "
                "the gap between them is why profit dropped."
            )
        elif exp_c is not None and exp_c > 0:
            lines.append(f"Expenses rose {exp_c}%, which ate into profit.")
        top_exp = context['expense_breakdown'][:1]
        if top_exp:
            lines.append(
                f"Your biggest expense was {top_exp[0]['label']} "
                f"({_fmt_ngn(top_exp[0]['amount'])}). "
                "Reviewing it is the fastest lever on profit."
            )
    elif any(w in q for w in ['expense', 'money', 'spend']):
        lines.append(f"Total expenses: {_fmt_ngn(exp)}.")
        if context['expense_breakdown']:
            lines.append(
                "Where the money goes: "
                + ', '.join(
                    f"{b['label']} {_fmt_ngn(b['amount'])}"
                    for b in context['expense_breakdown'][:4]
                )
            )
    elif any(w in q for w in ['best', 'top', 'product', 'sell']):
        if context['top_products']:
            lines.append("Your best-selling products by revenue:")
            for i, p in enumerate(context['top_products'][:3], 1):
                lines.append(
                    f"{i}. {p['product']} — {_fmt_ngn(p['revenue'])} "
                    f"({p['units_sold']} units)"
                )
        else:
            lines.append("No product sales recorded yet. Add products and sales to see this.")
    elif any(w in q for w in ['customer', 'retain', 'repeat', 'who spent', 'spent the most']):
        seg = context['customer_segments']
        lines.append(
            f"You have {seg['inactive']['count']} inactive, "
            f"{seg['at_risk']['count']} at-risk, and "
            f"{seg['active']['count']} active customers."
        )
        if seg['inactive']['count']:
            lines.append(
                f"Inactive customers previously spent {_fmt_ngn(seg['inactive']['total_spent'])} "
                "in total — re-engaging them is a real growth opportunity."
            )
    elif any(w in q for w in ['increase', 'grow', 'more sale', 'improv', 'focus']):
        if context['top_products']:
            top = context['top_products'][0]
            lines.append(
                f"Your top product is {top['product']} at "
                f"{_fmt_ngn(top['revenue'])}. Stocking and promoting it further is your "
                "most reliable growth lever."
            )
        seg = context['customer_segments']
        if seg['inactive']['count']:
            lines.append(
                f"Also, {seg['inactive']['count']} inactive customers are worth a "
                "re-engagement campaign this month."
            )
    else:
        lines.append(
            f"In the last 30 days: revenue {_fmt_ngn(rev)}, expenses "
            f"{_fmt_ngn(exp)}, profit {_fmt_ngn(profit)} "
            f"(margin {o['profit_margin']}%)."
        )
        if trends['revenue_change']:
            lines.append(
                f"Revenue is {('up' if trends['revenue_change'] > 0 else 'down')} "
                f"{abs(trends['revenue_change'])}% vs the previous period."
            )

    return ' '.join(lines)


def ask_question(business, question):
    context = _build_context(business)
    answer = _llm_explain(question, context) or _rule_answer(question, context)
    return {'answer': answer, 'context': context}


def generate_insights(business):
    """Proactive, rule-based insights surfaced on the dashboard."""
    o = analytics.overview(business, '30d')
    insights = []
    t = o['trends']

    if o['revenue'] == 0 and o['expenses'] == 0:
        insights.append({
            'type': 'onboarding',
            'title': 'Welcome! Start recording',
            'message': 'Record your first sale and expense to unlock your business report.',
        })
        return insights

    if t['revenue_change'] is not None and abs(t['revenue_change']) >= 5:
        insights.append({
            'type': 'opportunity' if t['revenue_change'] > 0 else 'warning',
            'title': f'Revenue {("up" if t["revenue_change"] > 0 else "down")} {abs(t["revenue_change"])}%',
            'message': (
                f'Your revenue is {_fmt_ngn(o["revenue"])} this period, '
                f'{("up" if t["revenue_change"] > 0 else "down")} {abs(t["revenue_change"])}% '
                'compared with the previous period.'
            ),
        })

    if t['expenses_change'] is not None and t['expenses_change'] >= 5:
        insights.append({
            'type': 'warning',
            'title': f'Expenses up {t["expenses_change"]}%',
            'message': 'Your expenses are rising faster than before. Review the biggest categories.',
        })

    if t['profit_change'] is not None and t['profit_change'] < 0:
        insights.append({
            'type': 'warning',
            'title': 'Profit is falling',
            'message': (
                f'Profit dropped {abs(t["profit_change"])}% this period. '
                'Ask the AI advisor to explain why.'
            ),
        })

    if o['best_products']:
        top = o['best_products'][0]
        share = round(top['revenue'] / o['revenue'] * 100, 1) if o['revenue'] else 0
        if share >= 30:
            insights.append({
                'type': 'opportunity',
                'title': f'{top["product"]} carries your business',
                'message': (
                    f'Your top product generated {share}% of revenue this period. '
                    'Make sure it stays stocked.'
                ),
            })

    if o['inactive_customers'] >= 5:
        insights.append({
            'type': 'customer',
            'title': f'{o["inactive_customers"]} customers are inactive',
            'message': (
                'These customers have not bought in over 60 days. '
                'A re-engagement campaign could bring them back.'
            ),
        })

    return insights


class AIBudget:
    """Simple monthly query cap per user (Free = 5)."""

    @staticmethod
    def free_monthly():
        # Read lazily so changes to AI_FREE_MONTHLY_QUERIES apply without a
        # process restart.
        return int(getattr(settings, 'AI_FREE_MONTHLY_QUERIES', 5))

    @classmethod
    def remaining(cls, user):
        start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        from ai_advisor.models import AIQuery

        used = AIQuery.objects.filter(user=user, created_at__gte=start).count()
        return max(cls.free_monthly() - used, 0)

    @staticmethod
    def record(user, question=''):
        from ai_advisor.models import AIQuery

        AIQuery.objects.create(user=user, question=question)
