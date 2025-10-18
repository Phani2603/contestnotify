import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { DB_NAME, COLLECTIONS } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * API route to toggle notification preferences for a specific contest
 * POST /api/notifications/toggle
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const { contestId, enabled } = await req.json();
    
    if (!contestId) {
      return NextResponse.json(
        { error: "Contest ID is required" },
        { status: 400 }
      );
    }
    
    // Default to true if not explicitly provided
    const isEnabled = enabled !== false;
    
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

    // Check if notification preference exists
    const existingNotification = await notificationsCollection.findOne({
      userId,
      contestId,
    });

    if (existingNotification) {
      // Update existing preference
      if (isEnabled === false) {
        // If disabling, remove the notification record
        await notificationsCollection.deleteOne({
          userId,
          contestId,
        });
        
        return NextResponse.json({
          success: true,
          message: "Notification disabled",
          enabled: false,
        });
      } else {
        // Update the notification preference
        await notificationsCollection.updateOne(
          { userId, contestId },
          { $set: { enabled: true, updatedAt: new Date() } }
        );
      }
    } else if (isEnabled !== false) {
      // Create new notification preference
      await notificationsCollection.insertOne({
        userId,
        contestId,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: isEnabled ? "Notification enabled" : "No change required",
      enabled: !!isEnabled,
    });
  } catch (error) {
    console.error("Error toggling notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification preference" },
      { status: 500 }
    );
  }
}