/* ============================================================
 * 雞尾酒譜 PWA Service Worker
 * 策略重點：
 *   1) 只快取「本站靜態檔案」（index.html、manifest、圖示、字型）。
 *   2) 絕不快取 GAS API（script.google.com）的任何請求 —— 那些帶登入
 *      token 且需即時資料，一旦快取會回傳過期或他人資料，非常危險。
 *   3) 只處理 GET；POST（登入／新增／刪除）一律直接放行到網路。
 *   4) 導覽請求採 network-first，離線時回退到快取的 index.html。
 *
 * ★ 改版時請把 CACHE_VERSION 加一，使用者下次開啟就會自動更新快取。
 * ============================================================ */

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `cocktail-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `cocktail-runtime-${CACHE_VERSION}`;

// 應用外殼：安裝時預先快取，確保離線可開啟
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png'
];

// 允許執行階段快取的跨網域靜態資源（Google 字型）
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// ---------- 安裝：預快取外殼 ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] 預快取失敗（不影響線上使用）：', err))
  );
});

// ---------- 啟用：清除舊版快取 ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ---------- 攔截請求 ----------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只處理 GET；POST/PUT/DELETE（含 GAS 寫入、登入）直接放行
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); }
  catch (e) { return; }

  // 跨網域請求
  if (url.origin !== self.location.origin) {
    // 字型：cache-first（靜態、可安全快取，改善離線外觀）
    if (FONT_HOSTS.includes(url.hostname)) {
      event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    }
    // 其餘跨網域（尤其是 GAS API script.google.com）→ 不介入，走原生網路
    return;
  }

  // 同網域導覽請求（開啟頁面）→ network-first，離線回退 index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          // 更新外殼快取中的 index.html
          const copy = resp.clone();
          caches.open(SHELL_CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // 同網域其他靜態資源（圖示、manifest 等）→ cache-first
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

// ---------- 工具：cache-first ----------
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const resp = await fetch(request);
    // 僅快取成功或不透明（跨網域字型）回應
    if (resp && (resp.ok || resp.type === 'opaque')) {
      const cache = await caches.open(cacheName);
      cache.put(request, resp.clone()).catch(() => {});
    }
    return resp;
  } catch (err) {
    // 離線且無快取：回傳一個簡單錯誤回應，避免整頁崩潰
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}
