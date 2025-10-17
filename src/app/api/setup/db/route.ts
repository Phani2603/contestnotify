import { NextResponse } from "next/server";
import { initializeDatabase, getDatabaseStatus } from "@/lib/db";

/**
 * Initialize the database and return its status
 */
export async function GET() {
  try {
    // Initialize the database (create collections and indexes)
    await initializeDatabase();
    
    // Get current database status
    const status = await getDatabaseStatus();
    
    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      status
    }, { status: 200 });
  } catch (error) {
    console.error("Database setup failed:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Database setup failed",
    }, { status: 500 });
  }
}