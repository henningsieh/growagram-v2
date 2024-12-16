import { DefaultSession } from "next-auth";

// Extend the default types to include our custom properties
declare module "next-auth" {
  interface User {
    username?: string | null;
    role?: "user" | "admin";
  }

  interface Session {
    user: {
      id: string;
      username?: string | null;
      role?: "user" | "admin";
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
    username?: string | null;
    role?: "user" | "admin";
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    // Add your additional properties here:
    username: string | null;
    role: "user" | "admin";
  }
}
