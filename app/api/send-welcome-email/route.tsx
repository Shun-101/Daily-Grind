import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, nickname } = await request.json()

    // In a production environment, you would use a service like Resend, SendGrid, or Supabase's email service
    // For now, we'll log the welcome email
    console.log(`[v0] Sending welcome email to ${email}`)

    // TODO: Integrate with email service
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Daily Grind <noreply@dailygrind.app>',
    //   to: email,
    //   subject: 'Welcome to the Grind! Your Account is Confirmed',
    //   html: welcomeEmailTemplate(nickname)
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error sending welcome email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

function welcomeEmailTemplate(nickname: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 14px 28px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Welcome to Daily Grind!</h1>
          </div>
          <div class="content">
            <h2>A huge thank you for verifying your email!</h2>
            <p>Hey ${nickname},</p>
            <p>Your Daily Grind account is now active and ready to go. We truly appreciate you taking the time to join our community.</p>
            <p>You're all set to start crushing your goals and building productive habits. Here's what you can do now:</p>
            <ul>
              <li>📝 Create and organize your tasks</li>
              <li>📅 Set up your class schedule</li>
              <li>🔥 Start building your productivity streak</li>
              <li>📊 Track your progress with analytics</li>
            </ul>
            <p style="text-align: center;">
              <a href="{{DASHBOARD_URL}}" class="button">Go to My Dashboard</a>
            </p>
            <p>We're thrilled to have you! If you ever need anything, don't hesitate to reach out.</p>
            <p><strong>Best,</strong><br>The Daily Grind Crew</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Daily Grind. Enhancing student productivity, one task at a time.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
