from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import Q
from django.shortcuts import get_object_or_404
# Baaki imports ke saath ye bhi add karein
from rest_framework import viewsets 
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from .models import (
    BloodDonation,
    BloodStock,
    Donation,
    Donor,
    DonorRegistry,
    Hospital,
    Referral,
    TransferLog,
    WorkshopRegistration,
)  # Ye import check kar lena
from .serializers import (
    BloodDonationSerializer,
    BloodStockSerializer,
    DonationSerializer,
    DonorRegistrySerializer,
    DonorSerializer,
    HospitalSerializer,
    ReferralSerializer,
    TransferLogSerializer,
    WorkshopRegistrationSerializer,
)  # Ye bhi

from .models import NGOProfile, PatientProfile, ReferralNetwork, Workshop
from .serializers import (
    NGOProfileSerializer,
    PatientProfileSerializer,
    ReferralNetworkSerializer,
    WorkshopSerializer,
)

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


class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all().order_by("name")
    serializer_class = DonorSerializer


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.select_related("donor", "workshop", "ngo").all()
    serializer_class = DonationSerializer


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


class BloodStockViewSet(viewsets.ModelViewSet):
    queryset = BloodStock.objects.all().order_by("blood_group")
    serializer_class = BloodStockSerializer

    def list(self, request, *args, **kwargs):
        # Ensure all blood groups exist for a complete dashboard grid.
        existing = set(BloodStock.objects.values_list("blood_group", flat=True))
        missing = [bg for bg, _ in BloodStock.BLOOD_GROUPS if bg not in existing]
        if missing:
            BloodStock.objects.bulk_create([BloodStock(blood_group=bg, units_available=0) for bg in missing])
        return super().list(request, *args, **kwargs)


class DonorRegistryViewSet(viewsets.ModelViewSet):
    queryset = DonorRegistry.objects.all().order_by("name")
    serializer_class = DonorRegistrySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        q = (self.request.query_params.get("q") or "").strip()
        blood_group = (self.request.query_params.get("blood_group") or "").strip()
        status = (self.request.query_params.get("status") or "").strip()

        if blood_group:
            queryset = queryset.filter(blood_group=blood_group)
        if status:
            queryset = queryset.filter(status=status)
        if q:
            queryset = queryset.filter(Q(name__icontains=q) | Q(blood_group__icontains=q))

        return queryset


class BloodDonationViewSet(viewsets.ModelViewSet):
    queryset = BloodDonation.objects.select_related("donor").all().order_by("-donated_at")
    serializer_class = BloodDonationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        donor_id = self.request.query_params.get("donor")
        blood_group = (self.request.query_params.get("blood_group") or "").strip()
        if donor_id:
            queryset = queryset.filter(donor_id=donor_id)
        if blood_group:
            queryset = queryset.filter(blood_group=blood_group)
        return queryset


class TransferLogViewSet(viewsets.ModelViewSet):
    queryset = TransferLog.objects.all().order_by("-timestamp")
    serializer_class = TransferLogSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        blood_group = (self.request.query_params.get("blood_group") or "").strip()
        status = (self.request.query_params.get("status") or "").strip()
        q = (self.request.query_params.get("q") or "").strip()

        if blood_group:
            queryset = queryset.filter(blood_group=blood_group)
        if status:
            queryset = queryset.filter(status=status)
        if q:
            queryset = queryset.filter(Q(destination_hospital__icontains=q) | Q(blood_group__icontains=q))

        return queryset
