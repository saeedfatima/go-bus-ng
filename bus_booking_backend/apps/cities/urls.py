from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListCitiesView.as_view(), name='list-cities'),
    path('<uuid:city_id>/', views.GetCityView.as_view(), name='get-city'),
]
