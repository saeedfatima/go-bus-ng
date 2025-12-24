from django.core.management.base import BaseCommand
from api.models import City, Company, Bus, Route, Trip
from django.utils import timezone
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Populates the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database...')

        # Create Cities
        cities_data = [
            {'name': 'Lagos', 'state': 'Lagos'},
            {'name': 'Abuja', 'state': 'FCT'},
            {'name': 'Port Harcourt', 'state': 'Rivers'},
            {'name': 'Ibadan', 'state': 'Oyo'},
            {'name': 'Kano', 'state': 'Kano'},
            {'name': 'Enugu', 'state': 'Enugu'},
        ]
        cities = {}
        for data in cities_data:
            city, created = City.objects.get_or_create(name=data['name'], defaults=data)
            cities[data['name']] = city
            if created:
                self.stdout.write(f'Created city: {city.name}')

        # Create Companies
        companies_data = [
            {
                'name': 'GIGM',
                'logo': 'https://example.com/gigm-logo.png',
                'rating': 4.5,
                'total_trips': 1200,
                'is_verified': True
            },
            {
                'name': 'ABC Transport',
                'logo': 'https://example.com/abc-logo.png',
                'rating': 4.2,
                'total_trips': 850,
                'is_verified': True
            },
            {
                'name': 'GUO Transport',
                'logo': 'https://example.com/guo-logo.png',
                'rating': 4.0,
                'total_trips': 900,
                'is_verified': True
            },
        ]
        companies = {}
        for data in companies_data:
            company, created = Company.objects.get_or_create(name=data['name'], defaults=data)
            companies[data['name']] = company
            if created:
                self.stdout.write(f'Created company: {company.name}')

        # Create Buses
        bus_types = ['standard', 'luxury', 'executive']
        for company_name, company in companies.items():
            for i in range(3):
                Bus.objects.get_or_create(
                    plate_number=f'{company_name[:3].upper()}-{random.randint(100, 999)}-XY',
                    defaults={
                        'company': company,
                        'bus_type': random.choice(bus_types),
                        'total_seats': random.choice([14, 18, 30, 45]),
                        'amenities': ['AC', 'Wifi', 'Charging Port']
                    }
                )

        # Create Routes
        routes = []
        route_configs = [
            ('Lagos', 'Abuja', 15000, 10),
            ('Lagos', 'Port Harcourt', 12000, 8),
            ('Abuja', 'Kano', 8000, 5),
            ('Lagos', 'Ibadan', 3000, 2),
            ('Enugu', 'Lagos', 10000, 7),
        ]

        for origin_name, dest_name, price, duration in route_configs:
            for company in companies.values():
                route, created = Route.objects.get_or_create(
                    company=company,
                    origin=cities[origin_name],
                    destination=cities[dest_name],
                    defaults={
                        'base_price': price,
                        'duration_hours': duration
                    }
                )
                routes.append(route)
                if created:
                    self.stdout.write(f'Created route: {route}')

        # Create Trips
        for route in routes:
            # Create trips for the next 7 days
            for i in range(7):
                trip_date = timezone.now() + timedelta(days=i)
                # Morning trip
                departure = trip_date.replace(hour=7, minute=0, second=0, microsecond=0)
                arrival = departure + timedelta(hours=route.duration_hours)
                
                bus = route.company.buses.first() # Simplification: pick first bus
                if not bus: continue

                Trip.objects.get_or_create(
                    route=route,
                    departure_time=departure,
                    defaults={
                        'bus': bus,
                        'company': route.company,
                        'arrival_time': arrival,
                        'price': route.base_price,
                        'available_seats': bus.total_seats,
                        'status': 'scheduled'
                    }
                )

        self.stdout.write(self.style.SUCCESS('Successfully populated database'))
