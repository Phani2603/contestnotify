import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { DB_NAME, COLLECTIONS } from "@/lib/db";

export type User = {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Get a user by their email
 */
export async function getUserByEmail(email: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  const user = await db.collection(COLLECTIONS.USERS).findOne({ email });
  return user as User | null;
}

/**
 * Get a user by their ID
 */
export async function getUserById(id: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) });
  return user as User | null;
}

/**
 * Create a new user
 */
export async function createUser(data: Omit<User, "_id" | "id" | "createdAt" | "updatedAt">) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  // Hash password if provided
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  
  const now = new Date();
  
  const result = await db.collection(COLLECTIONS.USERS).insertOne({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  
  const user = await getUserById(result.insertedId.toString());
  return user;
}

/**
 * Update a user
 */
export async function updateUser(id: string, data: Partial<User>) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  // Hash password if it's being updated
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  
  // Remove fields that shouldn't be updated directly
  delete data._id;
  delete data.id;
  delete data.createdAt;
  
  await db.collection(COLLECTIONS.USERS).updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...data,
        updatedAt: new Date(),
      }
    }
  );
  
  const user = await getUserById(id);
  return user;
}