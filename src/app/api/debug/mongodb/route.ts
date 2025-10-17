import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// This is a diagnostic route that checks MongoDB connection and NextAuth collections
export async function GET() {
  try {
    // Test MongoDB connection
    const client = await clientPromise;
    const db = client.db("contestnotify");
    
    // Check collections for NextAuth
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check for required NextAuth collections
    const requiredCollections = ["users", "accounts", "sessions", "verification_tokens"];
    const missingCollections = requiredCollections.filter(
      name => !collectionNames.includes(name)
    );
    
    // Get count of documents in each collection
    const counts: Record<string, number> = {};
    for (const name of collectionNames) {
      if (requiredCollections.includes(name)) {
        counts[name] = await db.collection(name).countDocuments();
      }
    }
    
    return NextResponse.json({
      success: true,
      mongodbConnected: true,
      database: "contestnotify",
      collections: collectionNames,
      requiredCollections,
      missingCollections,
      documentCounts: counts,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json({
      success: false,
      mongodbConnected: false,
      error: error instanceof Error ? error.message : "Unknown MongoDB connection error",
    }, { status: 500 });
  }
}