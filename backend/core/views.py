from math import radians, sin, cos, sqrt, atan2
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
from .serializers import HospitalRegistrationSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .models import SOSRequest
from .email_utils import send_email_brevo
from rest_framework.permissions import AllowAny
import os


def calculate_distance_km(lat1, lng1, lat2, lng2):
    if not all([lat1, lng1, lat2, lng2]):
        return 0.0
    try:
        lat1, lng1, lat2, lng2 = map(radians, [float(lat1), float(lng1), float(lat2), float(lng2)])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return round(6371 * c, 1)
    except (TypeError, ValueError):
        return 0.0


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
    BloodMatchSerializer,
    NGOProfileSerializer, 
    NGORegistrationSerializer
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

    @action(detail=False, methods=['post'],
            permission_classes=[AllowAny],
            url_path='register')
    def register(self, request):
        serializer = NGORegistrationSerializer(data=request.data)
        if serializer.is_valid():
            ngo = serializer.save()
            return Response({
                'message': 'NGO registered successfully! Awaiting admin verification.',
                'ngo_id': ngo.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'],
            permission_classes=[AllowAny],
            url_path='verify')
    def verify(self, request, pk=None):
        ngo = self.get_object()
        action = request.data.get('action')

        if action == 'verify':
            ngo.is_verified = True
            ngo.save()
            return Response({'message': 'NGO verified successfully!'})
        elif action == 'reject':
            ngo.delete()
            return Response({'message': 'NGO rejected!'})

        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
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

    def get_serializer_class(self):
        if self.action == 'register':
            return HospitalRegistrationSerializer
        return HospitalSerializer

    @action(detail=False, methods=['post'], 
            permission_classes=[AllowAny], 
            url_path='register')
    def register(self, request):
        serializer = HospitalRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            hospital = serializer.save()
            return Response({
                'message': 'Hospital registered successfully!',
                'hospital_id': hospital.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], 
            permission_classes=[IsAdminUser], 
            url_path='approve')
    def approve(self, request, pk=None):
        hospital = self.get_object()
        hospital.is_approved = True
        hospital.save()
        return Response({'message': 'Hospital approved successfully!'})

    # ← Ye andar hai ab ✅
    @action(detail=False, methods=['post'],
            permission_classes=[AllowAny],
            url_path='login')
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password required'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=email, password=password)

        if not user:
            return Response({'error': 'Invalid email or password'},
                            status=status.HTTP_401_UNAUTHORIZED)

        try:
            hospital = Hospital.objects.get(user=user)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital not found'},
                            status=status.HTTP_404_NOT_FOUND)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'hospital_id': hospital.id,
            'hospital_name': hospital.name,
            'location': hospital.location,
            'specialty': hospital.specialty,
            'hospital_type': hospital.hospital_type,
            'beds_available': hospital.beds_available,
            'license_no': hospital.license_no,
            'contact': hospital.contact,
        })

    @action(detail=False, methods=['get'],
            permission_classes=[IsAuthenticated],
            url_path='my-requests')
    def my_requests(self, request):
        try:
            hospital = Hospital.objects.get(user=request.user)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital not found'}, 
                            status=status.HTTP_404_NOT_FOUND)
        
        requests = SOSRequest.objects.filter(
            hospital_name=hospital.name
        ).order_by('-created_at')
        
        data = [{
            'id': r.id,
            'patient_name': r.patient_name,
            'blood_group': r.blood_group,
            'units_required': r.units_required,
            'urgency': r.urgency,
            'status': r.status,
            'created_at': r.created_at.strftime('%d %b %Y, %I:%M %p'),
        } for r in requests]
        
        return Response(data)

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

    def get_queryset(self):
        # Agar frontend ?status=Matched bhejta hai (Match History page ke liye), to wo dikhao
        status_param = self.request.query_params.get('status')
        if status_param:
            return SOSRequest.objects.filter(status=status_param).order_by('-created_at')

        # Default — sirf active requests (SOS Radar ke liye)
        return SOSRequest.objects.exclude(
            status__in=['Matched', 'Completed']
        ).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='broadcast')
    def broadcast(self, request, pk=None):
        sos_request = self.get_object()
        blood_needed = sos_request.blood_group.strip()

        # 1. Matching available donors dhundo
        donors = VolunteerDonor.objects.filter(
            blood_group=blood_needed,
            is_available=True
        )

        if not donors.exists():
            return Response({"status": "error", "message": "No donors found!"})

        hospital_obj = Hospital.objects.filter(name__iexact=sos_request.hospital_name).only("lat", "lng", "contact", "location").first()
        hospital_lat = hospital_obj.lat if hospital_obj else None
        hospital_lng = hospital_obj.lng if hospital_obj else None
        hospital_contact = hospital_obj.contact if hospital_obj else "Not available"
        hospital_address = hospital_obj.location if hospital_obj else "Not available"

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
                    'distance_km': calculate_distance_km(donor.lat, donor.lng, hospital_lat, hospital_lng)
                }
            )

            # 3. Email bhejo
            if donor.email:
                try:
                    #base_url = "http://127.0.0.1:8000"
                    base_url = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000")
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
Hospital Address      : {hospital_address}
Hospital Contact      : {hospital_contact}
Patient Name         : {sos_request.patient_name}
Units Required       : {sos_request.units_required}
━━━━━━━━━━━━━━━━━━━━

PLEASE RESPOND:

✅ ACCEPT - Click here to accept:
{accept_link}

❌ DECLINE - Click here to decline:
{decline_link}

Note: Hospital staff will verify your eligibility before donation.

Thank you for being a life saver!

- SOS Radar Emergency Blood Network
  (This is an automated alert. Please do not reply to this email.)
                    """

                    success, info = send_email_brevo(
                        to_email=donor.email,
                        to_name=donor.name,
                        subject=subject,
                        html_content=message.replace("\n", "<br>")
                    )
                    if success:
                        notification.status = "Sent"
                        notification.save()
                        success_count += 1
                        print(f"Email sent to {donor.name} ({donor.email})")
                    else:
                        print(f"Email failed for {donor.name}: {info}")
                        failed_count += 1

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
            # Already fulfilled?
            if sos_request.status == 'Matched':
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
            donor.save()

            # Pehla accept hi Matched kar dega
            Notification.objects.filter(sos_request=sos_request, status='Sent').update(status='Expired')
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
                Status: Confirmed
                </p>
                </div>
                <p id="locStatus" style="margin-top:20px;color:#94a3b8;font-size:13px;">📍 Sharing your live location...</p>
                <p style="margin-top:10px;color:#6b7280;font-size:12px;">Sharing your live location helps the hospital track your arrival and coordinate faster. Please allow location access when your browser asks.</p>
                </div>

                <script>
function sendLocation() {{
    if (!navigator.geolocation) {{
        document.getElementById('locStatus').innerText = 'Location not supported on this browser';
        return;
    }}
    navigator.geolocation.getCurrentPosition(function(pos) {{
        fetch('/api/donor/update-location/', {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify({{
                donor_id: {donor.id},
                lat: pos.coords.latitude.toFixed(6),
                lng: pos.coords.longitude.toFixed(6)
            }})
        }}).then(function(res) {{
            if (res.ok) {{
                document.getElementById('locStatus').innerText = '✅ Live location shared with hospital';
            }} else {{
                document.getElementById('locStatus').innerText = '⚠️ Could not share location';
            }}
        }});
    }}, function(err) {{
        document.getElementById('locStatus').innerText = '⚠️ Location permission denied. Please enable location access in your browser settings and refresh this page so the hospital can track your arrival.';
    }});
}}
sendLocation();
setInterval(sendLocation, 30000);
                </script>
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

class UpdateDonorLocationView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        donor_id = request.data.get('donor_id')
        lat = request.data.get('lat')
        lng = request.data.get('lng')

        if not donor_id or lat is None or lng is None:
            return Response({"error": "Missing data"}, status=400)

        try:
            donor = VolunteerDonor.objects.get(id=donor_id)
            donor.lat = lat
            donor.lng = lng
            donor.save()
            return Response({"success": True})
        except VolunteerDonor.DoesNotExist:
            return Response({"error": "Donor not found"}, status=404)

class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all().order_by('-created_at')
    serializer_class = DonorSerializer

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.select_related(
        'donor', 'ngo', 'workshop'
    ).all().order_by('-date')
    serializer_class = DonationSerializer
