// index.js (ES Module 格式)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (isStaticPage(pathname)) {
      return handleStaticPageRequest(request, pathname, env);
    } else {
      return handleSsrPageRequest(request, pathname, env);
    }
  },
};

/**
 * 处理静态页面请求，使用 KV 缓存 HTML
 * @param {Request} request - 请求对象
 * @param {string} pathname - 请求路径
 * @param {object} env - 环境变量（包含 KV 绑定和 NEXTJS_ORIGIN）
 * @returns {Promise<Response>} - 响应
 */
async function handleStaticPageRequest(request, pathname, env) {
  const cacheKey = `static:${pathname}`;
  const MY_KV = env.MY_KV;
  const nextJsOrigin = env.NEXTJS_ORIGIN; // 从环境变量获取 Next.js 部署地址

  // 检查 KV 缓存
  const cached = await MY_KV.get(cacheKey, { type: "text" });
    if (cached) {
      console.log('缓存过了');
    return new Response(cached, {
      headers: {
        "Content-Type": "text/html",
        "X-Cache": "HIT",
      },
    });
    } else {
        console.log("没有缓存过了，现在缓存");
  }

  // 未命中缓存，代理到 Next.js 后端
  const response = await fetch(`${nextJsOrigin}${pathname}`, {
    headers: request.headers, // 传递原始请求头
  });
  if (!response.ok) {
    return new Response("<h1>Page Not Found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const html = await response.text();

  // 存入 KV，缓存 1 天
  await MY_KV.put(cacheKey, html, { expirationTtl: 86400 });

  return new Response(html, {
    status: response.status,
    headers: {
      "Content-Type": "text/html",
      "X-Cache": "MISS",
    },
  });
}

/**
 * 处理 SSR 页面请求，使用 KV 缓存 HTML
 * @param {Request} request - 请求对象
 * @param {string} pathname - 请求路径
 * @param {object} env - 环境变量（包含 KV 绑定和 NEXTJS_ORIGIN）
 * @returns {Promise<Response>} - 响应
 */
async function handleSsrPageRequest(request, pathname, env) {
  const cacheKey = `ssr:${pathname}`;
  const MY_KV = env.MY_KV;
  const nextJsOrigin = env.NEXTJS_ORIGIN;

  // 检查 KV 缓存
  const cached = await MY_KV.get(cacheKey, { type: "text" });
    if (cached) {
      console.log("缓存过了");
      return new Response(cached, {
        headers: {
          "Content-Type": "text/html",
          "X-Cache": "HIT",
        },
      });
    } else {
      console.log("没有缓存过了，现在缓存");
    }

  // 未命中缓存，代理到 Next.js 后端
  const response = await fetch(`${nextJsOrigin}${pathname}`, {
    headers: request.headers, // 传递原始请求头
  });
  if (!response.ok) {
    return new Response("<h1>Page Not Found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const html = await response.text();

  // 存入 KV，缓存 1 分钟
  await MY_KV.put(cacheKey, html, { expirationTtl: 60 });

  return new Response(html, {
    status: response.status,
    headers: {
      "Content-Type": "text/html",
      "X-Cache": "MISS",
    },
  });
}

/**
 * 判断是否为静态页面（自定义逻辑）
 * @param {string} pathname - 请求路径
 * @returns {boolean} - 是否为静态页面
 */
function isStaticPage(pathname) {
  const staticPages = ["/about", "/contact"];
  return staticPages.includes(pathname);
}
