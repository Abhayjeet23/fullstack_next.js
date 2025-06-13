import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { sendEmail } from "@/helpers/mailer";
import { connect } from "@/dbConfig/dbConfig";

export async function POST(req: Request) {
  try {
    await connect();

    const body = await req.json();
    const { email } = body;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await sendEmail({ email, emailType: "RESET", userId: user._id });

    return NextResponse.json({ message: "Password reset link sent" });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
