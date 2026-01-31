import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.AUTH, "api:auth");
  if (rateLimitResponse) return rateLimitResponse;

  return handlers.POST(request);
}
