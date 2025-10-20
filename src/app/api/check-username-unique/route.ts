import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../models/User";
import { z } from "zod";
import { usernameValidation } from "../../../schemas/signUpSchema";

// Build a tiny schema for the GET query (?username=...)

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    // Extract query param (?username=...)
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("usernmae"),
    };

    // Validate using Zod (safeParse => success/data/error)
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      // Format field errors; show username-specific messages or a generic fallback
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameter",
        },
        { status: 400 }
      );
    }
    // Parsed value is guaranteed by Zod when success === true
    const { username } = result.data;

    // Business rule: Treat a username as taken only if a VERIFIED user holds it
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique/available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking usernmae",
      },
      { status: 500 }
    );
  }
}
