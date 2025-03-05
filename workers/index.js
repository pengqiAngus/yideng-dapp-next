import { handleNextRequest } from "../.open-next/server-functions/index.mjs";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const url = new URL(event.request.url);
  const cacheKey = url.pathname;

  const cached = await MY_KV.get(cacheKey);
    if (cached) {
      console.log('走缓存');
      
    const headers = url.pathname.startsWith("/api/")
      ? { "Content-Type": "application/json" }
      : { "Content-Type": "text/html" };
    return new Response(cached, { headers });
    }
      console.log("没走缓存");

  const response = await handleNextRequest(event.request);
  const body = await response.text();
  event.waitUntil(MY_KV.put(cacheKey, body, { expirationTtl: 3600 }));
  return response;
}
