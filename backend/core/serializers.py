from django.db.models import Sum
from django.db import transaction
from rest_framework import serializers

from .models import (
    BloodDonation,
    BloodStock,
    Hospital,
    Donation,
    Donor,
    DonorRegistry,
    NGOProfile,
    PatientProfile,
    Referral,
    ReferralNetwork,
    ReferralStatusUpdate,
    TransferLog,
    Workshop,
    WorkshopRegistration,
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


class DonorSerializer(serializers.ModelSerializer):
    total_donated = serializers.SerializerMethodField()
    last_donation_date = serializers.SerializerMethodField()

    class Meta:
        model = Donor
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "donor_type",
            "created_at",
            "total_donated",
            "last_donation_date",
        ]

    def get_total_donated(self, obj: Donor):
        total = obj.donations.aggregate(total=Sum("amount")).get("total")
        return total

    def get_last_donation_date(self, obj: Donor):
        last = obj.donations.order_by("-date").values_list("date", flat=True).first()
        return last


class DonorMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = ["id", "name", "email", "donor_type"]


class DonationSerializer(serializers.ModelSerializer):
    donor_details = DonorMiniSerializer(source="donor", read_only=True)
    workshop_details = WorkshopSerializer(source="workshop", read_only=True)
    ngo_details = NGOProfileSerializer(source="ngo", read_only=True)

    class Meta:
        model = Donation
        fields = "__all__"


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


class BloodStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodStock
        fields = ["id", "blood_group", "units_available", "total_donated", "last_updated"]
        read_only_fields = ["id", "last_updated"]


class DonorRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorRegistry
        fields = [
            "id",
            "name",
            "blood_group",
            "contact",
            "last_donation_date",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def to_representation(self, instance: DonorRegistry):
        data = super().to_representation(instance)
        request = self.context.get("request")
        is_admin = bool(getattr(request, "user", None) and request.user.is_authenticated and request.user.is_staff)
        if not is_admin:
            data["contact"] = None
        return data


class BloodDonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodDonation
        fields = ["id", "donor", "blood_group", "units_donated", "donated_at"]
        read_only_fields = ["id"]

    def validate_units_donated(self, value: int):
        if value <= 0:
            raise serializers.ValidationError("units_donated must be greater than 0.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        donor: DonorRegistry = validated_data["donor"]
        blood_group = (validated_data.get("blood_group") or donor.blood_group).strip()
        units = validated_data["units_donated"]

        validated_data["blood_group"] = blood_group

        stock, _ = BloodStock.objects.select_for_update().get_or_create(blood_group=blood_group)
        stock.units_available += units
        stock.total_donated += units
        stock.save(update_fields=["units_available", "total_donated", "last_updated"])

        donation: BloodDonation = super().create(validated_data)

        donor.last_donation_date = donation.donated_at.date()
        donor.save(update_fields=["last_donation_date"])

        return donation


class TransferLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransferLog
        fields = [
            "id",
            "units_transferred",
            "destination_hospital",
            "blood_group",
            "timestamp",
            "status",
            "current_lat",
            "current_lng",
            "rider_contact",
        ]
        read_only_fields = ["id", "timestamp"]

    def validate_units_transferred(self, value: int):
        if value <= 0:
            raise serializers.ValidationError("units_transferred must be greater than 0.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        blood_group = (validated_data.get("blood_group") or "").strip()
        units = validated_data["units_transferred"]

        stock, _ = BloodStock.objects.select_for_update().get_or_create(blood_group=blood_group)
        if stock.units_available < units:
            raise serializers.ValidationError(
                {"units_transferred": f"Insufficient stock for {blood_group}. Available: {stock.units_available}."}
            )

        stock.units_available -= units
        stock.save(update_fields=["units_available", "last_updated"])

        return super().create(validated_data)
