import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await connect();
    console.log("[DB] MongoDB connected");

    const reqBody = await request.json();
    console.log("[Signup] Request body received:", reqBody);

    const { username, email, password } = reqBody;

    // Validate fields
    if (!username || !email || !password) {
      console.warn("[Signup] Missing required fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.warn("[Signup] User already exists:", existingUser.email || existingUser.username);
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.log("[Signup] New user saved:", savedUser._id);

    // Email sending temporarily disabled
    // await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error("[Signup Error]", error);
    return NextResponse.json({
      error: error?.message || "Internal Server Error",
    }, { status: 500 });
  }
}
