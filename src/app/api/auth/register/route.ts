import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    // Create new user
    const user = await createUser({
      name,
      email,
      password,
      role: "user", // Default role
    });

    if (!user) {
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password: _unused, ...userWithoutPassword } = user;
    // _unused is intentionally not used, just to exclude password from response

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}