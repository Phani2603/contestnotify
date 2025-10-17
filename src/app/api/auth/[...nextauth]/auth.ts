import { getServerSession } from "next-auth/next";
import { authOptions } from "./route";

// Export auth for server components
export async function auth() {
  return await getServerSession(authOptions);
}