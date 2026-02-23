from django.urls import path
from . import views

urlpatterns = [
    path('initialize/', views.InitializePaymentView.as_view(), name='initialize-payment'),
    path('verify/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('webhook/', views.WebhookView.as_view(), name='webhook'),
]
