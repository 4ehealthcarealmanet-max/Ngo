from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DonationViewSet,
    DonorViewSet,
    HospitalViewSet,
    NGOProfileViewSet,
    ReferralViewSet,
    WorkshopRegistrationViewSet
)

# 1. Router setup karein ViewSets ke liye
router = DefaultRouter()
router.register(r'ngos', NGOProfileViewSet)
router.register(r'donors', DonorViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'registrations', WorkshopRegistrationViewSet)
router.register(r'hospitals', HospitalViewSet)
router.register(r'referrals', ReferralViewSet)

urlpatterns = [
    # 2. Router ki saari URLs ko yahan include karein
    path('', include(router.urls)), 
]
