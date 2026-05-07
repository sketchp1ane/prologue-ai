export const DEV_CLERK_TICKET_DEFAULT_NEXT_PATH = "/dashboard";

export function isDevClerkTicketRouteEnabled(
  nodeEnv = process.env.NODE_ENV
) {
  return nodeEnv !== "production";
}

export function sanitizeDevClerkTicketNextPath(
  value: string | string[] | null | undefined
) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return DEV_CLERK_TICKET_DEFAULT_NEXT_PATH;
  }

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.startsWith("/\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return DEV_CLERK_TICKET_DEFAULT_NEXT_PATH;
  }

  return candidate;
}
