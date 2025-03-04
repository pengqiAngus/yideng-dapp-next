import { AsyncLocalStorage } from "node:async_hooks";
// @ts-expect-error: resolved by wrangler build
import * as nextEnvVars from "../.open-next/env/next-env.mjs";
// @ts-expect-error: resolved by wrangler build
import { handler as middlewareHandler } from "../.open-next/middleware/handler.mjs";
// @ts-expect-error: resolved by wrangler build
import { handler as serverHandler } from "../.open-next/server-functions/default/handler.mjs";
const cloudflareContextALS = new AsyncLocalStorage();
// Note: this symbol needs to be kept in sync with `src/api/get-cloudflare-context.ts`
Object.defineProperty(globalThis, Symbol.for("__cloudflare-context__"), {
  get() {
    return cloudflareContextALS.getStore();
  },
});
// Populate process.env on the first request
let processEnvPopulated = false;
export default {
  async fetch(request, env, ctx) {
    return cloudflareContextALS.run({ env, ctx, cf: request.cf }, async () => {
      const url = new URL(request.url);
      populateProcessEnv(url, env.NEXTJS_ENV);
      if (url.pathname === "/_next/image") {
        const imageUrl = url.searchParams.get("url") ?? "";
        return imageUrl.startsWith("/")
          ? env.ASSETS.fetch(new URL(imageUrl, request.url))
          : fetch(imageUrl, { cf: { cacheEverything: true } });
      }
      if (url.pathname.includes("worker")) {
        const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>欢迎访问我的页面</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background-color: #f0f0f0;
        }
        h1 {
          color: #333;
        }
        p {
          font-size: 18px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>你好，欢迎体验 Cloudflare Worker!</h1>
      <p>这是一个通过 Worker 返回的自定义页面。</p>
      <p>当前时间: ${new Date().toLocaleString("zh-CN")}</p>
    </body>
    </html>
                `;
      return  new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Cache": "HIT", // 可选：标记为缓存命中
          },
          status: 200,
        });
      }
      // The Middleware handler can return either a `Response` or a `Request`:
      // - `Response`s should be returned early
      // - `Request`s are handled by the Next server
      const reqOrResp = await middlewareHandler(request, env, ctx);
      if (reqOrResp instanceof Response) {
        return reqOrResp;
      }
      return serverHandler(reqOrResp, env, ctx);
    });
  },
};
/**
 * Populate process.env with:
 * - the variables from Next .env* files
 * - the origin resolver information
 *
 * Note that cloudflare env string values are copied by the middleware handler.
 */
function populateProcessEnv(url, nextJsEnv) {
  if (processEnvPopulated) {
    return;
  }
  processEnvPopulated = true;
  const mode = nextJsEnv ?? "production";
  if (nextEnvVars[mode]) {
    for (const key in nextEnvVars[mode]) {
      process.env[key] = nextEnvVars[mode][key];
    }
  }
  // Set the default Origin for the origin resolver.
  process.env.OPEN_NEXT_ORIGIN = JSON.stringify({
    default: {
      host: url.hostname,
      protocol: url.protocol.slice(0, -1),
      port: url.port,
    },
  });
}
