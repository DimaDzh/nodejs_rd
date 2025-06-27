import { parseArgs } from "./lib/helpers.js";
import { handleRoute } from "./controllers/habbit.controller.js";
import process from "process";
export async function router() {
  const arg = process.argv.slice(2);

  const parsedArgs = parseArgs(arg);

  if (!parsedArgs) {
    console.error("Invalid arguments");
    return;
  }

  await handleRoute(parsedArgs);
}
