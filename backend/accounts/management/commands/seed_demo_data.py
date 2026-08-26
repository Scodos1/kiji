"""Create a demo account pre-filled with realistic data for tester onboarding.

Usage:
    python manage.py seed_demo_data

Creates (or resets) a demo user with a populated business so testers can
immediately explore the dashboard, analytics, AI advisor and marketing.
"""

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from businesses.models import Business
from customers.models import Customer
from expenses.models import Expense
from products.models import Product
from sales.models import Sale

DEMO_EMAIL = 'demo@kiji.test'
DEMO_PASSWORD = 'DemoPass@2026!'

PRODUCTS = [
    ('Sneakers', '45000', '30000', 40),
    ('Ankara Gown', '28000', '18000', 25),
    ("Men's Shirt", '15000', '9000', 60),
    ('Handbag', '20000', '12000', 30),
    ('Wristwatch', '35000', '22000', 15),
]

CUSTOMERS = [
    ('Amina Bello', '08031000001'),
    ('Chinedu Okafor', '08031000002'),
    ('Funke Adeyemi', '08031000003'),
    ('Ibrahim Musa', '08031000004'),
    ('Ngozi Eze', '08031000005'),
    ('Tunde Bakare', '08031000006'),
    ('Blessing Uche', '08031000007'),
    ('Segun Adebayo', '08031000008'),
    ('Halima Sani', '08031000009'),
    ('Emeka Obi', '08031000010'),
]

PAYMENT_METHODS = ['cash', 'transfer', 'pos']

# (days_ago_start, days_ago_end, amount, category, description)
EXPENSES = [
    (0, 90, 150000, 'rent', 'Shop rent'),
    (0, 90, 45000, 'transportation', 'Delivery to Yaba'),
    (0, 90, 120000, 'salary', 'Sales assistant salary'),
    (0, 90, 80000, 'inventory', 'Stock restock'),
    (0, 90, 25000, 'utilities', 'Electricity & data'),
    (0, 90, 20000, 'marketing', 'Instagram ads'),
]


class Command(BaseCommand):
    help = 'Seed (or reset) a demo account with realistic business data.'

    def handle(self, *args, **options):
        now = timezone.now()

        User.objects.filter(email=DEMO_EMAIL).delete()

        user = User.objects.create_user(
            email=DEMO_EMAIL,
            password=DEMO_PASSWORD,
            username='demo',
            first_name='Demo',
        )
        business = Business.objects.create(
            owner=user,
            name="Aisha's Fashion Store",
            category='fashion',
            location='Lagos',
            currency='NGN',
        )

        products = [Product.objects.create(
            business=business,
            name=name,
            selling_price=selling,
            cost_price=cost,
            stock_quantity=stock,
        ) for name, selling, cost, stock in PRODUCTS]

        customers = [Customer.objects.create(
            business=business, name=name, phone=phone
        ) for name, phone in CUSTOMERS]

        rng = random.Random(42)

        # Customer segmentation demo: 2 lapsed (inactive), 1 at-risk, rest active.
        lapsed = set(customers[:2])
        at_risk = set(customers[2:3])

        # ~150 sales across 90 days: some customers active, some drifting away.
        for _ in range(150):
            product = rng.choice(products)
            customer = rng.choice(customers)
            quantity = rng.randint(1, 3)
            if customer in lapsed:
                offset_days = rng.randint(60, 89)
            elif customer in at_risk:
                offset_days = rng.randint(30, 59)
            else:
                offset_days = rng.randint(0, 89)
            when = now - timedelta(
                days=offset_days,
                hours=rng.randint(9, 20),
                minutes=rng.randint(0, 59),
            )
            Sale.objects.create(
                business=business,
                product=product,
                customer=customer,
                quantity=quantity,
                unit_price=product.selling_price,
                payment_method=rng.choice(PAYMENT_METHODS),
                sale_date=when,
            )

        # Recurring expenses.
        for days_ago, _, amount, category, description in EXPENSES:
            interval = 7 if category in ('transportation', 'marketing') else 30
            if category == 'inventory':
                interval = 14
            offset = days_ago
            while offset <= 90:
                Expense.objects.create(
                    business=business,
                    category=category,
                    amount=amount,
                    description=description,
                    expense_date=now - timedelta(days=offset),
                )
                offset += interval

        self.stdout.write(self.style.SUCCESS('Demo data created.'))
        self.stdout.write(f'  Email:    {DEMO_EMAIL}')
        self.stdout.write(f'  Password: {DEMO_PASSWORD}')
        self.stdout.write(
            '  Login at the app, then explore dashboard, AI advisor and marketing.'
        )
