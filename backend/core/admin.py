from django.contrib import admin

from .models import (
    BloodDonation,
    BloodRequest,
    BloodStock,
    Donation,
    DonorRegistry,
    Donor,
    Hospital,
    NGOProfile,
    PatientProfile,
    Referral,
    ReferralNetwork,
    ReferralStatusUpdate,
    TransferLog,
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
    list_display = ("title", "ngo", "expert_name", "date", "is_open", "image_url", "latitude", "longitude")
    list_filter = ("is_open", "date", "ngo")
    search_fields = ("title", "expert_name")
    list_editable = ("is_open", "image_url", "latitude", "longitude")


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


@admin.register(BloodStock)
class BloodStockAdmin(admin.ModelAdmin):
    list_display = ("blood_group", "units_available", "total_donated", "last_updated")
    list_filter = ("blood_group",)
    search_fields = ("blood_group",)


@admin.register(DonorRegistry)
class DonorRegistryAdmin(admin.ModelAdmin):
    list_display = ("name", "blood_group", "status", "last_donation_date", "created_at")
    list_filter = ("blood_group", "status")
    search_fields = ("name", "contact")


@admin.register(BloodDonation)
class BloodDonationAdmin(admin.ModelAdmin):
    list_display = ("donor", "blood_group", "units_donated", "donated_at")
    list_filter = ("blood_group", "donated_at")
    search_fields = ("donor__name",)


@admin.register(TransferLog)
class TransferLogAdmin(admin.ModelAdmin):
    list_display = ("destination_hospital", "blood_group", "units_transferred", "status", "timestamp")
    list_filter = ("blood_group", "status", "timestamp")
    search_fields = ("destination_hospital", "rider_contact")


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ("patient_name", "hospital_name", "blood_group", "units_required", "status", "created_at")
    list_filter = ("blood_group", "status", "created_at")
    search_fields = ("patient_name", "hospital_name")
