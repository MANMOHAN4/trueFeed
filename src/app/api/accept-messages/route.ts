import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../models/User";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const { acceptMessages } = await request.json();

  try {
    // Update the user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { isAcceptingMessages: acceptMessages },
      {
        new: true, // Returns updated user
      }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Unable to find user to update message acceptance status",
        },
        { status: 404 }
      );
    }

    // Successfully updated message acceptance status
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error updating message acceptance status" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return the user's message acceptance status
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error retrieving message acceptance status" },
      { status: 500 }
    );
  }
}
