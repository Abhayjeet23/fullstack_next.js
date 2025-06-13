import nodemailer from "nodemailer";
import User from "@/models/userModel";
import crypto from "crypto";

export const sendEmail = async ({
  email,
  emailType,
  userId,
}: {
  email: string;
  emailType: "VERIFY" | "LOGIN_OTP" | "RESET";
  userId: string;
}) => {
  try {
    let subject = "";
    let html = "";
    let update: any = {};

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[sendEmail] Generated OTP: ${otp}`);

    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "ae4db406cf59e7",
        pass: "6d7203ee528491",
      },
    });

    if (emailType === "LOGIN_OTP") {
      subject = "Your OTP Code for Login";
      html = `<p>Your OTP for login is <b>${otp}</b>. It is valid for 5 minutes.</p>`;
      update = {
        loginOtp: otp,
        loginOtpExpiry: new Date(Date.now() + 5 * 60 * 1000),
      };
    } else if (emailType === "VERIFY") {
      subject = "Email Verification Code";
      html = `<p>Your email verification code is <b>${otp}</b>. It is valid for 5 minutes.</p>`;
      update = {
        verifyOtp: otp,
        verifyOtpExpiry: new Date(Date.now() + 5 * 60 * 1000),
      };
    } else if (emailType === "RESET") {
      // generate a secure random token for password reset
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}&id=${userId}`;

      subject = "Reset Your Password";
      html = `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password. This link is valid for 5 minutes.</p>
        <a href="${resetLink}">${resetLink}</a>
      `;

      update = {
        forgotPasswordToken: resetToken,
        forgotPasswordTokenExpiry: resetTokenExpiry,
      };
    } else {
      throw new Error(`[sendEmail] Unsupported email type: ${emailType}`);
    }

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });

    if (!updatedUser) {
      console.log(`[sendEmail] Failed to update user with ID: ${userId}`);
      throw new Error("User update failed");
    }

    console.log(`[sendEmail] User updated:`, update);

    const mailOptions = {
      from: "abhay@gmail.com",
      to: email,
      subject,
      html,
    };

    const mailResponse = await transport.sendMail(mailOptions);
    console.log(`[sendEmail] Email sent to ${email} - Message ID: ${mailResponse.messageId}`);

    return mailResponse;
  } catch (error: any) {
    console.error("[sendEmail] Error:", error.message || error);
    throw new Error(error.message || "Email sending failed");
  }
};
