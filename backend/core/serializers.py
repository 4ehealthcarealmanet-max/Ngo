from django.db.models import Sum
from django.db import transaction
from rest_framework import serializers
from rest_framework import generics

from .models import (
    #BloodDonation,
    #BloodStock,
    Hospital,
    #Donation,
    #Donor,
    #DonorRegistry,
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
    SOSRequest,
    Notification,
    BloodMatch
    
)


class NGOProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGOProfile
        fields = "__all__"
        extra_kwargs = {
            # Admin onboarding UI doesn't ask for govt registration id; auto-generate if omitted.
            "registration_number": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        registration_number = validated_data.get("registration_number")
        if not registration_number or not str(registration_number).strip():
            # Auto-generate a unique registration number if not provided.
            # Example: NGO-20260401-1A2B3C
            import secrets
            from django.utils import timezone

            validated_data["registration_number"] = f"NGO-{timezone.now():%Y%m%d}-{secrets.token_hex(3).upper()}"

        return super().create(validated_data)


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = "__all__"


class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        image_url = (data.get("image_url") or "").strip()
        if image_url:
            return data

        title = (data.get("title") or "").strip().lower()
        if title == "adolescent mental health & wellness workshop":
            data["image_url"] = "/AdolescentMentalHealth.png"

        return data


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = "__all__"


class ReferralSerializer(serializers.ModelSerializer):
    to_hospital_details = HospitalSerializer(source="to_hospital", read_only=True)
    patient_details = PatientProfileSerializer(source="patient", read_only=True)
    from_ngo_details = NGOProfileSerializer(source="from_ngo", read_only=True)

    class Meta:
        model = Referral
        fields = "__all__"

    def validate_status(self, value):
        if not isinstance(value, str):
            return value

        normalized = value.strip().lower()
        mapping = {
            "pending": Referral.STATUS_PENDING,
            "accepted": Referral.STATUS_ACCEPTED,
            "treatment started": Referral.STATUS_TREATMENT_STARTED,
            "completed": Referral.STATUS_COMPLETED,
        }
        return mapping.get(normalized, value)

    def validate_urgency(self, value):
        if not isinstance(value, str):
            return value

        normalized = value.strip().lower()
        mapping = {
            "normal": Referral.URGENCY_NORMAL,
            "emergency": Referral.URGENCY_EMERGENCY,
        }
        return mapping.get(normalized, value)


class ReferralStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralStatusUpdate
        fields = "__all__"


class ReferralNetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralNetwork
        fields = "__all__"

    def validate_status(self, value):
        if not isinstance(value, str):
            return value

        normalized = value.strip().lower()
        mapping = {
            "request sent": "Request Sent",
            "bed reserved": "Bed Reserved",
            "appointment fixed": "Appointment Fixed",
            "closed": "Closed",
            "active": "Active",
            "pending": "Pending",
        }
        return mapping.get(normalized, value)

class WorkshopRegistrationSerializer(serializers.ModelSerializer):
    workshop_details = WorkshopSerializer(source="workshop", read_only=True)
    id_proof_url = serializers.SerializerMethodField()
    id_proof_name = serializers.SerializerMethodField()
    id_proof_size = serializers.SerializerMethodField()

    class Meta:
        model = WorkshopRegistration
        fields = "__all__"

    def validate_status(self, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value

    def get_id_proof_url(self, obj: WorkshopRegistration):
        if not obj.id_proof:
            return None

        try:
            url = obj.id_proof.url
        except Exception:
            return None

        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_id_proof_name(self, obj: WorkshopRegistration):
        if not obj.id_proof:
            return None
        try:
            return obj.id_proof.name.split("/")[-1]
        except Exception:
            return None

    def get_id_proof_size(self, obj: WorkshopRegistration):
        if not obj.id_proof:
            return None
        try:
            return obj.id_proof.size
        except Exception:
            return None

class VolunteerDonorSerializer(serializers.ModelSerializer):
    # Match History table ke liye
    donor_name = serializers.CharField(source='name', read_only=True)
    
    # Proximity Volunteers card ke liye (Wapas add karein)
    name = serializers.CharField()
    
    reference_id = serializers.SerializerMethodField()
    hospital_name = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()
    volume = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerDonor
        # 'name' ko fields list mein shamil rakhein
        fields = [
            'id', 'name', 'reference_id', 'donor_name', 
            'blood_group', 'hospital_name', 'units', 'volume', 'status'
        ]

    def get_reference_id(self, obj):
        return f"VOL-{obj.id}"

    def get_hospital_name(self, obj):
        return getattr(obj, 'hospital_name', f"{obj.city} Hospital")

    def get_units(self, obj):
        # Yahan sirf number return karein
        return getattr(obj, 'units', 1) 

    def get_volume(self, obj):
        # Match History ke Units column ke liye
        return getattr(obj, 'units', 1)

    


class SOSRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSRequest
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    # In lines se donor ka naam aur phone number bhi API mein dikhne lagega
    donor_name = serializers.ReadOnlyField(source='donor.name')
    #donor_phone = serializers.ReadOnlyField(source='donor.phone')
    hospital_name = serializers.ReadOnlyField(source='sos_request.hospital_name')

    class Meta:
        model = Notification
        fields = '__all__'

class BloodMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodMatch
        fields = '__all__'

class LiveTrackingAPI(generics.ListAPIView):
    # Ensure karein ki ye sahi model se data la raha h
    queryset = VolunteerDonor.objects.all() 
    serializer_class = VolunteerDonorSerializer