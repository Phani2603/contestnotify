import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { DB_NAME, COLLECTIONS } from '@/lib/db';
import { fetchContestsViaServerRoute } from '@/lib/api/clist';

/**
 * API endpoint to clean up notification preferences for expired contests
 * POST /api/notifications/cleanup
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Get all user's notification preferences
    const notifications = await notificationsCollection
      .find({ userId })
      .toArray();
    
    // If no notifications, nothing to clean up
    if (!notifications.length) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'No notifications to clean up',
        cleanedCount: 0
      });
    }
    
    // Extract contest IDs from notifications
    const contestIds = notifications.map(n => n.contestId);
    
    // Get current time
    const now = new Date();
    
    // Fetch contest data for these IDs to check which ones are expired
    // For simplicity, we'll consider all contests as expired if they started more than 6 hours ago
    const sixHoursAgo = new Date(now.getTime() - (6 * 60 * 60 * 1000));
    
    // Use our existing API to fetch current contests
    // We'll determine expired contests by checking their start time
    const apiResponse = await fetchContestsViaServerRoute({
      limit: 100,
      includeFinished: true
    });
    
    if (!apiResponse?.objects) {
      throw new Error('Failed to fetch contest data');
    }
    
    // Find expired contest IDs
    const expiredContestIds = [];
    
    // Check each notification to see if the contest has expired
    for (const notification of notifications) {
      const contestId = notification.contestId;
      
      // Find the contest in the API response
      const contest = apiResponse.objects.find(c => c.id.toString() === contestId.toString());
      
      // If contest wasn't found in API response, or started more than 6 hours ago, mark as expired
      if (!contest || new Date(contest.start) < sixHoursAgo) {
        expiredContestIds.push(contestId);
      }
    }
    
    // If no expired contests, nothing to clean up
    if (!expiredContestIds.length) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'No expired notifications found',
        cleanedCount: 0
      });
    }
    
    // Delete notifications for expired contests
    const deleteResult = await notificationsCollection.deleteMany({
      userId,
      contestId: { $in: expiredContestIds }
    });
    
    return NextResponse.json({
      status: 'success',
      message: `Cleaned up ${deleteResult.deletedCount} expired notifications`,
      cleanedCount: deleteResult.deletedCount,
      expiredContestIds
    });
  } catch (error) {
    console.error('Failed to clean up notifications:', error);
    return NextResponse.json(
      { error: 'Failed to clean up notifications', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}