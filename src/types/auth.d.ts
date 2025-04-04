import { DefaultSession } from "next-auth";
import { UserRoles } from "~/types/user";

// Extend the default types to include our custom properties
declare module "next-auth" {
  interface User {
    username?: string | null;
    role: UserRoles;
  }

  interface Session {
    user: {
      id: string;
      username?: string | null;
      role: UserRoles;
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
    username?: string | null;
    role: UserRoles;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    // Add your additional properties here:
    username: string | null;
    role: UserRoles;
  }
}
