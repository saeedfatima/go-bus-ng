# How to Deploy Go-Bus-NG to Render

Follow these exact steps to fully deploy both your Django Backend and React Frontend.

## Step 1: Push Your Code to GitHub
1. Make sure all these recent changes (the `build.sh` file, `settings.py` modifications, `.env.production`) are committed and pushed to your GitHub repository.

## Step 2: Create a Render Account
1. Go to [Render.com](https://render.com) and create a free account (sign up using your GitHub account for easy access).

## Step 3: Create the PostgreSQL Database
1. In your Render Dashboard, click **New +** and select **PostgreSQL**.
2. Give it a name (e.g., `go-bus-ng-db`).
3. Select your region (e.g., Frankfurt or Ohio).
4. Select the **Free** instance type.
5. Click **Create Database**.
6. *Wait about 1 minute.* Once it says "Available", scroll down to the "Connections" section and copy the **Internal Database URL** (it starts with `postgres://...`). You will need this in Step 4.

## Step 4: Deploy the Django Backend
1. Click **New +** again, and select **Web Service**.
2. Select **"Build and deploy from a Git repository"** and connect to your `go-bus-ng` GitHub repository.
3. Fill in the required fields:
   * **Name**: `go-bus-ng-backend` (or whatever you prefer)
   * **Root Directory**: `bus_booking_backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `./build.sh`
   * **Start Command**: `gunicorn bus_booking.wsgi:application`
   * **Instance Type**: Select **Free**.
4. Select **Advanced** -> **Environment Variables** and add:
   * Key: `FRONTEND_URL` | Value: `https://go-bus-ng-frontend.onrender.com`
   * Key: `PAYSTACK_SECRET_KEY` | Value: *(Your Live Secret Key from Paystack Dashboard)*
   * Key: `PAYSTACK_CALLBACK_URL` | Value: `https://go-bus-ng-frontend.onrender.com/booking/{id}/payment`
   * Key: `PAYSTACK_WEBHOOK_SECRET` | Value: *(Your Webhook Secret from Paystack)*
   * Key: `DATABASE_URL` | Value: *(Automatically link your Render PostgreSQL)*
   * Key: `DJANGO_SECRET_KEY` | Value: *(Type a long random string)*
   * Key: `DEBUG` | Value: `False`
   * Key: `ALLOWED_HOSTS` | Value: `*`
   * Key: `CORS_ALLOW_ALL_ORIGINS` | Value: `True`
   * Key: `EMAIL_HOST` | Value: `smtp-relay.brevo.com`
   * Key: `EMAIL_PORT` | Value: `587`
   * Key: `EMAIL_HOST_USER` | Value: *(Your Brevo SMTP login)*
   * Key: `EMAIL_HOST_PASSWORD` | Value: *(Your Brevo SMTP key)*
   * Key: `EMAIL_USE_TLS` | Value: `True`
   * Key: `EMAIL_USE_SSL` | Value: `False`
   * Key: `EMAIL_TIMEOUT` | Value: `20`
   * Key: `DEFAULT_FROM_EMAIL` | Value: *(A sender address you verified in Brevo, e.g. `noreply@yourdomain.com`)*
   * Key: `OTP_RESEND_COOLDOWN_SECONDS` | Value: `60`
   * Key: `OTP_EXPIRY_MINUTES` | Value: `10`
   * Key: `OTP_MAX_FAILED_ATTEMPTS` | Value: `5`
6. Click **Create Web Service**.
7. Render will now build your app. This might take 3-5 minutes.

---

### Step 7: Brevo SMTP Setup
Use Brevo for transactional email on Render. It is a better fit than Resend for this project because it gives you a normal SMTP relay, verified senders, and straightforward transactional delivery.

1. Create a Brevo account at `https://www.brevo.com/`.
2. Verify your account email and complete any initial business/profile checks Brevo asks for.
3. In Brevo, go to `Settings` -> `Senders, Domains & Dedicated IPs`.
4. Add and verify a sender email, or authenticate your domain if you want better deliverability.
5. Go to `SMTP & API` and generate an SMTP key.
6. In your **Render Dashboard -> Environment**, add/update these variables:
   * Key: `EMAIL_HOST` | Value: `smtp-relay.brevo.com`
   * Key: `EMAIL_PORT` | Value: `587`
   * Key: `EMAIL_HOST_USER` | Value: *(Your Brevo SMTP login)*
   * Key: `EMAIL_HOST_PASSWORD` | Value: *(Your Brevo SMTP key)*
   * Key: `EMAIL_USE_TLS` | Value: `True`
   * Key: `EMAIL_USE_SSL` | Value: `False`
   * Key: `EMAIL_TIMEOUT` | Value: `20`
   * Key: `DEFAULT_FROM_EMAIL` | Value: *(The same sender email you verified in Brevo)*

> [!IMPORTANT]
> Use port `587` with `EMAIL_USE_TLS=True` on Render. Avoid implicit SSL on `465` unless Brevo explicitly tells you to use it for your account and you have tested it from Render.

> [!IMPORTANT]
> `DEFAULT_FROM_EMAIL` must match a sender email or domain you have verified in Brevo. If the sender is not verified, OTP, booking confirmation, and ticket emails may fail even when OTP generation is working.

### Step 8: Fix "Not Found" (404) Errors on Refresh/Redirect
Since this is a Single Page Application (SPA), Render needs to be told to redirect all paths to `index.html`.

1. In the **Render Dashboard**, go to your **Frontend Static Site**.
2. Click on **Redirects/Rewrites**.
3. Add a new rule:
   * **Source**: `/*`
   * **Destination**: `/index.html`
   * **Action**: `Rewrite`
4. Click **Save Changes**.

*(This ensures that when Paystack redirects you to `/booking/.../payment`, the React app loads correctly instead of showing a 404.)*

---

### Step 6: Paystack Webhook Setup (Crucial)
To ensure bookings are automatically confirmed even if a user closes their browser:

1. Log in to your **Paystack Dashboard**.
2. Go to **Settings** -> **API Keys & Webhooks**.
3. Scroll to **Webhooks**.
4. Set the **Webhook URL** to:
   `https://go-bus-ng-backend.onrender.com/api/v1/payments/webhook/`
6. Click **Save Changes**.
7. Copy the **Webhook Secret** (if shown) and paste it into the `PAYSTACK_WEBHOOK_SECRET` variable on Render.  
   *(Note: If Paystack doesn't show a secret, don't worry! My code will automatically use your main **Secret Key** as the fallback.)*

## Step 5: Automate Superadmin Creation (Optional but recommended)
Since Render's free tier does not support the interactive shell for `createsuperuser`, you can automate this using environment variables.

1. Still in the **Environment** tab on Render, add these variables:
   * Key: `ADMIN_EMAIL` | Value: *(e.g., yourname@example.com)*
   * Key: `ADMIN_PASSWORD` | Value: *(e.g., a strong password)*
2. Click **Save Changes**.
3. Render will rebuild and deploy your app. Once finished, you can log in at `https://go-bus-ng-backend.onrender.com/admin/`.
*(Note: You can delete these two environment variables from Render once the admin user is created!)*

## Step 6: Update the Frontend API URL
1. In your local code editor, open `frontend/.env.production`.
2. Ensure the `VITE_DJANGO_API_URL` exactly matches your backend URL:
   `VITE_DJANGO_API_URL=https://go-bus-ng-backend.onrender.com`
3. Commit and push this change to GitHub.

## Step 6: Deploy the React Frontend
1. Back in the Render Dashboard, click **New +** and select **Static Site**.
2. Select your `go-bus-ng` GitHub repository.
3. Fill in the required fields:
   * **Name**: `go-bus-ng-frontend`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Publish directory**: `dist`
4. Click **Create Static Site**.
5. Once live, open your frontend URL!

## Troubleshooting
* **Backend 500 / CORS Error:** Check the **Logs** tab on Render to see the Python error message.
* **Email Not Sending:** 
  1. Check Render logs for the SMTP host and timeout error details.
  2. For Brevo, use `EMAIL_HOST=smtp-relay.brevo.com`, `EMAIL_PORT=587`, `EMAIL_USE_TLS=True`, and `EMAIL_USE_SSL=False`.
  3. Ensure `DEFAULT_FROM_EMAIL` matches an address or domain you verified in Brevo.
  4. If a resend endpoint returns `429`, wait for the cooldown to expire before requesting another OTP.
* **Database Connection:** Ensure `DATABASE_URL` is correctly linked to your Render PostgreSQL instance.

## That's it!
Your database, backend, and frontend are now live with automated emails for OTPs, password resets, and bus tickets! 🚌💨
