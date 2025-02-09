import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // 1. Retrieve the SIGNING_SECRET.
  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  if (!SIGNING_SECRET) {
    throw new Error(
      "Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // 2. Get and validate svix headers.
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Error occurred -- missing svix headers", {
      status: 400,
    });
  }

  // 3. Parse the incoming payload.
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Verify the payload.
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred during verification", { status: 400 });
  }

  // 5. Handle "user.created" and "user.updated" events.
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const data = payload.data;

    if (data.user?.privateMetadata?.origin === "database_sync") {
      console.log(
        `Skipping processing for ${data.id} because it was updated by database_sync`
      );
      return new Response("", { status: 200 });
    }
    
    // === Upsert the user in our database.
    const user: Partial<User> = {
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email_addresses[0].email_address,
      picture: data.image_url,
    };

    if(!user) return;
    const dbUser = await db.user.upsert({
      where: { email: user.email },
      update: user,
      create: {
        id: user.id!,
        name: user.name!,
        email: user.email!,
        picture: user.picture!,
        role: user.role || "USER",
      },
    });

    // Update user's metadata in Clerk with the role information
  const client = await clerkClient();
  await client.users.updateUserMetadata(data.id, {
    privateMetadata: {
      role: dbUser.role || "USER", // Default role to "USER" if not present in dbUser
      origin: "database_sync",
    },
  });
  }

  // 6. Handle "user.deleted" events.
  if (evt.type === "user.deleted") {
    const userId = payload.data.id;
    await db.user.delete({
      where: { id: userId },
    });
  }
  // 7. Return a 200 response.
  return new Response("", { status: 200 });
}