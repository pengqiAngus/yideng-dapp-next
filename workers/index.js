addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

/**
 * 处理所有请求，根据路径和类型进行缓存
 * @param {Request} request - 传入的请求对象
 * @returns {Promise<Response>} - 返回响应
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 根据路径决定缓存策略
  if (pathname.startsWith("/api/")) {
    return handleApiRequest(request, pathname);
  } else if (isStaticPage(pathname)) {
    return handleStaticPageRequest(request, pathname);
  } else {
    return handleSsrPageRequest(request, pathname);
  }
}

/**
 * 处理 API 路由请求，使用 KV 缓存 JSON 数据
 * @param {Request} request - 请求对象
 * @param {string} pathname - 请求路径
 * @returns {Promise<Response>} - 响应
 */
async function handleApiRequest(request, pathname) {
  const cacheKey = `api:${pathname}`;

  // 检查 KV 缓存
  const cached = await MY_KV.get(cacheKey, { type: "json" });
  if (cached) {
    console.log("KV 缓存过了");
    return new Response(JSON.stringify(cached), {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
  } else {
    console.log("KV 没有缓存过了,开始缓存");
  }

  // 未命中缓存，请求 Next.js API
  const response = await fetch(request);
  if (!response.ok) {
    return response; // 如果响应失败，直接返回
  }

  const data = await response.json();

  // 存入 KV，缓存 5 分钟
  await MY_KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 300 });

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS",
    },
  });
}

/**
 * 处理静态页面请求，使用 KV 缓存 HTML
 * @param {Request} request - 请求对象
 * @param {string} pathname - 请求路径
 * @returns {Promise<Response>} - 响应
 */
async function handleStaticPageRequest(request, pathname) {
  const cacheKey = `static:${pathname}`;

  // 检查 KV 缓存
  const cached = await MY_KV.get(cacheKey, { type: "text" });
  if (cached) {
    console.log("KV 缓存过了");
    return new Response(cached, {
      headers: {
        "Content-Type": "text/html",
        "X-Cache": "HIT",
      },
    });
  } else {
    console.log("KV 没有缓存过了,开始缓存");
  }

  // 未命中缓存，请求 Next.js 后端
  const response = await fetch(request);
  if (!response.ok) {
    return response; // 如果响应失败，直接返回
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
 * @returns {Promise<Response>} - 响应
 */
async function handleSsrPageRequest(request, pathname) {
  const cacheKey = `ssr:${pathname}`;

  // 检查 KV 缓存
  const cached = await MY_KV.get(cacheKey, { type: "text" });
  if (cached) {
    console.log("KV 缓存过了");
    return new Response(cached, {
      headers: {
        "Content-Type": "text/html",
        "X-Cache": "HIT",
      },
    });
  } else {
    console.log("KV 没有缓存过了,开始缓存");
  }

  // 未命中缓存，请求 Next.js 后端
  const response = await fetch(request);
  if (!response.ok) {
    return response; // 如果响应失败，直接返回
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
  const staticPages = ["/home"];
  return staticPages.includes(pathname);
}
