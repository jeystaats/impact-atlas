import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

/**
 * Clerk webhook handler
 * Handles user.created, user.updated, and user.deleted events
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response("Server configuration error", { status: 500 });
    }

    // Get the headers
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    // Get the body
    const payload = await request.text();

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle the event
    const eventType = evt.type;

    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;

        const email = email_addresses?.[0]?.email_address;
        if (!email) {
          console.error("No email found for user:", id);
          return new Response("No email found", { status: 400 });
        }

        const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: id,
          email,
          name,
          imageUrl: image_url,
        });

        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        if (id) {
          await ctx.runMutation(internal.users.deleteByClerkId, {
            clerkId: id,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response("OK", { status: 200 });
  }),
});

// Type definitions for Clerk webhook events
type WebhookEvent =
  | {
      type: "user.created" | "user.updated";
      data: {
        id: string;
        email_addresses?: Array<{ email_address: string }>;
        first_name?: string | null;
        last_name?: string | null;
        image_url?: string;
      };
    }
  | {
      type: "user.deleted";
      data: {
        id?: string;
      };
    }
  | {
      type: string;
      data: Record<string, unknown>;
    };

export default http;
