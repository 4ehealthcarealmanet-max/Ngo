from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Donation, Donor


class Command(BaseCommand):
    help = "Remove seeded/demo donor & donation rows (keeps real user-entered data)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be deleted without deleting.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        dry_run: bool = bool(options.get("dry_run"))

        demo_donations = Donation.objects.filter(
            notes__iexact="Seeded demo donation.",
            donor__email__iendswith="@example.com",
        )
        donation_ids = list(demo_donations.values_list("id", flat=True))

        demo_donors = Donor.objects.filter(email__iendswith="@example.com")
        donor_ids = list(demo_donors.values_list("id", flat=True))

        self.stdout.write(f"Found demo donations: {donation_ids}")
        self.stdout.write(f"Found demo donors: {donor_ids}")

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry run: no deletions performed."))
            return

        deleted_donations = demo_donations.delete()[0]
        self.stdout.write(self.style.SUCCESS(f"Deleted donations: {deleted_donations}"))

        # Delete donors only if they no longer have donations
        demo_donors = Donor.objects.filter(email__iendswith="@example.com", donations__isnull=True)
        deleted_donors = demo_donors.delete()[0]
        self.stdout.write(self.style.SUCCESS(f"Deleted donors: {deleted_donors}"))

