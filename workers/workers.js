export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const host = url.hostname;
      const base = "https://lucido77.github.io/lanasekombuis";

      const safeFetch = async (path) => {
        const cacheUrl = base + path;
        const cache = caches.default;

        let res = await cache.match(cacheUrl);
        if (res) return res;

        res = await fetch(cacheUrl, {
          cf: { cacheTtl: 300, cacheEverything: true }
        });

        if (!res || !res.ok) {
          return new Response("Origin error: " + path + " (" + res.status + ")", { status: 502 });
        }

        ctx.waitUntil(cache.put(cacheUrl, res.clone()));
        return res;
      };

      // ── ICONS (all domains) ──
      if (url.pathname === "/apple-touch-icon.png" ||
          url.pathname === "/apple-touch-icon-precomposed.png" ||
          url.pathname.startsWith("/icons/")) {
        const iconPath = url.pathname.startsWith("/icons/")
          ? url.pathname
          : "/icons/apple-touch-icon.png";
        return await safeFetch(iconPath);
      }

      // ── MANIFESTS ──
      if (url.pathname.startsWith("/manifest")) {
        if (host === "staff.lanasekombuis.co.za")
          return await safeFetch("/manifest-staff.json");
        if (host === "staff-manager.lanasekombuis.co.za")
          return await safeFetch("/manifest-manager.json");
        if (host === "staff-admin.lanasekombuis.co.za")
          return await safeFetch("/manifest-admin.json");
        if (host === "ellenrust-admin.lanasekombuis.co.za")
          return await safeFetch("/manifest-ellenrust-admin.json");
        if (host === "ellenrust-residents.lanasekombuis.co.za")
          return await safeFetch("/manifest-ellenrust-residents.json");
      }

      // ── STAFF ──
      if (host === "staff.lanasekombuis.co.za")
        return await safeFetch("/staff/staff.html");

      // ── STAFF MANAGER ──
      if (host === "staff-manager.lanasekombuis.co.za")
        return await safeFetch("/staff/manager.html");

      // ── STAFF ADMIN ──
      if (host === "staff-admin.lanasekombuis.co.za")
        return await safeFetch("/staff/admin.html");

      // ── ELLENRUST ADMIN ──
      if (host === "ellenrust-admin.lanasekombuis.co.za")
        return await safeFetch("/ellenrust/admin.html");

      // ── ELLENRUST RESIDENTS ──
      if (host === "ellenrust-residents.lanasekombuis.co.za")
        return await safeFetch("/ellenrust/residents.html");

      return new Response("No route for: " + host, { status: 404 });

    } catch (err) {
      return new Response("Worker crash: " + err.message, { status: 500 });
    }
  }
};
