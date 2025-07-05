import {
  deleteUserByParam,
  getUserByParam,
  updateUserByParam,
} from "../../../services/users.service.js";
import { statusHandler } from "../../../helpers/statusHandler.js";

export function GET(req, res, params) {
  const user = getUserByParam(params.user);
  if (!user) {
    return statusHandler(res, 404, "text/plain", "User not found");
  }
  statusHandler(res, 200, "application/json", user);
}

export function PUT(req, res, params) {
  conm;
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const data = JSON.parse(body || "{}");
    const updatedUser = updateUserByParam(params.user, data);
    if (updatedUser.error) {
      return statusHandler(res, 400, "text/plain", updatedUser.error);
    }
    statusHandler(res, 200, "application/json", updatedUser);
  });
}
export function DELETE(req, res, params) {
  const result = deleteUserByParam(params.user);
  if (result.error) {
    return statusHandler(res, 404, "text/plain", result.error);
  }
  statusHandler(res, 200, "application/json", { message: result.message });
}
