import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,

  // For email verification
  verifyOtp: String,
  verifyOtpExpiry: Date,

  // For login OTP
  loginOtp: String,
  loginOtpExpiry: Date,
});

// Avoid model overwrite errors in dev
const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;
