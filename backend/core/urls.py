from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VolunteerDonorViewSet
from .views import DonorResponseView
from .views import WorkshopListCreateView, WorkshopDetailView
from .views import (
    #BloodDonationViewSet,
    #BloodStockViewSet,
    #DonationViewSet,
    #DonorViewSet,
    #DonorRegistryViewSet,
    HospitalViewSet,
    NGOProfileViewSet,
    ReferralViewSet,
    #TransferLogViewSet,
    WorkshopRegistrationViewSet,
    VolunteerDonor,
    #EmergencyRequest,
    SOSRequestViewSet,
    NotificationViewSet,
    BloodMatchListAPI,
    DashboardStatsAPI,
    LiveTrackingAPI,
    MissionLogsAPI,
     DonorViewSet,     
    DonationViewSet,
)

# 1. Router setup karein ViewSets ke liye
router = DefaultRouter()
router.register(r'ngos', NGOProfileViewSet)
router.register(r'registrations', WorkshopRegistrationViewSet)
router.register(r'hospitals', HospitalViewSet)
router.register(r'referrals', ReferralViewSet)
router.register(r'sos-requests', SOSRequestViewSet)
router.register(r'volunteer-donors', VolunteerDonorViewSet)
router.register(r'donors', DonorViewSet)
router.register(r'donations', DonationViewSet)
# 'basename' add karne se error khatam ho jayega
router.register(r'notifications', NotificationViewSet, basename='notification')
urlpatterns = [
    # 2. Router ki saari URLs ko yahan include karein
    path('', include(router.urls)), 

    path('blood-bank/matches/', BloodMatchListAPI.as_view(), name='match-history'),

    path('dashboard-stats/', DashboardStatsAPI.as_view(), name='dashboard-stats'),

    path('live-tracking/', LiveTrackingAPI.as_view(), name='live-tracking'),

    path('mission-logs/', MissionLogsAPI.as_view(), name='mission-logs'),

    path('donor/respond/', DonorResponseView.as_view(), name='donor-respond'),

    path('workshops/', WorkshopListCreateView.as_view(), name='workshop-list'),
path('workshops/<int:pk>/', WorkshopDetailView.as_view(), name='workshop-detail'),

]
