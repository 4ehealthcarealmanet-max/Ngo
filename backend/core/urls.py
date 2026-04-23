from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BloodDonationViewSet,
    BloodStockViewSet,
    DonationViewSet,
    DonorViewSet,
    DonorRegistryViewSet,
    HospitalViewSet,
    NGOProfileViewSet,
    ReferralViewSet,
    TransferLogViewSet,
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
router.register(r'blood-stocks', BloodStockViewSet)
router.register(r'blood-donors', DonorRegistryViewSet)
router.register(r'blood-donations', BloodDonationViewSet)
router.register(r'transfer-logs', TransferLogViewSet)

urlpatterns = [
    # 2. Router ki saari URLs ko yahan include karein
    path('', include(router.urls)), 
]
