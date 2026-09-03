from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import service


class AskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        business = request.user.businesses.first()
        if not business:
            return Response({'error': 'No business found'}, status=400)

        question = (request.data.get('question') or '').strip()
        if not question:
            return Response({'error': 'Question is required.'}, status=400)

        # Reserve the query slot atomically (check + record under a row lock)
        # so concurrent requests can't exceed the monthly cap.
        with transaction.atomic():
            locked_user = get_user_model().objects.select_for_update().get(
                pk=request.user.pk
            )
            remaining = service.AIBudget.remaining(locked_user)
            if remaining <= 0:
                return Response(
                    {'error': 'You have used all your AI questions for this month.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            service.AIBudget.record(locked_user, question)

        result = service.ask_question(business, question)
        return Response({
            'answer': result['answer'],
            'question': question,
            'remaining_queries': max(remaining - 1, 0),
        })


class InsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        business = request.user.businesses.first()
        if not business:
            return Response({'error': 'No business found'}, status=400)
        return Response(service.generate_insights(business))
