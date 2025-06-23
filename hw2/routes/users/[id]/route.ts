import {
  deleteUserById,
  getUserById,
  updateUserById,
} from "../../../services/users.service";
import { EventEmitter } from "stream";

export const userByIdRoute = new EventEmitter();

userByIdRoute.on("users/:id", (req, res) => {
  if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }
  const userId = Number(req.url.split("/")[2]);

  if (req.method === "GET") {
    try {
      const users = getUserById(userId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end((error as Error).message);
    }
  }
  if (req.method === "PUT") {
    try {
      let body = "";
      req.on("data", (chunk: any) => {
        body += chunk.toString();

        const resp = updateUserById(userId, JSON.parse(body));
        if (resp) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(resp));
        }

        throw resp.error;
      });
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(error as Error);
    }
  }
  if (req.method === "DELETE") {
    try {
      const users = deleteUserById(userId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end((error as Error).message);
    }
  }
});
