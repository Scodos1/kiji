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

        remaining = service.AIBudget.remaining(request.user)
        if remaining <= 0:
            return Response(
                {'error': 'You have used all your AI questions for this month.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        result = service.ask_question(business, question)
        service.AIBudget.record(request.user, question)
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
