from django.contrib import admin
from .models import VolunteerDonor, EmergencyRequest
from .models import (
    #BloodDonation,
    #BloodRequest,
    #BloodStock,
    #Donation,
    #DonorRegistry,
    #Donor,
    Hospital,
    NGOProfile,
    PatientProfile,
    Referral,
    ReferralNetwork,
    ReferralStatusUpdate,
    #TransferLog,
    Workshop,
    WorkshopRegistration,
    VolunteerDonor,
    #EmergencyRequest,
    Notification,
    SOSRequest,
    BloodMatch,
    ActivityLog
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

@admin.register(VolunteerDonor)
class VolunteerDonorAdmin(admin.ModelAdmin):
    list_display = ('name', 'blood_group', 'phone', 'is_available')
    list_filter = ('blood_group', 'is_available')

@admin.register(SOSRequest) # Yahan SOSRequest likho
class SOSRequestAdmin(admin.ModelAdmin):
    list_display = ('hospital_name', 'blood_group', 'units_required', 'status', 'created_at')
    list_filter = ('status', 'blood_group')

admin.site.register(Notification)

admin.site.register(BloodMatch)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('message', 'created_at')
    list_filter = ('created_at',)