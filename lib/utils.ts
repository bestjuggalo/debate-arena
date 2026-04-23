import { createHash } from "crypto";

const IP_HASH_SALT = process.env.IP_HASH_SALT ?? "dev-salt-change-in-production";

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip + IP_HASH_SALT).digest("hex");
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}
