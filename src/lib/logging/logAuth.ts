// Shared authorization check for the live log endpoints.

export function isLogViewAuthorized(request: Request): boolean {
  const configured = process.env.LOG_VIEW_TOKEN;
  if (!configured) return true;

  const url = new URL(request.url);
  const provided = request.headers.get("x-log-token") ?? url.searchParams.get("token") ?? "";
  return provided === configured;
}
