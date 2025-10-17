import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// This is a debugging route that should be disabled or protected in production
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("contestnotify");
    
    // Get collections relevant to NextAuth
    const users = await db.collection("users").find({}).limit(10).toArray();
    const accounts = await db.collection("accounts").find({}).limit(10).toArray();
    const sessions = await db.collection("sessions").find({}).limit(10).toArray();
    
    // Return data with sensitive information redacted
    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        // Omit password and other sensitive fields
      })),
      accounts: accounts.map(account => ({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        userId: account.userId,
        type: account.type,
        createdAt: account.createdAt,
        // Omit tokens and other sensitive fields
      })),
      sessions: sessions.map(session => ({
        userId: session.userId,
        expires: session.expires,
        sessionToken: "***redacted***",
      })),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch authentication data",
    }, { status: 500 });
  }
}