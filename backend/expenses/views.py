from rest_framework import viewsets

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        business = self.request.user.businesses.first()
        if not business:
            return Expense.objects.none()
        qs = Expense.objects.filter(business=business)
        category = self.request.query_params.get('category')
        expense_date = self.request.query_params.get('expense_date')
        if category:
            qs = qs.filter(category=category)
        if expense_date:
            qs = qs.filter(expense_date__date=expense_date)
        return qs
