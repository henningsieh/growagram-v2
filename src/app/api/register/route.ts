import { z } from "zod";
import { hashPassword } from "~/lib/auth/password";
import { db } from "~/lib/db";
import { users } from "~/lib/db/schema";
import { UserRoles } from "~/types/user";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());

    const exists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, body.email),
    });

    if (exists) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const [user] = await db
      .insert(users)
      .values({
        email: body.email,
        passwordHash: await hashPassword(body.password),
        username: body.username,
        name: body.name,
        role: UserRoles.USER,
      })
      .returning();

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
