import clientPromise from "./mongodb";

// Database name
export const DB_NAME = "contestnotify";

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  CONTESTS: "contests",
  NOTIFICATIONS: "notifications",
};

/**
 * Initialize database with required collections and indices
 */
export async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Get list of existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Create users collection if it doesn't exist
    if (!collectionNames.includes(COLLECTIONS.USERS)) {
      console.log("Creating users collection...");
      await db.createCollection(COLLECTIONS.USERS);
      
      // Create unique index on email
      await db.collection(COLLECTIONS.USERS).createIndex(
        { email: 1 },
        { unique: true }
      );
      
      console.log("Users collection created with email index");
    }
    
    // Create contests collection if it doesn't exist
    if (!collectionNames.includes(COLLECTIONS.CONTESTS)) {
      console.log("Creating contests collection...");
      await db.createCollection(COLLECTIONS.CONTESTS);
      
      // Create indices for efficient querying
      await db.collection(COLLECTIONS.CONTESTS).createIndex({ startTime: 1 });
      await db.collection(COLLECTIONS.CONTESTS).createIndex({ platform: 1 });
      
      console.log("Contests collection created with indices");
    }
    
    // Create notifications collection if it doesn't exist
    if (!collectionNames.includes(COLLECTIONS.NOTIFICATIONS)) {
      console.log("Creating notifications collection...");
      await db.createCollection(COLLECTIONS.NOTIFICATIONS);
      
      // Create compound index for user + contest
      await db.collection(COLLECTIONS.NOTIFICATIONS).createIndex(
        { userId: 1, contestId: 1 },
        { unique: true }
      );
      
      console.log("Notifications collection created with indices");
    }
    
    console.log("Database initialization complete");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

/**
 * Get database status - returns collection statistics
 */
export async function getDatabaseStatus() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stats = await db.stats();
    
    // Get collection counts
    const userCount = await db.collection(COLLECTIONS.USERS).countDocuments();
    const contestCount = await db.collection(COLLECTIONS.CONTESTS).countDocuments();
    const notificationCount = await db.collection(COLLECTIONS.NOTIFICATIONS).countDocuments();
    
    return {
      status: "connected",
      database: DB_NAME,
      collections: {
        [COLLECTIONS.USERS]: userCount,
        [COLLECTIONS.CONTESTS]: contestCount,
        [COLLECTIONS.NOTIFICATIONS]: notificationCount,
      },
      stats: {
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
      }
    };
  } catch (error) {
    console.error("Failed to get database status:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}