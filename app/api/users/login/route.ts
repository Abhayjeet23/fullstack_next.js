import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password, otp, captchaToken } = reqBody;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    // Step 1: Send OTP after password check
    if (!otp) {
      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }

      const validPassword = await bcryptjs.compare(password, user.password);
      if (!validPassword) {
        return NextResponse.json({ error: "Invalid password" }, { status: 400 });
      }

      await sendEmail({
        email,
        emailType: "LOGIN_OTP",
        userId: user._id,
      });

      return NextResponse.json({ success: true, message: "OTP sent to email" });
    }

    // Step 2: Verify OTP
    if (otp) {
      if (
        user.loginOtp !== otp ||
        !user.loginOtpExpiry ||
        user.loginOtpExpiry < new Date()
      ) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Clear OTP after verification
      user.loginOtp = null;
      user.loginOtpExpiry = null;
      await user.save();

      const tokenData = {
        id: user._id,
        username: user.username,
        email: user.email,
      };

      const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
        expiresIn: "1d",
      });

      const response = NextResponse.json({
        message: "Login successful",
        success: true,
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
