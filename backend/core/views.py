from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import Q
from django.shortcuts import get_object_or_404
# Baaki imports ke saath ye bhi add karein
from rest_framework import viewsets 
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from .models import Donation, Donor, Hospital, Referral, WorkshopRegistration # Ye import check kar lena
from .serializers import DonationSerializer, DonorSerializer, HospitalSerializer, ReferralSerializer, WorkshopRegistrationSerializer # Ye bhi

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
