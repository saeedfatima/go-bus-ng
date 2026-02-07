

# Django Integration Enhancement Plan

This plan covers four major additions: (1) Django setup guidance documentation, (2) frontend enhancements for Django integration, (3) OTP verification during registration, (4) e-ticket email sending via Django, and (5) Paystack payment gateway integration.

---

## 1. Django Setup Guide Documentation

**File: `docs/DJANGO_SETUP_GUIDE.md`**

A step-by-step guide covering:
- Prerequisites (Python 3.10+, pip, virtualenv)
- Environment setup with `.env.example` template
- Database migration and seeding
- CORS configuration for frontend connection
- Setting `VITE_API_BACKEND=django` in the frontend
- Testing connectivity between frontend and Django
- Troubleshooting common issues (CORS, JWT, field mapping)

---

## 2. Frontend Django Integration Enhancements

### 2a. Update Django Auth Service for OTP Verification

**File: `src/services/api/django/index.ts`**

Add the following to `DjangoAuthService`:
- `verifyOtp(email, otpCode)` -- calls `POST /api/v1/auth/verify-otp/`
- `resendOtp(email)` -- calls `POST /api/v1/auth/resend-otp/`
- Update `signUp()` to NOT auto-login (Django will require OTP verification first)
- Update `signIn()` to handle `otp_required` response from Django

### 2b. Add Paystack Payment Methods

**File: `src/services/api/django/index.ts`**

Add to `DjangoFunctionsService` or create a new `DjangoPaymentService`:
- `initializePayment(bookingId, email, amount)` -- calls `POST /api/v1/payments/initialize/`
- `verifyPayment(reference)` -- calls `GET /api/v1/payments/verify/?reference=xxx`

### 2c. Add E-Ticket Email Trigger

**File: `src/services/api/django/index.ts`**

Add to `DjangoFunctionsService`:
- `sendBookingEmail(bookingId)` -- calls `POST /api/v1/functions/send-booking-email/`

### 2d. Update API Types

**File: `src/services/api/types.ts`**

Add new types:
- `OtpVerifyResult` -- `{ verified: boolean; session?: ApiSession; error?: Error }`
- `PaystackInitResult` -- `{ authorizationUrl: string; accessCode: string; reference: string }`
- `PaystackVerifyResult` -- `{ status: string; reference: string; amount: number }`

### 2e. Update API Interfaces

**File: `src/services/api/interfaces.ts`**

Add to `IAuthService`:
- `verifyOtp?(email: string, code: string): Promise<ApiAuthResult>`
- `resendOtp?(email: string): Promise<{ error?: Error }>`

Add new `IPaymentService` interface:
- `initializePayment(bookingId: string, email: string, amount: number): Promise<PaystackInitResult>`
- `verifyPayment(reference: string): Promise<PaystackVerifyResult>`

Add to `IApiService`:
- `payments?: IPaymentService`

---

## 3. OTP Verification Frontend Component

**File: `src/components/auth/OtpVerification.tsx`**

A reusable OTP input modal/page that:
- Displays 6-digit OTP input using the existing `InputOTP` component
- Has a "Resend OTP" button with cooldown timer (60 seconds)
- Handles verification and redirects on success
- Shows clear error messages for invalid/expired OTP

### Integration Points

**File: `src/pages/Login.tsx`**

- After successful signup with Django backend, show the OTP verification step instead of "check your email"
- After OTP is verified, redirect to home page

**File: `src/pages/CompanyRegister.tsx`**

- Same OTP flow after company registration

---

## 4. Django Backend Documentation Updates

**File: `docs/DJANGO_BACKEND_STRUCTURE.md`**

### 4a. OTP System (new section)

Add complete Django implementation for:
- `OtpCode` model -- stores OTP code, email, expiry, is_used fields
- `send_otp(email)` utility -- generates 6-digit code, sends via email (Django email backend or third-party SMS API)
- `POST /api/v1/auth/verify-otp/` view -- validates OTP, activates user, returns JWT tokens
- `POST /api/v1/auth/resend-otp/` view -- rate-limited, generates new OTP
- Updated `register` view -- creates inactive user, sends OTP, returns `{ otp_required: true }`
- OTP expiry management command

### 4b. E-Ticket Email System (new section)

Add complete Django implementation for:
- Email templates using Django template engine (HTML e-ticket matching existing design)
- `send_booking_email(booking_id)` utility function
- `POST /api/v1/functions/send-booking-email/` view -- fetches booking, generates ticket, sends email
- Configuration for email backends (SMTP, SendGrid, or Resend)
- Email template files matching the existing Resend edge function design

### 4c. Paystack Payment Gateway (new section)

Add complete Django implementation for:
- `PaystackService` utility class with `initialize` and `verify` methods
- `Payment` model -- tracks payment reference, amount, status, booking link
- `POST /api/v1/payments/initialize/` -- creates Paystack transaction, returns authorization URL
- `GET /api/v1/payments/verify/` -- verifies payment with Paystack API, updates booking status
- `POST /api/v1/payments/webhook/` -- handles Paystack webhook callbacks (charge.success event)
- Paystack settings configuration (`PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`)
- Updated URL configuration

---

## 5. Paystack Frontend Integration

**File: `src/pages/BookingPayment.tsx`**

Update the payment page to:
- Detect the current backend (`supabase` or `django`)
- When Django backend is active:
  - Call `payments.initializePayment()` instead of mock payment
  - Redirect user to Paystack checkout URL
  - Handle callback/redirect with payment verification
  - Update booking status on successful verification
- Keep existing mock payment for Supabase backend

**File: `src/hooks/usePaystack.ts`** (new)

A custom hook for Paystack integration:
- `initializePayment(bookingId, email, amount)` -- calls Django API
- `verifyPayment(reference)` -- calls Django API
- Handles redirect flow and verification polling

---

## Technical Notes

- All changes preserve the existing Supabase integration completely
- The OTP, email, and Paystack features are Django-backend-specific and only activate when `VITE_API_BACKEND=django`
- The frontend uses optional interface methods (`verifyOtp?`, `payments?`) so Supabase implementation remains unaffected
- Django URL patterns for new endpoints follow the existing `create/`, `update/`, `delete/` convention
- OTP codes use 6-digit numeric format with 10-minute expiry
- Paystack integration uses the standard initialize-redirect-verify flow

