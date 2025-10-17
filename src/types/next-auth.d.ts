import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    }
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the built-in JWT types
   */
  interface JWT {
    id: string;
    role: string;
  }
}