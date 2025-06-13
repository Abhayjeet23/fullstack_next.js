import { NextResponse } from "next/server";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";

export async function POST(req: Request) {
  await connect();

  try {
    const { token, id, newPassword } = await req.json();

    if (!token || !id || !newPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findById(id);

    if (
      !user ||
      user.forgotPasswordToken !== token ||
      !user.forgotPasswordTokenExpiry ||
      user.forgotPasswordTokenExpiry < Date.now()
    ) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({ message: "Password has been reset successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
