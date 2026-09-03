from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from . import service


class OpportunitiesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        business = request.user.businesses.first()
        if not business:
            return Response({'error': 'No business found'}, status=400)

        try:
            days = int(request.query_params.get('days', 60))
        except (TypeError, ValueError):
            days = 60
        days = max(1, min(days, 365))
        return Response(service.find_opportunities(business, days))


class CampaignView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        business = request.user.businesses.first()
        if not business:
            return Response({'error': 'No business found'}, status=400)

        campaign_type = request.data.get('campaign_type', 'general')
        tone = request.data.get('tone', 'friendly')
        product_name = request.data.get('product_name') or None
        targets = request.data.get('targets', 'all')  # 'all' | 'list'
        customers = None
        if targets == 'list' and request.data.get('customer_ids'):
            ids = request.data['customer_ids']
            # IDs may arrive as ints or strings from JSON; normalize both so
            # a type mismatch can't silently produce an empty campaign.
            try:
                id_set = {int(i) for i in ids}
            except (TypeError, ValueError):
                id_set = set()
            opp = service.find_opportunities(business, 60)
            customers = [c for c in opp['customers'] if c['id'] in id_set]
        else:
            customers = service.find_opportunities(business, 60)['customers']

        result = service.generate_campaign(
            business, campaign_type, tone, product_name, customers
        )
        return Response(result)
