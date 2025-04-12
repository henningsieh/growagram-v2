// src/types/user.ts:

export enum UserRoles {
  USER = "user",
  ADMIN = "admin",
  MOD = "moderator", // Example additional role
  // ...other roles...
}

export interface BanInfo {
  bannedUntil: Date | null;
  banReason: string | null;
  isBanned: boolean;
}

export interface UserBanInput {
  userId: string;
  banDuration: string; // Value from BAN_DURATIONS
  banReason: string;
}
