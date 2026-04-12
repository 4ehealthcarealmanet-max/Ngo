from django.urls import path

from .views import (
    PatientProfileDetailView,
    PatientProfileListCreateView,
    ReferralNetworkDetailView,
    ReferralNetworkListCreateView,
    WorkshopDetailView,
    WorkshopListCreateView,
    WorkshopSendRemindersView,
)

urlpatterns = [
    path("patients/", PatientProfileListCreateView.as_view(), name="patientprofile-list"),
    path("patients/<int:pk>/", PatientProfileDetailView.as_view(), name="patientprofile-detail"),
    path("workshops/", WorkshopListCreateView.as_view(), name="workshop-list"),
    path("workshops/<int:pk>/", WorkshopDetailView.as_view(), name="workshop-detail"),
    path("workshops/<int:pk>/send-reminders/", WorkshopSendRemindersView.as_view(), name="workshop-send-reminders"),
    path("referral-networks/", ReferralNetworkListCreateView.as_view(), name="referralnetwork-list"),
    path("referral-networks/<int:pk>/", ReferralNetworkDetailView.as_view(), name="referralnetwork-detail"),
]

