import nodemailer from "nodemailer";

export async function sendOTP(email: string, otp: string) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.error("[Email Service] EMAIL_USER or EMAIL_PASS is not defined in environment variables.");
        throw new Error("Email configuration missing");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });

    console.log(`[Email Service] Attempting to send OTP to ${email}...`);

    try {
        await transporter.sendMail({
            from: `"LIAMS" <${user}>`,
            to: email,
            subject: "Your OTP Verification Code",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });
        console.log(`[Email Service] OTP successfully sent to ${email}`);
    } catch (error) {
        console.error(`[Email Service] Error sending email to ${email}:`, error);
        throw error;
    }
}

export async function sendBookingNotification(email: string, details: {
    studentName: string;
    componentName: string;
    labName: string;
    startTime: string;
    endTime: string;
    unitNumber?: number;
}) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) return; // Fail silently or log if no config

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });

    try {
        await transporter.sendMail({
            from: `"LIAMS" <${user}>`,
            to: email,
            subject: `New Booking Request: ${details.componentName}`,
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
                
                <h2 style="color: #2c3e50; margin-bottom: 10px;">
                    📌 New Booking Request
                </h2>
                
                <p style="color: #555;">You have received a new equipment booking request. Here are the details:</p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Student:</td>
                        <td>${details.studentName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Equipment:</td>
                        <td>
                            ${details.componentName} 
                            ${details.unitNumber ? `(Unit #${details.unitNumber})` : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Laboratory:</td>
                        <td>${details.labName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                        <td>${details.startTime} → ${details.endTime}</td>
                    </tr>
                </table>

                <div style="margin-top: 20px; text-align: center;">
                    <a href="#" 
                       style="background-color: #007bff; color: white; padding: 10px 18px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Review Request
                    </a>
                </div>

                <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
                    Please log in to the LIAMS Portal to approve or reject this request.
                </p>

            </div>
        </div>
    `,
        });
    } catch (error) {
        console.error(`[Email Service] Error sending notification to ${email}:`, error);
    }
}

export async function sendWelcomeEmail(email: string, details: {
    name: string;
    password: string;
    roles: string[];
}) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn("[Email Service] EMAIL_USER or EMAIL_PASS not defined. Skipping welcome email.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });

    try {
        await transporter.sendMail({
            from: `"LIAMS" <${user}>`,
            to: email,
            subject: "Welcome to LIAMS",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #1e293b; padding: 24px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">LIAMS</h2>
                        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">IITD–MSE Department</p>
                    </div>
                    <div style="padding: 32px; background-color: #ffffff;">
                        <h3 style="margin-top: 0; color: #1e293b;">Welcome, ${details.name}!</h3>
                        <p>Your account has been successfully created on the LIAMS Portal.</p>
                        
                        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase;">Your Login Credentials</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${details.password}</code></p>
                            <p style="margin: 5px 0;"><strong>Role(s):</strong> ${details.roles.join(", ")}</p>
                        </div>

                        <p>You can now log in to the portal to manage lab resources, view bookings, and handle infrastructure requests.</p>
                        
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log in to Portal</a>
                        </div>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                        <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
                        <p style="margin: 4px 0 0 0;">IITD–MSE Department</p>
                    </div>
                </div>
            `,
        });
        console.log(`[Email Service] Welcome email sent to ${email}`);
    } catch (error) {
        console.error(`[Email Service] Error sending welcome email to ${email}:`, error);
    }
}