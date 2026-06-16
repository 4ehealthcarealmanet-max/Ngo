from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from django.db.models import Sum, Count
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from .models import Donor, Donation
from .serializers import DonorSerializer, DonationSerializer
import os

from .models import (
    Hospital,
    Referral,
    WorkshopRegistration,
    VolunteerDonor,
    SOSRequest,
    Notification,
    BloodMatch,
    ActivityLog
)
from .serializers import (
    HospitalSerializer,
    ReferralSerializer,
    WorkshopRegistrationSerializer,
    VolunteerDonorSerializer,
    SOSRequestSerializer,
    NotificationSerializer,
    BloodMatchSerializer
)

from .models import NGOProfile, PatientProfile, ReferralNetwork, Workshop
from .serializers import (
    NGOProfileSerializer,
    PatientProfileSerializer,
    ReferralNetworkSerializer,
    WorkshopSerializer,
)


class VolunteerDonorViewSet(viewsets.ModelViewSet):
    queryset = VolunteerDonor.objects.all()
    serializer_class = VolunteerDonorSerializer


class NGOListView(APIView):
    def get(self, request):
        search_query = request.query_params.get('q', '')
        city_query = request.query_params.get('city', '')
        queryset = NGOProfile.objects.all()
        if city_query:
            queryset = queryset.filter(city__icontains=city_query)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(service_type__icontains=search_query)
            )
        ngos = queryset.values()
        return Response(list(ngos))


class NGOProfileViewSet(viewsets.ModelViewSet):
    queryset = NGOProfile.objects.all().order_by("name")
    serializer_class = NGOProfileSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get("q", "")
        city_query = self.request.query_params.get("city", "")
        if city_query:
            queryset = queryset.filter(city__icontains=city_query)
        if search_query:
            queryset = queryset.filter(Q(name__icontains=search_query) | Q(service_type__icontains=search_query))
        return queryset


class PatientProfileListCreateView(generics.ListCreateAPIView):
    queryset = PatientProfile.objects.select_related("ngo").all().order_by("-created_at")
    serializer_class = PatientProfileSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        ngo_id = self.request.query_params.get("ngo_id")
        if ngo_id:
            queryset = queryset.filter(ngo_id=ngo_id)
        return queryset


class PatientProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PatientProfile.objects.select_related("ngo").all()
    serializer_class = PatientProfileSerializer


class WorkshopListCreateView(generics.ListCreateAPIView):
    queryset = Workshop.objects.select_related("ngo").all().order_by("-date")
    serializer_class = WorkshopSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        ngo_id = self.request.query_params.get("ngo_id")
        if ngo_id:
            queryset = queryset.filter(ngo_id=ngo_id)
        return queryset


class WorkshopDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Workshop.objects.select_related("ngo").all()
    serializer_class = WorkshopSerializer


class WorkshopSendRemindersView(APIView):
    def post(self, request, pk: int):
        workshop = get_object_or_404(Workshop, pk=pk)
        registrations = WorkshopRegistration.objects.filter(workshop_id=pk)
        participant_count = registrations.count()
        return Response({
            "workshop_id": workshop.id,
            "workshop_title": workshop.title,
            "participants": participant_count,
        })


class ReferralNetworkListCreateView(generics.ListCreateAPIView):
    queryset = ReferralNetwork.objects.select_related("source_ngo").all().order_by("-created_at")
    serializer_class = ReferralNetworkSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        ngo_id = self.request.query_params.get("ngo_id")
        if ngo_id:
            queryset = queryset.filter(source_ngo_id=ngo_id)
        return queryset


class ReferralNetworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReferralNetwork.objects.select_related("source_ngo").all()
    serializer_class = ReferralNetworkSerializer


class WorkshopRegistrationViewSet(viewsets.ModelViewSet):
    queryset = WorkshopRegistration.objects.select_related("workshop").all().order_by("-registered_at")
    serializer_class = WorkshopRegistrationSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=True, methods=["post"], url_path="send-reminder")
    def send_reminder(self, request, pk=None):
        registration = self.get_object()
        print(f"Sending reminder to {registration.full_name}")
        return JsonResponse({"status": "success", "message": "Reminder sent simulation"})


class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all().order_by("name")
    serializer_class = HospitalSerializer


class ReferralViewSet(viewsets.ModelViewSet):
    queryset = Referral.objects.select_related("patient", "from_ngo", "to_hospital").all().order_by("-created_at")
    serializer_class = ReferralSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        ngo_id = self.request.query_params.get("ngo_id")
        if ngo_id:
            queryset = queryset.filter(from_ngo_id=ngo_id)
        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        hospital_id = self.request.query_params.get("hospital_id")
        if hospital_id:
            queryset = queryset.filter(to_hospital_id=hospital_id)
        return queryset


class SOSRequestViewSet(viewsets.ModelViewSet):
    queryset = SOSRequest.objects.all()
    serializer_class = SOSRequestSerializer

    @action(detail=True, methods=['post'], url_path='broadcast')
    def broadcast(self, request, pk=None):
        sos_request = self.get_object()
        blood_needed = sos_request.blood_group.strip()

        # 1. Matching available donors dhundo
        donors = VolunteerDonor.objects.filter(
            blood_group__icontains=blood_needed,
            is_available=True
        )

        if not donors.exists():
            return Response({"status": "error", "message": "No donors found!"})

        success_count = 0
        failed_count = 0

        for donor in donors:
            # 2. Notification entry banao
            notification, created = Notification.objects.update_or_create(
                donor=donor,
                sos_request=sos_request,
                defaults={
                    'message': f"Emergency: {blood_needed} at {sos_request.hospital_name}",
                    'status': 'Pending',
                    'distance_km': 1.5
                }
            )

            # 3. Email bhejo
            if donor.email:
                try:
                    base_url = "http://127.0.0.1:8000"
                    accept_link = f"{base_url}/api/donor/respond/?token={notification.id}&action=accept"
                    decline_link = f"{base_url}/api/donor/respond/?token={notification.id}&action=decline"

                    subject = f"🆘 URGENT - {blood_needed} Blood Needed at {sos_request.hospital_name}"

                    message = f"""
URGENT BLOOD REQUEST - SOS RADAR

Dear {donor.name},

A hospital near you urgently needs blood. Please respond as soon as possible.

DETAILS:
━━━━━━━━━━━━━━━━━━━━
Blood Group Required : {blood_needed}
Hospital             : {sos_request.hospital_name}
Patient Name         : {sos_request.patient_name}
Units Required       : {sos_request.units_required}
━━━━━━━━━━━━━━━━━━━━

PLEASE RESPOND:

✅ ACCEPT - Click here to accept:
{accept_link}

❌ DECLINE - Click here to decline:
{decline_link}

Thank you for being a life saver!

- SOS Radar Emergency Blood Network
  (This is an automated alert. Please do not reply to this email.)
                    """

                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[donor.email],
                        fail_silently=False,
                    )

                    notification.status = "Sent"
                    notification.save()
                    success_count += 1
                    print(f"Email sent to {donor.name} ({donor.email})")

                except Exception as e:
                    print(f"Email failed for {donor.name}: {e}")
                    failed_count += 1
            else:
                print(f"No email for donor: {donor.name}")
                failed_count += 1

        # 4. SOS status update
        sos_request.status = "Broadcasting"
        sos_request.save()

        return Response({
            "status": "success",
            "message": f"Broadcast sent! {success_count} notified, {failed_count} failed."
        })

    @action(detail=True, methods=['post'], url_path='cancel_broadcast')
    def cancel_broadcast(self, request, pk=None):
        sos_request = self.get_object()
        sos_request.status = "Pending"
        sos_request.save()
        Notification.objects.filter(sos_request=sos_request).delete()
        return Response({
            "status": "success",
            "message": "Broadcast cancelled and tracker cleared."
        })


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        qs = Notification.objects.all().order_by('-created_at')
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs


class BloodMatchListAPI(APIView):
    def get(self, request):
        matches = BloodMatch.objects.all().order_by('-created_at')
        match_serializer = BloodMatchSerializer(matches, many=True)
        for item in match_serializer.data:
            item['id'] = f"match-{item['id']}"
        volunteers = VolunteerDonor.objects.filter(status='Completed')
        volunteer_serializer = VolunteerDonorSerializer(volunteers, many=True)
        for item in volunteer_serializer.data:
            item['id'] = f"vol-{item['id']}"
        combined_data = match_serializer.data + volunteer_serializer.data
        return Response(combined_data)


class DashboardStatsAPI(APIView):
    def get(self, request):
        total_donors = VolunteerDonor.objects.count()
        lives_saved = VolunteerDonor.objects.filter(status='Completed').count()
        total_units = VolunteerDonor.objects.aggregate(Sum('units'))['units__sum'] or 0
        data = {
            "lives_saved": lives_saved,
            "success_rate": "98.2%",
            "total_donors": total_donors,
            "units_traded": f"{total_units}"
        }
        return Response(data)


class LiveTrackingDetailedAPI(APIView):
    def get(self, request):
        active_transits = VolunteerDonor.objects.filter(status='In Transit')
        data = []
        for item in active_transits:
            hospital_contact = None
            try:
                hospital = Hospital.objects.filter(name__iexact=item.hospital_name).only("contact").first()
                hospital_contact = getattr(hospital, "contact", None) if hospital else None
            except Exception:
                hospital_contact = None
            data.append({
                "id": item.id,
                "reference_id": f"VOL-{item.id}",
                "donor_name": getattr(item, 'name', 'Unknown Donor'),
                "donor_phone": getattr(item, "phone", None),
                "hospital_name": item.hospital_name,
                "hospital_helpline": hospital_contact,
                "blood_group": item.blood_group,
                "units": item.units,
                "status": item.status,
                "mission_started_at": item.mission_started_at.isoformat() if item.mission_started_at else None,
            })
        return Response(data)


class MissionLogsAPI(APIView):
    def get(self, request):
        logs = ActivityLog.objects.order_by("-created_at")[:5]
        data = [{
            "id": log.id,
            "message": log.message,
            "time": log.created_at.strftime("%I:%M %p"),
            "created_at": log.created_at.isoformat(),
        } for log in logs]
        return Response(data)


class LiveTrackingAPI(generics.ListAPIView):
    serializer_class = VolunteerDonorSerializer

    def get_queryset(self):
        status = self.request.query_params.get('status')
        if not status:
            status = 'In Transit'
        return VolunteerDonor.objects.filter(status=status)


from django.http import HttpResponse

class DonorResponseView(APIView):
    def get(self, request):
        token = request.query_params.get('token')
        action = request.query_params.get('action')

        try:
            notification = Notification.objects.get(id=token)
        except Notification.DoesNotExist:
            return HttpResponse("""
                <html><body style="font-family:Arial;text-align:center;padding:80px;background:#f8fafc;">
                <div style="max-width:400px;margin:auto;background:white;padding:40px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                <div style="font-size:60px;">❌</div>
                <h2 style="color:#dc2626;">Invalid Link</h2>
                <p style="color:#6b7280;">This link is invalid or has expired.</p>
                </div></body></html>
            """, status=404)

        sos_request = notification.sos_request
        units_required = sos_request.units_required

        if action == 'accept':
            # Already accepted count check karo
            accepted_count = Notification.objects.filter(
                sos_request=sos_request,
                status='Accepted'
            ).count()

            # Already fulfilled?
            if accepted_count >= units_required:
                return HttpResponse("""
                    <html><body style="font-family:Arial;text-align:center;padding:80px;background:#fefce8;">
                    <div style="max-width:400px;margin:auto;background:white;padding:40px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                    <div style="font-size:60px;">🙏</div>
                    <h2 style="color:#ca8a04;">Already Fulfilled!</h2>
                    <p style="color:#6b7280;">Thank you for your willingness to donate.</p>
                    <p style="color:#6b7280;">The required donors have already been found.</p>
                    <div style="margin-top:20px;padding:15px;background:#fefce8;border-radius:10px;border:1px solid #fde68a;">
                    <p style="margin:0;color:#92400e;">We will contact you for future needs! 🩸</p>
                    </div>
                    </div></body></html>
                """)

            # Accept karo
            notification.status = 'Accepted'
            notification.save()

             # Donor automatically In Transit karo
            donor = notification.donor
            donor.status = 'In Transit'
            donor.hospital_name = sos_request.hospital_name
            donor.units = sos_request.units_required
            donor.save()
            # Naya accepted count
            new_accepted_count = accepted_count + 1

            # Units poori ho gayi?
            if new_accepted_count >= units_required:
                # Baaki sab Sent notifications expire karo
                Notification.objects.filter(
                    sos_request=sos_request,
                    status='Sent'
                ).update(status='Expired')

                # SOS Request status update
                sos_request.status = 'Matched'
                sos_request.save()

            return HttpResponse(f"""
                <html><body style="font-family:Arial;text-align:center;padding:80px;background:#f0fdf4;">
                <div style="max-width:400px;margin:auto;background:white;padding:40px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                <div style="font-size:60px;">✅</div>
                <h2 style="color:#16a34a;margin:20px 0 10px;">Request Accepted!</h2>
                <p style="color:#6b7280;">Thank you for agreeing to donate blood.</p>
                <p style="color:#6b7280;">Please visit the hospital as soon as possible.</p>
                <div style="margin-top:30px;padding:15px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
                <p style="margin:0;color:#15803d;font-weight:bold;">🩸 You are saving a life today!</p>
                </div>
                <div style="margin-top:15px;padding:10px;background:#f8fafc;border-radius:10px;">
                <p style="margin:0;color:#94a3b8;font-size:13px;">
                Hospital: {sos_request.hospital_name}<br/>
                Donors Confirmed: {new_accepted_count}/{units_required}
                </p>
                </div>
                </div></body></html>
            """)

        elif action == 'decline':
            notification.status = 'Rejected'
            notification.save()
            return HttpResponse("""
                <html><body style="font-family:Arial;text-align:center;padding:80px;background:#fef2f2;">
                <div style="max-width:400px;margin:auto;background:white;padding:40px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                <div style="font-size:60px;">🙏</div>
                <h2 style="color:#dc2626;margin:20px 0 10px;">Response Recorded</h2>
                <p style="color:#6b7280;">Thank you for your response.</p>
                <p style="color:#6b7280;">We hope you can help next time!</p>
                </div></body></html>
            """)

        return HttpResponse("<h2>Invalid action</h2>", status=400)

class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all().order_by('-created_at')
    serializer_class = DonorSerializer

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.select_related(
        'donor', 'ngo', 'workshop'
    ).all().order_by('-date')
    serializer_class = DonationSerializer