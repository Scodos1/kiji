from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import service
from .models import Plan


class UsageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(service.plan_info(request.user))


class PlansView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(service.plan_info(request.user)['plans'])


class InitializeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan = request.data.get('plan', Plan.STARTER)
        if plan not in dict(Plan.choices):
            return Response({'error': 'Invalid plan'}, status=400)
        if plan == Plan.FREE:
            return Response({'error': 'Free plan requires no payment'}, status=400)
        callback_url = request.data.get('callback_url', '')
        data = service.initialize_transaction(request.user, plan, callback_url)
        if not data:
            # No secret configured — return mock for dev/tests
            return Response({
                'authorization_url': f'https://paystack.mock/pay/{plan}?mock=1',
                'reference': f'mock_{request.user.id}_{plan}',
                'mock': True,
            })
        return Response(data)


class VerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        reference = request.data.get('reference', '').strip()
        if not reference:
            return Response({'error': 'reference required'}, status=400)
        # Mock path for dev
        if reference.startswith('mock_'):
            plan = reference.split('_')[-1]
            if plan in dict(Plan.choices):
                sub = service.activate_plan(request.user, plan)
                return Response({'status': 'success', 'plan': sub.plan, 'mock': True})
            return Response({'error': 'invalid mock reference'}, status=400)

        data = service.verify_transaction(reference)
        if not data or data.get('status') != 'success':
            return Response({'error': 'verification failed'}, status=400)
        # Paystack metadata contains chosen plan
        plan = (data.get('metadata') or {}).get('plan') or Plan.STARTER
        sub = service.activate_plan(request.user, plan)
        return Response({'status': 'success', 'plan': sub.plan, 'paystack': data})
