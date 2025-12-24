import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_integration():
    # 1. Register
    print("Testing Register...")
    register_data = {
        "username": "integration_test_user",
        "email": "test@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(f'{BASE_URL}/register/', json=register_data)
        if response.status_code == 201:
            print("Register successful")
        elif response.status_code == 400 and 'username' in response.json() and response.json()['username'][0] == 'A user with that username already exists.':
             print("User already exists, proceeding...")
        else:
            print(f"Register failed: {response.status_code} {response.text}")
            return
    except Exception as e:
        print(f"Register failed with exception: {e}")
        return

    # 2. Login
    print("\nTesting Login...")
    login_data = {
        "username": "integration_test_user",
        "password": "password123"
    }
    response = requests.post(f'{BASE_URL}/login/', json=login_data)
    if response.status_code == 200:
        print("Login successful")
        tokens = response.json()
        access_token = tokens['access']
    else:
        print(f"Login failed: {response.status_code} {response.text}")
        return

    headers = {'Authorization': f'Bearer {access_token}'}

    # 3. Get Trips
    print("\nGetting Trips...")
    response = requests.get(f'{BASE_URL}/trips/', headers=headers)
    if response.status_code == 200:
        trips = response.json()
        if not trips:
            print("No trips found. Please populate db.")
            return
        trip_id = trips[0]['id']
        print(f"Found trip ID: {trip_id}")
    else:
        print(f"Get trips failed: {response.status_code} {response.text}")
        return

    # 4. Create Booking
    print("\nCreating Booking...")
    booking_data = {
        "trip": trip_id,
        "seats": ["1A", "1B"],
        "total_amount": 5000,
        "passenger_name": "John Doe",
        "passenger_email": "john@example.com",
        "passenger_phone": "1234567890",
        "ticket_code": "TEST-TICKET-123",
        "passengers": [
            {
                "full_name": "John Doe",
                "phone": "1234567890",
                "email": "john@example.com",
                "nin": "NIN12345",
                "seat_number": "1A"
            },
            {
                "full_name": "Jane Doe",
                "phone": "0987654321",
                "email": "jane@example.com",
                "nin": "NIN67890",
                "seat_number": "1B"
            }
        ]
    }
    # Use a unique ticket code
    import random
    booking_data['ticket_code'] = f"TEST-{random.randint(1000, 9999)}"

    response = requests.post(f'{BASE_URL}/bookings/', json=booking_data, headers=headers)
    if response.status_code == 201:
        print("Booking created successfully")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Booking failed: {response.status_code} {response.text}")

if __name__ == "__main__":
    test_integration()
