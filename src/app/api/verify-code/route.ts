import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../models/User";
import { verifySchema } from "../../../schemas/verifySchema";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    // Optionally decode username if it came from URL encoding
    const preprocessed = {
      ...body,
      username: decodeURIComponent(body.username ?? ""),
    };

    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      // Collect username and code errors separately
      let usernameError: string[] = [];
      let codeError: string[] = [];

      for (const iss of parsed.error.issues) {
        const path = iss.path.join(".");
        if (path === "username") {
          usernameError.push(iss.message);
        } else if (path === "code") {
          codeError.push(iss.message);
        }
      }

      const all = [...usernameError, ...codeError];
      return Response.json(
        {
          success: false,
          message: all.length ? all.join(", ") : "Invalid input",
          usernameError,
          codeError,
        },
        { status: 400 }
      );
    }

    // Use transformed values from Zod
    const { username, code } = parsed.data;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date(user.verifyCodeExpiry) < new Date();

    if (isCodeValid && !isCodeExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (isCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired. Please sign up again",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying user",
      },
      { status: 500 }
    );
  }
}
