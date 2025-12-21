from django.core.management.base import BaseCommand
from accounts.models import Account
import os

class Command(BaseCommand):
    help = "Create a default superuser if it doesn't exist"

    def handle(self, *args, **kwargs):

        email = os.environ.get("DJANGO_SU_EMAIL", "admin@example.com")
        firstname = os.environ.get("DJANGO_SU_FIRSTNAME", "admin@example.com")
        lastname = os.environ.get("DJANGO_SU_LASTNAME", "admin@example.com")
        password = os.environ.get("DJANGO_SU_PASSWORD", "adminpass")

        if not Account.objects.filter(email=email).exists():
            Account.objects.create_superuser(
                first_name = firstname, 
                last_name = lastname, 
                email = email,
                password = password,
                is_active = True,
                is_staff = True
            )
            self.stdout.write(self.style.SUCCESS(f"Superuser '{email}' created."))
        else:
            self.stdout.write(f"Superuser '{email}' already exists.")
