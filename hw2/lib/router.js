import path from "path";
import { parse } from "url";
import { fileURLToPath, pathToFileURL } from "url";
import { statusHandler } from "../helpers/statusHandler.js";
import {
  ROUTES_DIR,
  scanRoutes,
  matchRoute,
} from "../helpers/routerHelpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let routes = [];

export async function router(req, res) {
  if (routes.length === 0) {
    routes = await scanRoutes(path.join(__dirname, ROUTES_DIR), __dirname);
  }

  const { pathname } = parse(req.url, true);
  const method = req.method.toUpperCase();

  const match = matchRoute(pathname, routes);

  if (!match) {
    return statusHandler(res, 404, "text/plain", "Not Found");
  }

  const routeMethod = match.handler[method];

  if (!routeMethod) {
    return statusHandler(
      res,
      405,
      "text/plain",
      `Method ${method} Not Allowed`
    );
  }

  return routeMethod(req, res, match.params);
}
