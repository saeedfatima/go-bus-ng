from django.urls import path
from apps.accounts import views

urlpatterns = [
    # Match IFunctionsService interface
    path('<str:function_name>/', views.InvokeFunctionView.as_view(), name='invoke-function'),
]
