import { readdir } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const ROUTES_DIR = path.join("..", "routes");
const ROUTE_FILE_NAME = "route.js";

export function isRouteFile(filename) {
  return filename === ROUTE_FILE_NAME;
}

export function buildRoutePath(filePath, baseDir) {
  const relative = path.relative(path.join(baseDir, "routes"), filePath);
  const parts = relative
    .split(path.sep)
    .filter((p) => p !== ".." && p !== "routes") // Filter out '..' and 'routes' segments
    .map(
      (p) => (p.startsWith("[") && p.endsWith("]") ? `:${p.slice(1, -1)}` : p) // Handle dynamic parameters
    );
  return (
    "/" +
    parts
      .join("/")
      .replace(/\/route\.js$/, "")
      .replace(/\\/g, "/")
  );
}

export async function scanRoutes(dir, baseDir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      routes.push(...(await scanRoutes(fullPath, baseDir)));
    } else if (isRouteFile(entry.name)) {
      const routePath = buildRoutePath(fullPath, baseDir);
      const mod = await import(pathToFileURL(fullPath));
      routes.push({ path: routePath, handler: mod });
    }
  }

  return routes;
}

export function matchRoute(url, routes) {
  const urlParts = url.split("/").filter(Boolean);

  for (const { path: routePath, handler } of routes) {
    const routeParts = routePath.split("/").filter(Boolean);

    if (routeParts.length !== urlParts.length) continue;

    let params = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
      const rp = routeParts[i];
      const up = urlParts[i];

      if (rp.startsWith(":")) {
        const paramName = rp.slice(1);
        params[paramName] = up;
      } else if (rp !== up) {
        matched = false;
        break;
      }
    }

    if (matched) return { handler, params };
  }

  return null;
}

export { ROUTES_DIR, ROUTE_FILE_NAME };
