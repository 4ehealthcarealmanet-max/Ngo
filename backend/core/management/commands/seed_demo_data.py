from __future__ import annotations

from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Donation, Donor, NGOProfile, PatientProfile, Workshop


class Command(BaseCommand):
    help = "Seed (or restore) demo NGO + Workshop + optional patient/donation data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--with-donation",
            action="store_true",
            help="Also seed a demo donor + donation (David Roy).",
        )
        parser.add_argument(
            "--with-patient",
            action="store_true",
            help="Also seed a demo patient profile.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        ngo, ngo_created = NGOProfile.objects.get_or_create(
            registration_number="MP/IND/2026/001",
            defaults={
                "name": "Indore Care Foundation",
                "city": "Indore",
                "service_type": "General Healthcare",
                "is_verified": True,
                "contact_email": "",
                "contact_person": "",
            },
        )

        if not ngo_created:
            changed = False
            if ngo.name != "Indore Care Foundation":
                ngo.name = "Indore Care Foundation"
                changed = True
            if ngo.city != "Indore":
                ngo.city = "Indore"
                changed = True
            if ngo.service_type != "General Healthcare":
                ngo.service_type = "General Healthcare"
                changed = True
            if ngo.is_verified is not True:
                ngo.is_verified = True
                changed = True
            if changed:
                ngo.save()

        workshop, workshop_created = Workshop.objects.get_or_create(
            ngo=ngo,
            title="Maternal Health & Nutrition Workshop",
            date=date(2026, 4, 10),
            defaults={
                "expert_name": "Dr. Anjali Mehta",
                "description": (
                    "Join us for an interactive session with Dr. Anjali Mehta. "
                    "We will cover prenatal nutrition, mental well-being, and provide free health kits to all attendees."
                ),
                "is_open": True,
                "latitude": "22.719600",
                "longitude": "75.857700",
            },
        )

        if not workshop_created:
            changed = False
            if workshop.expert_name != "Dr. Anjali Mehta":
                workshop.expert_name = "Dr. Anjali Mehta"
                changed = True
            if workshop.is_open is not True:
                workshop.is_open = True
                changed = True
            if str(workshop.latitude or "") != "22.719600":
                workshop.latitude = "22.719600"
                changed = True
            if str(workshop.longitude or "") != "75.857700":
                workshop.longitude = "75.857700"
                changed = True
            if changed:
                workshop.save()

        dewas_ngo, dewas_ngo_created = NGOProfile.objects.get_or_create(
            registration_number="MP/DWS/2026/001",
            defaults={
                "name": "Dewas Rural Welfare Society",
                "city": "Dewas",
                "service_type": "Mental Health & Community Wellness",
                "is_verified": True,
                "contact_email": "",
                "contact_person": "",
            },
        )

        if not dewas_ngo_created:
            changed = False
            if dewas_ngo.name != "Dewas Rural Welfare Society":
                dewas_ngo.name = "Dewas Rural Welfare Society"
                changed = True
            if dewas_ngo.city != "Dewas":
                dewas_ngo.city = "Dewas"
                changed = True
            if dewas_ngo.service_type != "Mental Health & Community Wellness":
                dewas_ngo.service_type = "Mental Health & Community Wellness"
                changed = True
            if dewas_ngo.is_verified is not True:
                dewas_ngo.is_verified = True
                changed = True
            if changed:
                dewas_ngo.save()

        dewas_workshop, dewas_workshop_created = Workshop.objects.get_or_create(
            ngo=dewas_ngo,
            title="Adolescent Mental Health & Wellness Workshop",
            date=date(2026, 4, 20),
            defaults={
                "expert_name": "Dr. Riya Sharma",
                "description": (
                    "A community workshop focused on adolescent mental health, stress management, and wellness practices. "
                    "Open for students, parents, and volunteers."
                ),
                "full_description": (
                    "This workshop covers common adolescent mental health challenges, early warning signs, and practical tools "
                    "for resilience. Participants will learn breathing techniques, daily routines for well-being, and how to access "
                    "local support resources."
                ),
                "image_url": "/AdolescentMentalHealth.png",
                "is_open": True,
                "latitude": "22.967600",
                "longitude": "76.053400",
            },
        )

        if not dewas_workshop_created:
            changed = False
            if dewas_workshop.expert_name != "Dr. Riya Sharma":
                dewas_workshop.expert_name = "Dr. Riya Sharma"
                changed = True
            if not (dewas_workshop.description or "").strip():
                dewas_workshop.description = (
                    "A community workshop focused on adolescent mental health, stress management, and wellness practices. "
                    "Open for students, parents, and volunteers."
                )
                changed = True
            if not (dewas_workshop.full_description or "").strip():
                dewas_workshop.full_description = (
                    "This workshop covers common adolescent mental health challenges, early warning signs, and practical tools "
                    "for resilience. Participants will learn breathing techniques, daily routines for well-being, and how to access "
                    "local support resources."
                )
                changed = True
            if (dewas_workshop.image_url or "").strip() != "/AdolescentMentalHealth.png":
                dewas_workshop.image_url = "/AdolescentMentalHealth.png"
                changed = True
            if dewas_workshop.is_open is not True:
                dewas_workshop.is_open = True
                changed = True
            if str(dewas_workshop.latitude or "") != "22.967600":
                dewas_workshop.latitude = "22.967600"
                changed = True
            if str(dewas_workshop.longitude or "") != "76.053400":
                dewas_workshop.longitude = "76.053400"
                changed = True
            if changed:
                dewas_workshop.save()

        if options.get("with_patient"):
            patient, _ = PatientProfile.objects.get_or_create(
                patient_id="MB-2026-X99",
                defaults={
                    "ngo": ngo,
                    "full_name": "Demo Patient",
                    "blood_group": "B+",
                    "contact_number": "9999999999",
                },
            )
            if patient.ngo_id != ngo.id:
                patient.ngo = ngo
                patient.save(update_fields=["ngo"])

        if options.get("with_donation"):
            donor = Donor.objects.filter(name__iexact="David Roy").order_by("id").first()
            if donor is None:
                donor, _ = Donor.objects.get_or_create(
                    email="david.roy@example.com",
                    defaults={
                        "name": "David Roy",
                        "phone": "",
                        "donor_type": Donor.TYPE_INDIVIDUAL,
                    },
                )

            Donation.objects.get_or_create(
                donor=donor,
                amount="5000.00",
                purpose=Donation.PURPOSE_NGO_SUPPORT,
                ngo=ngo,
                defaults={
                    "donation_type": Donation.TYPE_ONE_TIME,
                    "notes": "Seeded demo donation.",
                },
            )

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write(f"NGO: {ngo.name} (id={ngo.id})")
        self.stdout.write(
            f"Workshop: {workshop.title} (id={workshop.id}) lat={workshop.latitude} lng={workshop.longitude} is_open={workshop.is_open}"
        )
        self.stdout.write(f"NGO: {dewas_ngo.name} (id={dewas_ngo.id})")
        self.stdout.write(
            f"Workshop: {dewas_workshop.title} (id={dewas_workshop.id}) lat={dewas_workshop.latitude} lng={dewas_workshop.longitude} image_url={dewas_workshop.image_url} is_open={dewas_workshop.is_open}"
        )
