import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../../../helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // Check if username already exists and is verified
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username: username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Userame already taken",
        },
        {
          status: 400,
        }
      );
    }

    /* NOTE: We only care if a VERIFIED user has this username. Unverified users can be overwritten. (i.e If the username is same as the username of a registered user who is not verified. Then, the username is given to the one who verifys the email.) */

    // Check if email already exists
    const existingUserByEmail = await UserModel.findOne({ email: email });
    // Generate 6-digit verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // If email already exists, then two case must be handled:
    if (existingUserByEmail) {
      // Case 1: Email exists and is verified → Reject (user already registered)
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          {
            status: 400,
          }
        );
      }
      // Case 2: Email exists but not verified → Update their password and send new code to verify
      else {
        // Update existing unverified user
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        // TODO: existingUserByEmail.username = username;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      username,
      email,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
