import { getUsers, postUsers } from "../../services/users.service.js";
import { statusHandler } from "../../helpers/statusHandler.js";

export function GET(req, res) {
  const users = getUsers();
  statusHandler(res, 200, "application/json", users);
}

export function POST(req, res) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const data = JSON.parse(body || "{}");
    const user = postUsers(data);
    statusHandler(res, 201, "application/json", user);
  });
}
