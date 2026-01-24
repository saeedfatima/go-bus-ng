# GoBus Nigeria - System Diagrams

This document contains all system diagrams for the GoBus Nigeria bus booking platform.

## Table of Contents
1. [Use Case Diagram](#1-use-case-diagram)
2. [Data Flow Diagram (DFD)](#2-data-flow-diagram-dfd)
3. [Entity Relationship Diagram (ERD)](#3-entity-relationship-diagram-erd)
4. [Booking Process Flowchart](#4-booking-process-flowchart)
5. [System Architecture Diagram](#5-system-architecture-diagram)

---

## 1. Use Case Diagram

### 1.1 Actor Definitions

| Actor | Description |
|-------|-------------|
| **Passenger** | End-user who searches and books bus trips |
| **Company Admin** | Bus company owner/manager who manages fleet and trips |
| **System Admin** | Platform administrator with full system access |
| **System** | Automated processes and scheduled tasks |

### 1.2 Complete Use Case Diagram

```mermaid
graph TB
    subgraph Actors
        P[👤 Passenger]
        CA[👔 Company Admin]
        SA[🔧 System Admin]
        SYS[⚙️ System]
    end

    subgraph "Authentication Module"
        UC1[Register Account]
        UC2[Login]
        UC3[Logout]
        UC4[Reset Password]
        UC5[Update Profile]
    end

    subgraph "Trip Search Module"
        UC6[Search Trips]
        UC7[Filter Results]
        UC8[View Trip Details]
        UC9[View Seat Map]
        UC10[Compare Prices]
    end

    subgraph "Booking Module"
        UC11[Select Seats]
        UC12[Enter Passenger Details]
        UC13[Make Payment]
        UC14[View Booking Confirmation]
        UC15[Download E-Ticket]
        UC16[Cancel Booking]
        UC17[View Booking History]
        UC18[Request Refund]
    end

    subgraph "Company Management Module"
        UC19[Register Company]
        UC20[Manage Buses]
        UC21[Manage Routes]
        UC22[Create Trips]
        UC23[Update Trip Status]
        UC24[View Company Bookings]
        UC25[Generate Reports]
        UC26[Update Company Profile]
    end

    subgraph "Admin Module"
        UC27[Manage Users]
        UC28[Manage Companies]
        UC29[Verify Companies]
        UC30[View Analytics]
        UC31[Manage Cities]
        UC32[System Configuration]
    end

    subgraph "System Automated"
        UC33[Expire Pending Bookings]
        UC34[Send Booking Reminders]
        UC35[Update Trip Status Auto]
        UC36[Generate Daily Reports]
    end

    %% Passenger Connections
    P --> UC1
    P --> UC2
    P --> UC3
    P --> UC4
    P --> UC5
    P --> UC6
    P --> UC7
    P --> UC8
    P --> UC9
    P --> UC10
    P --> UC11
    P --> UC12
    P --> UC13
    P --> UC14
    P --> UC15
    P --> UC16
    P --> UC17
    P --> UC18

    %% Company Admin Connections
    CA --> UC2
    CA --> UC3
    CA --> UC5
    CA --> UC19
    CA --> UC20
    CA --> UC21
    CA --> UC22
    CA --> UC23
    CA --> UC24
    CA --> UC25
    CA --> UC26

    %% System Admin Connections
    SA --> UC2
    SA --> UC3
    SA --> UC27
    SA --> UC28
    SA --> UC29
    SA --> UC30
    SA --> UC31
    SA --> UC32

    %% System Automated
    SYS --> UC33
    SYS --> UC34
    SYS --> UC35
    SYS --> UC36
```

### 1.3 Use Case Descriptions

#### Authentication Use Cases

| ID | Use Case | Actor | Description | Preconditions | Postconditions |
|----|----------|-------|-------------|---------------|----------------|
| UC1 | Register Account | Passenger | Create a new user account | None | Account created, verification email sent |
| UC2 | Login | All Users | Authenticate and access system | Valid account exists | User session created |
| UC3 | Logout | All Users | End current session | User is logged in | Session terminated |
| UC4 | Reset Password | Passenger | Request password reset | Valid email exists | Reset link sent to email |
| UC5 | Update Profile | All Users | Modify personal information | User is logged in | Profile updated |

#### Trip Search Use Cases

| ID | Use Case | Actor | Description | Preconditions | Postconditions |
|----|----------|-------|-------------|---------------|----------------|
| UC6 | Search Trips | Passenger | Find available trips | None | List of matching trips displayed |
| UC7 | Filter Results | Passenger | Narrow down search results | Search performed | Filtered results displayed |
| UC8 | View Trip Details | Passenger | See complete trip information | Trip exists | Trip details shown |
| UC9 | View Seat Map | Passenger | See available/booked seats | Trip selected | Seat map displayed |
| UC10 | Compare Prices | Passenger | Compare prices across companies | Multiple trips found | Comparison view shown |

#### Booking Use Cases

| ID | Use Case | Actor | Description | Preconditions | Postconditions |
|----|----------|-------|-------------|---------------|----------------|
| UC11 | Select Seats | Passenger | Choose seats for booking | Trip selected, seats available | Seats temporarily reserved |
| UC12 | Enter Passenger Details | Passenger | Provide passenger information | Seats selected | Passenger info saved |
| UC13 | Make Payment | Passenger | Complete payment transaction | Booking details entered | Payment processed |
| UC14 | View Booking Confirmation | Passenger | See booking summary | Payment successful | Confirmation displayed |
| UC15 | Download E-Ticket | Passenger | Get printable ticket | Booking confirmed | E-ticket generated |
| UC16 | Cancel Booking | Passenger | Cancel an existing booking | Active booking exists | Booking cancelled, refund initiated |
| UC17 | View Booking History | Passenger | See all past bookings | User logged in | Booking list displayed |
| UC18 | Request Refund | Passenger | Request refund for cancellation | Booking cancelled | Refund request submitted |

#### Company Management Use Cases

| ID | Use Case | Actor | Description | Preconditions | Postconditions |
|----|----------|-------|-------------|---------------|----------------|
| UC19 | Register Company | Company Admin | Register new bus company | User account exists | Company pending verification |
| UC20 | Manage Buses | Company Admin | Add/edit/remove buses | Company verified | Bus fleet updated |
| UC21 | Manage Routes | Company Admin | Create/modify routes | Company has buses | Routes configured |
| UC22 | Create Trips | Company Admin | Schedule new trips | Routes exist | Trips scheduled |
| UC23 | Update Trip Status | Company Admin | Change trip status | Trip exists | Status updated |
| UC24 | View Company Bookings | Company Admin | See all bookings for company | Company has trips | Bookings list displayed |
| UC25 | Generate Reports | Company Admin | Create business reports | Bookings exist | Report generated |
| UC26 | Update Company Profile | Company Admin | Modify company information | Company registered | Profile updated |

#### Admin Use Cases

| ID | Use Case | Actor | Description | Preconditions | Postconditions |
|----|----------|-------|-------------|---------------|----------------|
| UC27 | Manage Users | System Admin | View/edit/disable users | Admin logged in | User records updated |
| UC28 | Manage Companies | System Admin | Oversee all companies | Admin logged in | Company records managed |
| UC29 | Verify Companies | System Admin | Approve/reject companies | Pending companies exist | Verification status updated |
| UC30 | View Analytics | System Admin | Access platform statistics | Data exists | Analytics displayed |
| UC31 | Manage Cities | System Admin | Add/edit city database | Admin logged in | Cities updated |
| UC32 | System Configuration | System Admin | Modify system settings | Admin logged in | Settings saved |

---

## 2. Data Flow Diagram (DFD)

### 2.1 Level 0 - Context Diagram

```mermaid
graph LR
    subgraph External Entities
        P[👤 Passenger]
        CA[👔 Company Admin]
        SA[🔧 System Admin]
        PS[💳 Payment System]
        ES[📧 Email Service]
    end

    subgraph "GoBus Nigeria System"
        SYS((GoBus Platform))
    end

    P -->|Search Request| SYS
    P -->|Booking Request| SYS
    P -->|Payment Info| SYS
    SYS -->|Trip Results| P
    SYS -->|Booking Confirmation| P
    SYS -->|E-Ticket| P

    CA -->|Company Data| SYS
    CA -->|Trip Schedules| SYS
    SYS -->|Booking Reports| CA
    SYS -->|Analytics| CA

    SA -->|Admin Commands| SYS
    SYS -->|System Reports| SA

    SYS <-->|Payment Processing| PS
    SYS -->|Notifications| ES
    ES -->|Delivery Status| SYS
```

### 2.2 Level 1 - Detailed DFD

```mermaid
graph TB
    subgraph "External Entities"
        P[👤 Passenger]
        CA[👔 Company Admin]
        SA[🔧 System Admin]
        PS[💳 Payment Gateway]
        ES[📧 Email Service]
    end

    subgraph "Processes"
        P1((1.0<br/>User<br/>Management))
        P2((2.0<br/>Trip<br/>Search))
        P3((3.0<br/>Booking<br/>Management))
        P4((4.0<br/>Payment<br/>Processing))
        P5((5.0<br/>Company<br/>Management))
        P6((6.0<br/>Admin<br/>Management))
        P7((7.0<br/>Notification<br/>Service))
    end

    subgraph "Data Stores"
        D1[(D1: Users)]
        D2[(D2: Companies)]
        D3[(D3: Buses)]
        D4[(D4: Routes)]
        D5[(D5: Trips)]
        D6[(D6: Bookings)]
        D7[(D7: Cities)]
        D8[(D8: Passengers)]
    end

    %% User Management Flows
    P -->|Registration Data| P1
    P -->|Login Credentials| P1
    P1 -->|User Token| P
    P1 <-->|User Records| D1

    %% Trip Search Flows
    P -->|Search Criteria| P2
    P2 -->|Available Trips| P
    P2 <-->|Trip Data| D5
    P2 <-->|Route Data| D4
    P2 <-->|City Data| D7
    P2 <-->|Company Info| D2

    %% Booking Management Flows
    P -->|Booking Request| P3
    P -->|Passenger Details| P3
    P3 -->|Booking Confirmation| P
    P3 <-->|Booking Records| D6
    P3 <-->|Passenger Records| D8
    P3 -->|Seat Update| D5
    P3 -->|Payment Request| P4

    %% Payment Processing Flows
    P -->|Payment Data| P4
    P4 <-->|Transaction| PS
    P4 -->|Payment Status| P3
    P4 -->|Receipt| P

    %% Company Management Flows
    CA -->|Company Data| P5
    CA -->|Bus Data| P5
    CA -->|Route Data| P5
    CA -->|Trip Schedules| P5
    P5 -->|Company Reports| CA
    P5 <-->|Company Records| D2
    P5 <-->|Bus Records| D3
    P5 <-->|Route Records| D4
    P5 <-->|Trip Records| D5

    %% Admin Management Flows
    SA -->|Admin Commands| P6
    P6 -->|System Reports| SA
    P6 <-->|All Data Stores| D1
    P6 <-->|Company Verification| D2

    %% Notification Flows
    P3 -->|Booking Notification| P7
    P7 -->|Email Request| ES
    P7 -->|SMS/Push| P
    ES -->|Delivery Status| P7
```

### 2.3 Data Flow Descriptions

| Flow ID | Source | Destination | Data Description |
|---------|--------|-------------|------------------|
| F1 | Passenger | User Management | Registration: name, email, phone, password |
| F2 | User Management | Passenger | Authentication token, user profile |
| F3 | Passenger | Trip Search | Origin, destination, date, passengers count |
| F4 | Trip Search | Passenger | Available trips with prices, times, companies |
| F5 | Passenger | Booking Management | Selected trip, seats, passenger details |
| F6 | Booking Management | Passenger | Booking confirmation, ticket code |
| F7 | Passenger | Payment Processing | Card details, amount, booking reference |
| F8 | Payment Processing | Payment Gateway | Encrypted payment data |
| F9 | Payment Gateway | Payment Processing | Transaction status, reference |
| F10 | Company Admin | Company Management | Company profile, buses, routes, trips |
| F11 | Company Management | Company Admin | Booking reports, analytics, revenue |
| F12 | System Admin | Admin Management | User management, company verification |
| F13 | Booking Management | Notification Service | Booking details for confirmation |
| F14 | Notification Service | Email Service | Email content, recipient |

---

## 3. Entity Relationship Diagram (ERD)

### 3.1 Complete ERD

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    USERS ||--o{ PROFILES : has
    USERS ||--o{ COMPANIES : owns
    USERS ||--o{ BOOKINGS : makes
    
    COMPANIES ||--o{ BUSES : owns
    COMPANIES ||--o{ ROUTES : operates
    
    CITIES ||--o{ ROUTES : origin
    CITIES ||--o{ ROUTES : destination
    
    ROUTES ||--o{ TRIPS : scheduled_on
    BUSES ||--o{ TRIPS : assigned_to
    
    TRIPS ||--o{ BOOKINGS : booked_for
    BOOKINGS ||--o{ BOOKING_PASSENGERS : contains

    USERS {
        uuid id PK
        string email UK
        string encrypted_password
        timestamp created_at
        timestamp last_sign_in_at
    }

    PROFILES {
        uuid id PK
        uuid user_id FK
        string full_name
        string phone
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        enum role "admin|company_admin|passenger"
    }

    COMPANIES {
        uuid id PK
        uuid owner_id FK
        string name
        string description
        string logo_url
        boolean is_verified
        decimal rating
        integer total_trips
        timestamp created_at
        timestamp updated_at
    }

    CITIES {
        uuid id PK
        string name UK
        string state
        timestamp created_at
    }

    BUSES {
        uuid id PK
        uuid company_id FK
        string plate_number UK
        enum bus_type "standard|luxury|executive"
        integer total_seats
        json amenities
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    ROUTES {
        uuid id PK
        uuid company_id FK
        uuid origin_city_id FK
        uuid destination_city_id FK
        decimal base_price
        decimal duration_hours
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TRIPS {
        uuid id PK
        uuid route_id FK
        uuid bus_id FK
        timestamp departure_time
        timestamp arrival_time
        decimal price
        integer available_seats
        enum status "scheduled|boarding|departed|arrived|cancelled"
        timestamp created_at
        timestamp updated_at
    }

    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid trip_id FK
        string ticket_code UK
        string passenger_name
        string passenger_email
        string passenger_phone
        json seats
        decimal total_amount
        enum status "pending|confirmed|cancelled|expired"
        timestamp hold_expires_at
        timestamp payment_completed_at
        timestamp cancelled_at
        string cancellation_reason
        timestamp created_at
        timestamp updated_at
    }

    BOOKING_PASSENGERS {
        uuid id PK
        uuid booking_id FK
        string seat_number
        string full_name
        string phone
        string email
        string nin
        timestamp created_at
    }
```

### 3.2 Entity Descriptions

#### Core Entities

| Entity | Description | Key Relationships |
|--------|-------------|-------------------|
| **USERS** | Authentication records from auth system | Parent of PROFILES, USER_ROLES, COMPANIES, BOOKINGS |
| **PROFILES** | Extended user information | Belongs to USERS |
| **USER_ROLES** | Role assignments (admin, company_admin, passenger) | Belongs to USERS |
| **COMPANIES** | Bus company organizations | Belongs to USERS, parent of BUSES, ROUTES |
| **CITIES** | Nigerian cities/destinations | Referenced by ROUTES |
| **BUSES** | Individual bus vehicles | Belongs to COMPANIES, assigned to TRIPS |
| **ROUTES** | Travel routes between cities | Belongs to COMPANIES, parent of TRIPS |
| **TRIPS** | Scheduled bus departures | Belongs to ROUTES and BUSES, parent of BOOKINGS |
| **BOOKINGS** | Customer reservations | Belongs to USERS and TRIPS, parent of BOOKING_PASSENGERS |
| **BOOKING_PASSENGERS** | Individual passenger details per seat | Belongs to BOOKINGS |

### 3.3 Attribute Details

#### USERS Table
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| encrypted_password | VARCHAR(255) | NOT NULL | Hashed password |
| created_at | TIMESTAMP | NOT NULL | Account creation time |
| last_sign_in_at | TIMESTAMP | | Last login timestamp |

#### BOOKINGS Table
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → USERS | Booking owner |
| trip_id | UUID | FK → TRIPS | Associated trip |
| ticket_code | VARCHAR(20) | UNIQUE | Readable ticket reference |
| passenger_name | VARCHAR(100) | NOT NULL | Primary passenger name |
| passenger_email | VARCHAR(255) | NOT NULL | Contact email |
| passenger_phone | VARCHAR(20) | NOT NULL | Contact phone |
| seats | JSON | NOT NULL | Array of selected seat numbers |
| total_amount | DECIMAL(10,2) | NOT NULL | Total booking cost |
| status | ENUM | NOT NULL | pending/confirmed/cancelled/expired |
| hold_expires_at | TIMESTAMP | | Reservation expiry time |
| payment_completed_at | TIMESTAMP | | Payment confirmation time |
| cancelled_at | TIMESTAMP | | Cancellation time |
| cancellation_reason | TEXT | | Reason for cancellation |

#### BOOKING_PASSENGERS Table
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| booking_id | UUID | FK → BOOKINGS | Parent booking |
| seat_number | VARCHAR(10) | NOT NULL | Assigned seat (e.g., "A1") |
| full_name | VARCHAR(100) | NOT NULL | Passenger full name |
| phone | VARCHAR(20) | NOT NULL | Passenger phone |
| email | VARCHAR(255) | | Passenger email (optional) |
| nin | VARCHAR(20) | | National ID number (optional) |

**CRITICAL CONSTRAINT**: One passenger per seat per trip. Enforced by database trigger `check_seat_availability()`.

---

## 4. Booking Process Flowchart

### 4.1 Complete Booking Flow

```mermaid
flowchart TD
    A[🚀 Start] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    C --> D[Login/Register]
    D --> B
    B -->|Yes| E[Search Trips]
    
    E --> F[Enter Origin & Destination]
    F --> G[Select Travel Date]
    G --> H[Specify Passengers Count]
    H --> I[Submit Search]
    
    I --> J{Trips Found?}
    J -->|No| K[Show No Results Message]
    K --> L{Modify Search?}
    L -->|Yes| F
    L -->|No| M[🔚 End]
    
    J -->|Yes| N[Display Available Trips]
    N --> O[Apply Filters/Sort]
    O --> P[Select Trip]
    
    P --> Q[View Trip Details]
    Q --> R[Load Seat Map]
    R --> S[Display Available Seats]
    
    S --> T{Seats Available?}
    T -->|No| U[Show Fully Booked]
    U --> N
    
    T -->|Yes| V[Select Seat]
    V --> W{More Passengers?}
    W -->|Yes| V
    W -->|No| X[Confirm Seat Selection]
    
    X --> Y[⏱️ Start Reservation Timer]
    Y --> Z[Enter Passenger Details]
    
    Z --> AA[For Each Passenger]
    AA --> AB[Enter Full Name]
    AB --> AC[Enter Phone Number]
    AC --> AD[Enter Email Optional]
    AD --> AE[Enter NIN Optional]
    AE --> AF{More Passengers?}
    AF -->|Yes| AA
    AF -->|No| AG[Validate All Details]
    
    AG --> AH{Validation OK?}
    AH -->|No| AI[Show Errors]
    AI --> AA
    
    AH -->|Yes| AJ[Create Pending Booking]
    AJ --> AK[Generate Ticket Code]
    AK --> AL[Calculate Total Amount]
    
    AL --> AM[Display Payment Summary]
    AM --> AN[Select Payment Method]
    AN --> AO[Enter Payment Details]
    
    AO --> AP{Timer Expired?}
    AP -->|Yes| AQ[❌ Booking Expired]
    AQ --> AR[Release Seats]
    AR --> S
    
    AP -->|No| AS[Process Payment]
    AS --> AT{Payment Successful?}
    
    AT -->|No| AU[Show Payment Error]
    AU --> AV{Retry Payment?}
    AV -->|Yes| AN
    AV -->|No| AW[Cancel Booking]
    AW --> AR
    
    AT -->|Yes| AX[✅ Confirm Booking]
    AX --> AY[Update Booking Status]
    AY --> AZ[Reduce Available Seats]
    AZ --> BA[Send Confirmation Email]
    BA --> BB[Generate E-Ticket]
    BB --> BC[Display Confirmation]
    BC --> BD[🎉 End - Success]
```

### 4.2 Booking Cancellation Flow

```mermaid
flowchart TD
    A[Start Cancellation] --> B[Select Booking]
    B --> C{Booking Status?}
    
    C -->|Already Cancelled| D[Show Already Cancelled]
    D --> E[End]
    
    C -->|Expired| F[Show Expired Message]
    F --> E
    
    C -->|Pending| G[Cancel Without Refund]
    G --> H[Release Seats]
    H --> I[Update Status to Cancelled]
    I --> J[Send Cancellation Email]
    J --> E
    
    C -->|Confirmed| K{Check Departure Time}
    K -->|< 24 Hours| L[Show No Refund Policy]
    L --> M{Proceed Anyway?}
    M -->|No| E
    M -->|Yes| N[Cancel Without Refund]
    
    K -->|>= 24 Hours| O[Calculate Refund Amount]
    O --> P[Show Refund Details]
    P --> Q{Confirm Cancellation?}
    Q -->|No| E
    Q -->|Yes| R[Process Refund]
    R --> S[Update Booking Status]
    S --> T[Release Seats]
    T --> U[Send Cancellation + Refund Email]
    U --> E
    
    N --> H
```

### 4.3 Reservation Timer Logic

```mermaid
flowchart LR
    subgraph "Timer Calculation"
        A[Check Available Seats] --> B{Seats Remaining?}
        B -->|> 50%| C[30 min timer]
        B -->|20-50%| D[45 min timer]
        B -->|10-20%| E[1 hour timer]
        B -->|< 10%| F[2 hour timer]
    end
    
    subgraph "Timer Actions"
        G[Timer Running] --> H{User Active?}
        H -->|Yes| I[Continue]
        H -->|No| J{5 min warning?}
        J -->|Yes| K[Show Warning]
        J -->|No| L{Timer = 0?}
        L -->|Yes| M[Expire Booking]
        L -->|No| I
    end
```

---

## 5. System Architecture Diagram

### 5.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[🌐 Web Application<br/>React + Vite]
        MOB[📱 Mobile Browser]
    end

    subgraph "CDN & Static Assets"
        CDN[☁️ CDN<br/>Static Files]
    end

    subgraph "Application Layer"
        API[🔌 API Gateway]
        
        subgraph "Backend Options"
            SB[Supabase Backend]
            DJ[Django Backend]
        end
    end

    subgraph "Supabase Services"
        AUTH[🔐 Auth Service]
        DB[(🗄️ PostgreSQL)]
        STORE[📦 Storage]
        EDGE[⚡ Edge Functions]
        RT[🔄 Realtime]
    end

    subgraph "External Services"
        PAY[💳 Payment Gateway<br/>Paystack/Flutterwave]
        EMAIL[📧 Email Service<br/>Resend]
        SMS[📱 SMS Service]
    end

    WEB --> CDN
    MOB --> CDN
    CDN --> API
    
    API --> SB
    API --> DJ
    
    SB --> AUTH
    SB --> DB
    SB --> STORE
    SB --> EDGE
    SB --> RT
    
    DJ --> DB
    
    EDGE --> PAY
    EDGE --> EMAIL
    EDGE --> SMS
```

### 5.2 Component Architecture

```mermaid
graph TB
    subgraph "Frontend Components"
        subgraph "Pages"
            HOME[Home]
            SEARCH[Search Results]
            TRIP[Trip Details]
            BOOK[Booking Form]
            PAY[Payment]
            CONFIRM[Confirmation]
            PROFILE[User Profile]
            MYBK[My Bookings]
        end
        
        subgraph "Shared Components"
            NAV[Navigation]
            FOOTER[Footer]
            SMAP[Seat Map]
            PFORM[Passenger Form]
            TCARD[Trip Card]
        end
        
        subgraph "Hooks & Context"
            AUTH_CTX[Auth Context]
            BOOK_HOOK[useBookTrip]
            MULTI_HOOK[useMultiPassenger]
            COMPANY_HOOK[useCompany]
        end
    end
    
    subgraph "API Layer"
        API_SVC[API Service<br/>Switchable Backend]
        SUPABASE_API[Supabase Adapter]
        DJANGO_API[Django Adapter]
    end
    
    HOME --> NAV
    HOME --> FOOTER
    SEARCH --> TCARD
    TRIP --> SMAP
    BOOK --> PFORM
    
    BOOK_HOOK --> API_SVC
    API_SVC --> SUPABASE_API
    API_SVC --> DJANGO_API
```

---

## 6. State Diagrams

### 6.1 Booking Status States

```mermaid
stateDiagram-v2
    [*] --> Pending: Create Booking
    
    Pending --> Confirmed: Payment Success
    Pending --> Expired: Timer Expires
    Pending --> Cancelled: User Cancels
    
    Confirmed --> Cancelled: User Cancels
    Confirmed --> Completed: Trip Completed
    
    Cancelled --> Refunded: Refund Processed
    
    Expired --> [*]
    Refunded --> [*]
    Completed --> [*]
    
    note right of Pending
        Seats temporarily held
        Timer active (30min - 2hr)
    end note
    
    note right of Confirmed
        Payment received
        E-ticket generated
    end note
    
    note right of Cancelled
        Seats released
        Refund may apply
    end note
```

### 6.2 Trip Status States

```mermaid
stateDiagram-v2
    [*] --> Scheduled: Trip Created
    
    Scheduled --> Boarding: 30 min before departure
    Scheduled --> Cancelled: Company Cancels
    
    Boarding --> Departed: Bus Departs
    Boarding --> Cancelled: Company Cancels
    
    Departed --> Arrived: Reaches Destination
    
    Arrived --> [*]
    Cancelled --> [*]
    
    note right of Scheduled
        Bookings open
        Seats available
    end note
    
    note right of Boarding
        No new bookings
        Passengers checking in
    end note
```

---

## 7. Sequence Diagrams

### 7.1 Booking Creation Sequence

```mermaid
sequenceDiagram
    autonumber
    actor P as Passenger
    participant UI as Web UI
    participant API as API Layer
    participant DB as Database
    participant PAY as Payment Gateway
    participant EMAIL as Email Service

    P->>UI: Select trip and seats
    UI->>API: POST /bookings (trip_id, seats, passengers)
    
    API->>DB: Check seat availability
    DB-->>API: Seats available
    
    API->>DB: Create pending booking
    API->>DB: Create booking_passengers
    API->>DB: Update trip available_seats
    DB-->>API: Booking created
    
    API-->>UI: Booking ID + payment URL
    UI-->>P: Redirect to payment
    
    P->>PAY: Enter payment details
    PAY-->>API: Payment webhook (success)
    
    API->>DB: Update booking status = confirmed
    API->>DB: Set payment_completed_at
    
    API->>EMAIL: Send confirmation email
    EMAIL-->>P: Booking confirmation + E-ticket
    
    API-->>UI: Payment success
    UI-->>P: Show confirmation page
```

### 7.2 Seat Validation Sequence

```mermaid
sequenceDiagram
    autonumber
    participant UI as Web UI
    participant API as API Layer
    participant DB as Database
    participant TRIGGER as DB Trigger

    UI->>API: Request booking (seats: [A1, A2])
    API->>DB: BEGIN TRANSACTION
    
    API->>DB: SELECT FOR UPDATE trip
    Note over DB: Lock trip row
    
    API->>DB: INSERT booking_passengers
    DB->>TRIGGER: check_seat_availability()
    
    alt Seats Available
        TRIGGER-->>DB: OK
        DB-->>API: Insert successful
        API->>DB: COMMIT
        API-->>UI: Booking confirmed
    else Seats Already Booked
        TRIGGER-->>DB: RAISE EXCEPTION
        DB-->>API: Error: Seat already booked
        API->>DB: ROLLBACK
        API-->>UI: Error 409 Conflict
    end
```

---

## 8. Deployment Diagram

```mermaid
graph TB
    subgraph "User Devices"
        BROWSER[🌐 Web Browser]
        MOBILE[📱 Mobile Browser]
    end

    subgraph "Lovable Cloud"
        subgraph "Frontend Hosting"
            VITE[Vite Build]
            STATIC[Static Assets]
        end
        
        subgraph "Backend Services"
            SUPA_AUTH[Authentication]
            SUPA_DB[(PostgreSQL)]
            SUPA_STORAGE[File Storage]
            EDGE_FN[Edge Functions]
        end
    end

    subgraph "Alternative: Django Deployment"
        NGINX[Nginx]
        GUNICORN[Gunicorn]
        DJANGO[Django App]
        PG_DB[(PostgreSQL)]
    end

    subgraph "External Services"
        PAYSTACK[Paystack API]
        RESEND[Resend Email]
    end

    BROWSER --> VITE
    MOBILE --> VITE
    VITE --> STATIC
    VITE --> SUPA_AUTH
    SUPA_AUTH --> SUPA_DB
    EDGE_FN --> SUPA_DB
    EDGE_FN --> SUPA_STORAGE
    EDGE_FN --> PAYSTACK
    EDGE_FN --> RESEND

    NGINX --> GUNICORN
    GUNICORN --> DJANGO
    DJANGO --> PG_DB
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-24 | System | Initial diagram documentation |

---

## Notes

1. **Seat Uniqueness**: The system enforces one passenger per seat per trip through a database trigger (`check_seat_availability`).

2. **Backend Flexibility**: The system supports both Supabase and Django backends, switchable via `VITE_API_BACKEND` environment variable.

3. **Real-time Updates**: Seat availability updates in real-time using Supabase Realtime subscriptions.

4. **Timer-based Reservations**: Pending bookings have dynamic hold times based on trip demand (30 min to 2 hours).
