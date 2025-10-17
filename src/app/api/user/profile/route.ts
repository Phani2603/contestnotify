import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const user = await getUserById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Don't send the password hash
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const data = await req.json();
    
    // Validate data
    const { name, username, phoneNumber, image, bio } = data;
    const updateData: {
      name?: string;
      username?: string;
      phoneNumber?: string;
      image?: string;
      bio?: string;
    } = {};
    
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (image !== undefined) updateData.image = image;
    if (bio !== undefined) updateData.bio = bio;
    
    // Update the user in the database
    const updatedUser = await updateUser(session.user.id, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User update failed" },
        { status: 400 }
      );
    }
    
    // Remove sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = updatedUser;
    
    // Return the updated user data
    return NextResponse.json({
      message: "Profile updated successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}