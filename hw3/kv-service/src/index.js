const http = require("node:http");

const { REDIS_URL } = process.env;

http
  .createServer(async (req, res) => {
    if (req.method === "POST" && req.url.startsWith("/kv/")) {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        console.log({ body });
        const { key, value } = JSON.parse(body);
        const r = await fetch(`${REDIS_URL}/set`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
        if (!r.ok) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: "Failed to set value" }));
        }
        res.end(JSON.stringify({ ok: false }));
      });
      return;
    }

    if (req.method === "GET" && req.url.startsWith("/kv/")) {
      console.log(req);
      const k = req.url.split("/").pop();
      const v = await fetch(`${REDIS_URL}/get?key=${k}`).then((r) => r.json());

      return res.end(JSON.stringify(v));
    }
    res.statusCode = 404;
    res.end("nf");
  })
  .listen(3000, () => console.log("api :3000"));
