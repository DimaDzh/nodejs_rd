import {
  list,
  add,
  deleteUser,
  updateProgressById,
  updateById,
  stats,
} from "../services/habbit.services.js";

export async function handleRoute(req) {
  try {
    if (req.method === "list") {
      const resp = await list();
      console.log("Habbit List:", resp);
    }
    if (req.method === "add") {
      const resp = await add(req.body);
      console.log(resp);
    }
    if (req.method === "delete" && req.body && req.body.id) {
      const resp = await deleteUser(req.body.id);
      if (resp) {
        console.log("Habbit deleted successfully");
      } else {
        console.log("Habbit not found");
      }
    }
    if (req.method === "done" && req.body && req.body.id) {
      return await updateProgressById(req.body.id, req.body);
    }
    if (req.method === "update" && req.body && req.body.id) {
      return await updateById(req.body.id, req.body);
    }
    if (req.method === "stats") {
      return await stats();
    }
  } catch (e) {
    console.error(e);
  }
}
