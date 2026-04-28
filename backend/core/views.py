from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import Q
from django.shortcuts import get_object_or_404
# Baaki imports ke saath ye bhi add karein
from rest_framework import viewsets 
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from .models import (
    #BloodDonation,
    #BloodStock,
    #Donation,
    #Donor,
    #DonorRegistry,
    Hospital,
    Referral,
    #TransferLog,
    WorkshopRegistration,
    #EmergencyRequest, 
    VolunteerDonor,
    SOSRequest,
    Notification
)  # Ye import check kar lena
from .serializers import (
    #BloodDonationSerializer,
    #BloodStockSerializer,
    #DonationSerializer,
    #DonorRegistrySerializer,
    #DonorSerializer,
    HospitalSerializer,
    ReferralSerializer,
    #TransferLogSerializer,
    WorkshopRegistrationSerializer,
    #EmergencyRequestSerializer,
    VolunteerDonorSerializer,
    SOSRequestSerializer,
    NotificationSerializer
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
        # Extract parameters from the URL
        search_query = request.query_params.get('q', '')
        city_query = request.query_params.get('city', '')
        
        # Start with all records
        queryset = NGOProfile.objects.all()
        
        # Apply City filter if provided
        if city_query:
            queryset = queryset.filter(city__icontains=city_query)
            
        # Apply Search query (Name or Service Type) if provided
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | 
                Q(service_type__icontains=search_query)
            )
            
        # Convert to list of dictionaries
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

        # Notification is simulated for demo. This endpoint intentionally does not send actual SMS/Email.
        return Response(
            {
                "workshop_id": workshop.id,
                "workshop_title": workshop.title,
                "participants": participant_count,
            }
        )


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


class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all().order_by("name")
    serializer_class = HospitalSerializer


#class DonorViewSet(viewsets.ModelViewSet):
 #   queryset = Donor.objects.all().order_by("name")
  #  serializer_class = DonorSerializer 


#class DonationViewSet(viewsets.ModelViewSet):
 #   queryset = Donation.objects.select_related("donor", "workshop", "ngo").all()
  #  serializer_class = DonationSerializer


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
        
        # 1. Matching Donors dhundo jo available hain
        donors = VolunteerDonor.objects.filter(
            blood_group__icontains=blood_needed,
            is_available=True
        )

        if not donors.exists():
            return Response({"status": "error", "message": "No donors found!"})

        # 2. AUTOMATIC ENTRY: Har donor ke liye notification table mein data dalo
        for donor in donors:
            Notification.objects.get_or_create(
                donor=donor,
                sos_request=sos_request,
                defaults={
                    'message': f"Emergency: {blood_needed} required at {sos_request.hospital_name}",
                    'status': 'Pending',
                    'distance_km': 1.5 
                }
            )
        
        # 3. Status update karo
        sos_request.status = "Broadcasting"
        sos_request.save()

        return Response({"status": "success", "message": "Broadcast started!"})

    # --- YE FUNCTION AB ALAG HAI (INDENTATION FIXED) ---
    @action(detail=True, methods=['post'], url_path='cancel_broadcast')
    def cancel_broadcast(self, request, pk=None):
        sos_request = self.get_object()
        
        # 1. Status ko wapas Pending karo
        sos_request.status = "Pending" 
        sos_request.save()
        
        # 2. Notification table se entries delete karo (IMPORTANT)
        # Isse aapka Live Tracker se data apne aap hat jayega
        Notification.objects.filter(sos_request=sos_request).delete()
        
        return Response({
            "status": "success", 
            "message": "Broadcast cancelled and tracker cleared."
        })
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer


