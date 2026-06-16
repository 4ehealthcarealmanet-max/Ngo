import secrets

from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
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




class VolunteerDonor(models.Model):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    phone = models.CharField(max_length=15)
    city = models.CharField(max_length=100, default="Global")
    is_available = models.BooleanField(default=True)
    whatsapp_consent = models.BooleanField(default=False)  # ← ADD
    is_approved = models.BooleanField(default=False)
    email = models.EmailField(blank=True, null=True)
    # --- YEH DO LINES ADD KARNI HAIN ---
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    # ----------------------------------

    hospital_name = models.CharField(max_length=200, blank=True, null=True, default="City Hospital")
    units = models.IntegerField(default=1)
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Transit', 'In Transit'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    mission_started_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.blood_group})"

    def save(self, *args, **kwargs):
        # Mark mission start time the first time donor goes "In Transit"
        if self.status == "In Transit" and self.mission_started_at is None:
            self.mission_started_at = timezone.now()
        super().save(*args, **kwargs)

# 2. Emergency SOS Requests (Hospital se aane wali requests)
class EmergencyRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Broadcasting', 'Broadcasting'),
        ('Matched', 'Matched'),
        ('Completed', 'Completed'),
    ]
    hospital_name = models.CharField(max_length=200)
    patient_name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=5)
    units_required = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Emergency: {self.blood_group} for {self.hospital_name}"

class SOSRequest(models.Model):
    URGENCY_NORMAL = "Normal"
    URGENCY_CRITICAL = "Critical"

    URGENCY_CHOICES = [
        (URGENCY_NORMAL, "Normal"),
        (URGENCY_CRITICAL, "Critical"),
    ]

    hospital_name = models.CharField(max_length=255)
    patient_name = models.CharField(max_length=255, default="Unknown") # Ye field zaroori hai
    blood_group = models.CharField(max_length=10) # Iske bina matching nahi hogi
    units_required = models.IntegerField(default=1)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default=URGENCY_NORMAL)
    status = models.CharField(max_length=20, default='Pending') # Pending/Broadcasting
    created_at = models.DateTimeField(auto_now_add=True)

    # Ye function zaroori hai taaki Admin dropdown mein naam dikhe
    def __str__(self):
        return f"{self.patient_name} - {self.blood_group} ({self.hospital_name})"
        
# core/models.py mein ye class add karein
class Notification(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]
    donor = models.ForeignKey('VolunteerDonor', on_delete=models.CASCADE) 
    sos_request = models.ForeignKey('SOSRequest', on_delete=models.CASCADE)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    distance_km = models.FloatField(default=0.0)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert for {self.donor.name} - {self.sos_request.hospital_name}"



class BloodMatch(models.Model):
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('In Transit', 'In Transit'),
        ('Cancelled', 'Cancelled'),
    ]

    reference_id = models.CharField(max_length=20, unique=True)
    donor_name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=5)
    hospital_name = models.CharField(max_length=200)
    units = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Completed')
    location = models.CharField(max_length=255)
    contact = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)

    def __clstr__(self):
        return self.reference_id

class ActivityLog(models.Model):
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] # Latest log sabse upar dikhega

    def __str__(self):
        return self.message

@receiver(post_save, sender=VolunteerDonor)
def donor_activity_log(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(message=f"New Donor Registered: {instance.name}")
    else:
        ActivityLog.objects.create(message=f"Mission Update: {instance.name} is now {instance.status}")


@receiver(pre_save, sender=VolunteerDonor)
def donor_status_sync_pre_save(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return

    instance._previous_status = (
        VolunteerDonor.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
    )


@receiver(post_save, sender=VolunteerDonor)
def donor_notification_status_sync(sender, instance, created, **kwargs):
    if created:
        return

    previous_status = getattr(instance, "_previous_status", None)
    if previous_status == instance.status:
        return

    if instance.status == "In Transit":
        latest_pending = (
            Notification.objects.filter(donor=instance, status="Pending")
            .order_by("-created_at")
            .first()
        )
        if latest_pending:
            latest_pending.status = "Accepted"
            latest_pending.save(update_fields=["status"])

# 2. Jab koi SOS Request aaye
@receiver(post_save, sender=SOSRequest)
def sos_activity_log(sender, instance, created, **kwargs):
    if created:
        # SOS hamesha critical hota hai
        ActivityLog.objects.create(message=f"🚨 EMERGENCY: New SOS from {instance.hospital_name}!")

# 3. Jab Blood Match confirm ho (Tracking shuru hone se pehle)
@receiver(post_save, sender=BloodMatch)
def match_activity_log(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(message=f"Match Found: {instance.blood_group} for {instance.patient_name}")


class Donor(models.Model):
    DONOR_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('corporate', 'Corporate'),
    ]
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    donor_type = models.CharField(max_length=20, choices=DONOR_TYPE_CHOICES, default='individual')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"


class Donation(models.Model):
    DONATION_TYPE_CHOICES = [
        ('one_time', 'One Time'),
        ('monthly', 'Monthly'),
    ]
    PURPOSE_CHOICES = [
        ('workshop', 'Workshop'),
        ('ngo_support', 'NGO Support'),
    ]
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    donation_type = models.CharField(max_length=20, choices=DONATION_TYPE_CHOICES, default='one_time')
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='workshop')
    ngo = models.ForeignKey('NGOProfile', on_delete=models.SET_NULL, null=True, blank=True)
    workshop = models.ForeignKey('Workshop', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.donor.name} - ₹{self.amount}"