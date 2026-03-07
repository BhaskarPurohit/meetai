import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";
import crypto from "crypto";

function verifyPolarSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

type PolarEvent = {
  type: string;
  data: {
    id: string;
    customer_id: string;
    status: "active" | "canceled" | "past_due" | "trialing";
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    product?: { name?: string };
    metadata?: { userId?: string };
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-polar-signature") ?? "";

    if (!verifyPolarSignature(body, signature, env.POLAR_WEBHOOK_SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body) as PolarEvent;
    const { type, data } = event;

    const userId = data.metadata?.userId;
    if (!userId) return NextResponse.json({ received: true });

    if (
      type === "subscription.created" ||
      type === "subscription.updated" ||
      type === "subscription.activated"
    ) {
      await db
        .insert(subscriptions)
        .values({
          userId,
          polarSubscriptionId: data.id,
          polarCustomerId: data.customer_id,
          status: data.status === "canceled" ? "cancelled" : data.status,
          planName: data.product?.name ?? null,
          currentPeriodEnd: data.current_period_end
            ? new Date(data.current_period_end)
            : null,
          cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
        })
        .onConflictDoUpdate({
          target: subscriptions.polarSubscriptionId,
          set: {
            status: data.status === "canceled" ? "cancelled" : data.status,
            planName: data.product?.name ?? null,
            currentPeriodEnd: data.current_period_end
              ? new Date(data.current_period_end)
              : null,
            cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
            updatedAt: new Date(),
          },
        });
    }

    if (type === "subscription.canceled" || type === "subscription.revoked") {
      await db
        .update(subscriptions)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(subscriptions.polarSubscriptionId, data.id));
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Polar webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}