import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Resend API helper
const sendEmail = async (apiKey: string, options: { from: string; to: string[]; subject: string; html: string }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return response.json();
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  bookingId: string;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, userEmail }: EmailRequest = await req.json();
    console.log("Request payload:", { bookingId, userEmail });

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        trip:trips(
          *,
          route:routes(
            *,
            origin_city:cities!routes_origin_city_id_fkey(name, state),
            destination_city:cities!routes_destination_city_id_fkey(name, state)
          ),
          bus:buses(
            *,
            company:companies(name, logo_url, is_verified)
          )
        ),
        passengers:booking_passengers(*)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking fetch error:", bookingError);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Booking fetched successfully:", booking.ticket_code);

    const recipientEmail = userEmail || booking.passenger_email;
    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "No email address provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const trip = booking.trip;
    const departureDate = new Date(trip.departure_time);
    const arrivalDate = new Date(trip.arrival_time);

    // Format passengers list
    const passengersList = booking.passengers
      ?.map((p: any, i: number) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.full_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.seat_number}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.phone}</td>
        </tr>
      `)
      .join("") || "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your E-Ticket - NigeriaBus</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚌 NigeriaBus</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your E-Ticket</p>
          </div>

          <!-- Booking Reference -->
          <div style="background: #f0fdf4; padding: 20px; text-align: center; border-bottom: 2px dashed #16a34a;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Booking Reference</p>
            <p style="margin: 5px 0 0; font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 3px;">${booking.ticket_code}</p>
          </div>

          <!-- Trip Details -->
          <div style="padding: 30px;">
            <!-- Route -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px;">
              <div style="text-align: center; flex: 1;">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #111827;">${trip.route?.origin_city?.name}</p>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">${trip.route?.origin_city?.state}</p>
              </div>
              <div style="padding: 0 20px;">
                <div style="width: 60px; height: 2px; background: #d1d5db;"></div>
                <p style="margin: 5px 0; font-size: 12px; color: #9ca3af; text-align: center;">${trip.route?.duration_hours}h</p>
              </div>
              <div style="text-align: center; flex: 1;">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #111827;">${trip.route?.destination_city?.name}</p>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">${trip.route?.destination_city?.state}</p>
              </div>
            </div>

            <!-- Details Grid -->
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 12px;">📅 DATE</span><br>
                    <strong>${departureDate.toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 12px;">🕐 TIME</span><br>
                    <strong>${departureDate.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #6b7280; font-size: 12px;">🚌 BUS</span><br>
                    <strong>${trip.bus?.company?.name}</strong><br>
                    <span style="color: #6b7280; font-size: 12px; text-transform: capitalize;">${trip.bus?.bus_type} Bus</span>
                  </td>
                  <td style="padding: 10px 0;">
                    <span style="color: #6b7280; font-size: 12px;">💺 SEATS</span><br>
                    <strong>${booking.seats?.join(", ")}</strong>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Passengers -->
            <h3 style="margin: 20px 0 10px; color: #111827;">Passengers</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">#</th>
                  <th style="padding: 10px; text-align: left;">Name</th>
                  <th style="padding: 10px; text-align: left;">Seat</th>
                  <th style="padding: 10px; text-align: left;">Phone</th>
                </tr>
              </thead>
              <tbody>
                ${passengersList}
              </tbody>
            </table>

            <!-- Total -->
            <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; text-align: right;">
              <span style="color: #6b7280;">Total Paid: </span>
              <strong style="font-size: 20px; color: #16a34a;">₦${Number(booking.total_amount).toLocaleString()}</strong>
            </div>
          </div>

          <!-- Boarding Instructions -->
          <div style="background: #1f2937; color: white; padding: 20px;">
            <h3 style="margin: 0 0 10px; font-size: 14px;">📋 BOARDING INSTRUCTIONS</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #d1d5db;">
              <li>Arrive at the terminal 30 minutes before departure</li>
              <li>Present this e-ticket (printed or on screen) at the gate</li>
              <li>Have a valid ID ready for verification</li>
              <li>Keep your booking reference handy</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Need help? Contact our support team</p>
            <p style="margin: 5px 0 0; color: #111827; font-size: 14px; font-weight: 500;">support@nigeriabus.com • +234 800 123 4567</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("Sending email to:", recipientEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await sendEmail(resendApiKey, {
      from: "NigeriaBus <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Your E-Ticket: ${trip.route?.origin_city?.name} → ${trip.route?.destination_city?.name} - ${booking.ticket_code}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
