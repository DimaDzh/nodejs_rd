import { getUsers, postUsers } from "../../services/users.service";
import { EventEmitter } from "events";

export const userRoute = new EventEmitter();

userRoute.on("users", (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  if (req.method === "GET") {
    const users = getUsers();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk: any) => {
      try {
        body += chunk.toString();
        postUsers(JSON.parse(body));
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Users created", statusCode: 201 }));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON", statusCode: 400 }));
      }
    });
  }
});
