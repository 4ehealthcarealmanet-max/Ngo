import secrets

from django.db import models
from django.utils import timezone


def generate_referral_id():
    # Example: REF-20260331-1A2B3C
    return f"REF-{timezone.now():%Y%m%d}-{secrets.token_hex(3).upper()}"

class NGOProfile(models.Model):
    name = models.CharField(max_length=255) # NGO Name
    registration_number = models.CharField(max_length=100, unique=True) # Govt ID
    contact_email = models.EmailField(blank=True)
    contact_person = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=100) # Location
    service_type = models.CharField(max_length=200) # Specialist area
    is_verified = models.BooleanField(default=False) # Admin check

    class Meta:
        db_table = "NGO_NGOProfiles"
        verbose_name = "NGO Profile"
        verbose_name_plural = "NGO Profiles"

    def __str__(self):
        return self.name


class PatientProfile(models.Model):
    ngo = models.ForeignKey(NGOProfile, on_delete=models.CASCADE, related_name="patients")
    patient_id = models.CharField(max_length=20, unique=True)  # e.g., MB-2026-X99
    full_name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=5)
    contact_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "NGO_PatientProfiles"
        verbose_name = "NGO Patient Profile"
        verbose_name_plural = "NGO Patient Profiles"

    def __str__(self):
        return f"{self.full_name} ({self.patient_id})"


class Workshop(models.Model):
    ngo = models.ForeignKey(NGOProfile, on_delete=models.CASCADE, related_name="workshops")
    title = models.CharField(max_length=200)
    expert_name = models.CharField(max_length=100)
    date = models.DateField()
    description = models.TextField()
    full_description = models.TextField(blank=True, default="")
    image_url = models.CharField(max_length=500, blank=True, default="")
    is_open = models.BooleanField(default=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        db_table = "NGO_Workshops"
        verbose_name = "NGO Workshop"
        verbose_name_plural = "NGO Workshops"

    def __str__(self):
        return self.title


class ReferralNetwork(models.Model):
    # New referral workflow stages (for tracking / stepper UI)
    STATUS_REQUEST_SENT = "Request Sent"
    STATUS_BED_RESERVED = "Bed Reserved"
    STATUS_APPOINTMENT_FIXED = "Appointment Fixed"

    # Legacy values (kept for backward compatibility with existing data)
    STATUS_ACTIVE = "Active"
    STATUS_PENDING = "Pending"

    STATUS_CLOSED = "Closed"

    STATUS_CHOICES = [
        (STATUS_REQUEST_SENT, "Request Sent"),
        (STATUS_BED_RESERVED, "Bed Reserved"),
        (STATUS_APPOINTMENT_FIXED, "Appointment Fixed"),
        (STATUS_CLOSED, "Closed"),
        (STATUS_ACTIVE, "Active (Legacy)"),
        (STATUS_PENDING, "Pending (Legacy)"),
    ]

    source_ngo = models.ForeignKey(NGOProfile, on_delete=models.CASCADE, related_name="referrals")
    target_hospital = models.CharField(max_length=255)
    specialty_required = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=STATUS_REQUEST_SENT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "NGO_ReferralNetworks"
        verbose_name = "NGO Referral Network"
        verbose_name_plural = "NGO Referral Networks"

    def __str__(self):
        return f"{self.source_ngo.name} -> {self.target_hospital}"


class Hospital(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    specialty = models.CharField(max_length=100)  # e.g., Cardiology/General
    contact = models.CharField(max_length=100, blank=True)
    beds_available = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "NGO_Hospitals"
        verbose_name = "NGO Hospital"
        verbose_name_plural = "NGO Hospitals"

    def __str__(self):
        return f"{self.name} ({self.location})"


class Referral(models.Model):
    STATUS_PENDING = "Pending"
    STATUS_ACCEPTED = "Accepted"
    STATUS_TREATMENT_STARTED = "Treatment Started"
    STATUS_COMPLETED = "Completed"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_TREATMENT_STARTED, "Treatment Started"),
        (STATUS_COMPLETED, "Completed"),
    ]

    URGENCY_NORMAL = "Normal"
    URGENCY_EMERGENCY = "Emergency"

    URGENCY_CHOICES = [
        (URGENCY_NORMAL, "Normal"),
        (URGENCY_EMERGENCY, "Emergency"),
    ]

    referral_id = models.CharField(max_length=20, unique=True, default=generate_referral_id, editable=False, db_index=True)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name="referrals")
    from_ngo = models.ForeignKey(NGOProfile, on_delete=models.CASCADE, related_name="sent_referrals")
    to_hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name="received_referrals")
    reason = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=STATUS_PENDING)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default=URGENCY_NORMAL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "NGO_Referrals"
        verbose_name = "NGO Referral"
        verbose_name_plural = "NGO Referrals"

    def __str__(self):
        return f"{self.referral_id}: {self.from_ngo.name} -> {self.to_hospital.name}"


class ReferralStatusUpdate(models.Model):
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE, related_name="updates")
    status = models.CharField(max_length=50, choices=Referral.STATUS_CHOICES)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "NGO_ReferralStatusUpdates"
        verbose_name = "NGO Referral Status Update"
        verbose_name_plural = "NGO Referral Status Updates"

    def __str__(self):
        return f"{self.referral.referral_id} -> {self.status}"


class WorkshopRegistration(models.Model):
    ROLE_CHOICES = [
        ('patient', 'Patient/Attendee'),
        ('volunteer', 'Volunteer'),
    ]

    STATUS_CHOICES = [
        ("confirmed", "Confirmed"),
        ("verified", "Verified"),
    ]
    
    # Kis workshop ke liye register kar rahe hain
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='registrations')
    
    full_name = models.CharField(max_length=100)
    email_or_phone = models.CharField(max_length=100)
    id_proof = models.FileField(upload_to="ids/", null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="confirmed")
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "NGO_WorkshopRegistrations"
        verbose_name = "NGO Workshop Registration"
        verbose_name_plural = "NGO Workshop Registrations"

    def __str__(self):
        return f"{self.full_name} registered for {self.workshop.title}"


class Donor(models.Model):
    TYPE_INDIVIDUAL = "individual"
    TYPE_CORPORATE = "corporate"

    TYPE_CHOICES = [
        (TYPE_INDIVIDUAL, "Individual"),
        (TYPE_CORPORATE, "Corporate"),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    donor_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_INDIVIDUAL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "NGO_Donors"
        verbose_name = "NGO Donor"
        verbose_name_plural = "NGO Donors"

    def __str__(self):
        return self.name


class Donation(models.Model):
    PURPOSE_WORKSHOP = "workshop"
    PURPOSE_NGO_SUPPORT = "ngo_support"

    PURPOSE_CHOICES = [
        (PURPOSE_WORKSHOP, "Workshop"),
        (PURPOSE_NGO_SUPPORT, "NGO Support"),
    ]

    TYPE_ONE_TIME = "one_time"
    TYPE_MONTHLY = "monthly"

    DONATION_TYPE_CHOICES = [
        (TYPE_ONE_TIME, "One-time"),
        (TYPE_MONTHLY, "Monthly"),
    ]

    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name="donations")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)
    transaction_id = models.CharField(max_length=80, blank=True)
    donation_type = models.CharField(max_length=20, choices=DONATION_TYPE_CHOICES, default=TYPE_ONE_TIME)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default=PURPOSE_WORKSHOP)
    ngo = models.ForeignKey(NGOProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="donations")
    workshop = models.ForeignKey(Workshop, on_delete=models.SET_NULL, null=True, blank=True, related_name="donations")
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "NGO_Donations"
        verbose_name = "NGO Donation"
        verbose_name_plural = "NGO Donations"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.donor.name} - {self.amount}"
