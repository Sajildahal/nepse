import { isLogViewAuthorized } from "@/lib/logging/logAuth";
import { getLogs, subscribeLogs, type LogEntry } from "@/lib/logging/liveLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

function sse(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export function GET(request: Request) {
  if (!isLogViewAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let closed = false;
  let unsubscribe: () => void = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let closeStream: () => void = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        unsubscribe();
        if (heartbeat) clearInterval(heartbeat);
        request.signal.removeEventListener("abort", close);
        try {
          controller.close();
        } catch {
          // already closed by the client
        }
      };

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(sse(event, data));
        } catch {
          close();
        }
      };

      closeStream = close;
      request.signal.addEventListener("abort", close, { once: true });

      send("ready", { ok: true, timestamp: new Date().toISOString() });
      for (const entry of getLogs({ limit: 30 })) send("log", entry);

      unsubscribe = subscribeLogs((entry: LogEntry) => send("log", entry));
      heartbeat = setInterval(() => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            close();
          }
        }
      }, 15_000);
    },
    cancel() {
      closeStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
