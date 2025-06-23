import { IncomingMessage, ServerResponse } from "http";
import { userRoute } from "../routes/users/route";
import { userByIdRoute } from "../routes/users/[id]/route";

const router = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  console.log(`Received request: ${req.method} ${req.url}`);

  if (req.url === "/users") {
    userRoute.emit("users", req, res);
  } else if (req.url && req.url.startsWith("/users")) {
    const userId = req.url.split("/")[2];
    if (!userId || isNaN(Number(userId))) {
      res.statusCode = 400;
      res.end("Invalid user ID");
      return;
    } else {
      userByIdRoute.emit("users/:id", req, res);
    }
  } else if (req.url === "/") {
    res.end("Hello, Home work 2!");
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
};

export { router };
