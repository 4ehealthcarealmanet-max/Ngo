from django.contrib import admin

from .models import (
    Donation,
    Donor,
    Hospital,
    NGOProfile,
    PatientProfile,
    Referral,
    ReferralNetwork,
    ReferralStatusUpdate,
    Workshop,
    WorkshopRegistration,
)

@admin.register(NGOProfile)
class NGOProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'service_type', 'is_verified')
    list_filter = ('is_verified', 'city')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ("patient_id", "full_name", "blood_group", "ngo", "created_at")
    list_filter = ("blood_group", "ngo")
    search_fields = ("patient_id", "full_name")


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ("title", "ngo", "expert_name", "date", "is_open", "latitude", "longitude")
    list_filter = ("is_open", "date", "ngo")
    search_fields = ("title", "expert_name")
    list_editable = ("is_open", "latitude", "longitude")


@admin.register(ReferralNetwork)
class ReferralNetworkAdmin(admin.ModelAdmin):
    list_display = ("source_ngo", "target_hospital", "specialty_required", "status", "created_at")
    list_filter = ("status", "source_ngo")
    search_fields = ("target_hospital", "specialty_required")


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "specialty", "contact")
    list_filter = ("specialty", "location")
    search_fields = ("name", "location", "specialty")


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ("referral_id", "patient", "from_ngo", "to_hospital", "urgency", "status", "created_at")
    list_filter = ("status", "urgency", "from_ngo", "to_hospital", "created_at")
    search_fields = ("referral_id", "patient__full_name", "patient__patient_id", "to_hospital__name")


@admin.register(ReferralStatusUpdate)
class ReferralStatusUpdateAdmin(admin.ModelAdmin):
    list_display = ("referral", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("referral__referral_id",)


@admin.register(WorkshopRegistration)
class WorkshopRegistrationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email_or_phone", "role", "status", "workshop", "registered_at")
    list_filter = ("role", "status", "workshop", "registered_at")
    search_fields = ("full_name", "email_or_phone")


@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "donor_type", "created_at")
    list_filter = ("donor_type", "created_at")
    search_fields = ("name", "email", "phone")


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ("donor", "amount", "donation_type", "purpose", "ngo", "workshop", "date", "transaction_id")
    list_filter = ("donation_type", "purpose", "date")
    search_fields = ("donor__name", "donor__email", "transaction_id")
