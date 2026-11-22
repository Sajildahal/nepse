// Server-only Redis cache helper. Uses ioredis loaded lazily so it stays out
// of the edge/client bundle.

let client: any = null;
let attempted = false;

export async function getRedis(): Promise<any | null> {
  if (client) return client;
  if (attempted) return null;
  attempted = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    const IORedis = eval("require('ioredis')").default ?? eval("require('ioredis')");
    const instance = new IORedis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    instance.on("error", (err: Error) => {
      console.warn("[redis] error:", err.message);
    });
    await instance.connect();
    client = instance;
    return client;
  } catch (err) {
    console.warn("[redis] unavailable, falling back to in-memory:", (err as Error).message);
    client = null;
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  const r = await getRedis();
  if (!r) return null;
  try {
    return await r.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const r = await getRedis();
  if (!r) return;
  try {
    await r.set(key, value, "EX", ttlSeconds);
  } catch {
    // ignore
  }
}