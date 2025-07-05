import http from "http";
import { router } from "./lib/router.js";

const server = http.createServer((req, res) => {
  router(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
