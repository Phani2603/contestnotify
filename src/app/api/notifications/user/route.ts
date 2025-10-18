import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { DB_NAME, COLLECTIONS } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * API route to get all notification preferences for the current user
 * GET /api/notifications/user
 */
export async function GET() {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id || session.user.email;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const notificationsCollection = db.collection(COLLECTIONS.NOTIFICATIONS);

    // Get all notifications for this user
    const notifications = await notificationsCollection
      .find({ userId, enabled: true })
      .toArray();

    // Extract just the contestIds for simplicity
    const enabledContestIds = notifications.map(n => n.contestId);

    return NextResponse.json({
      success: true,
      userId,
      enabledContestIds,
      count: enabledContestIds.length
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}