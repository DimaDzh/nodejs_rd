const http = require("node:http");
const store = new Map();

function r(json, res) {
  res.end(JSON.stringify(json));
}

http
  .createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    if (req.method === "GET" && u.pathname === "/get") {
      return r({ value: store.get(u.searchParams.get("key")) ?? null }, res);
    }
    if (req.method === "POST" && u.pathname === "/set") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const { key, value } = JSON.parse(body);
        store.set(key, value);
        r({ ok: true }, res);
      });
      return;
    }
    res.statusCode = 404;
    res.end("Not found");
  })
  .listen(4000, () => console.log("redis-like :4000"));
