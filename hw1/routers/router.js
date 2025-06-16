// router/index.js
import {
  addHabit,
  listHabits,
  markDone,
  deleteHabit,
  updateHabit,
  showStats,
} from "../controllers/habitController.js";
import process from "process";
function parseArgs(argsArray) {
  const args = {};
  let key = null;

  for (let i = 0; i < argsArray.length; i++) {
    const arg = argsArray[i];
    if (arg.startsWith("--")) {
      key = arg.slice(2);
      args[key] = true; // за замовчуванням true, якщо значення немає
    } else if (key) {
      args[key] = arg;
      key = null;
    }
  }

  return args;
}

export async function handleCommand() {
  const rawArgs = process.argv.slice(2);
  const command = rawArgs[0];
  const args = parseArgs(rawArgs.slice(1));

  switch (command) {
    case "add":
      if (!args.name || !args.freq) {
        console.log(
          '❌ Використання: add --name "<назва>" --freq <daily|weekly|monthly>'
        );
        return;
      }
      await addHabit(args.name, args.freq);
      break;

    case "list":
      await listHabits();
      break;

    case "done":
      if (!args.id) {
        console.log("❌ Використання: done --id <ідентифікатор>");
        return;
      }
      await markDone(args.id);
      break;

    case "delete":
      if (!args.id) {
        console.log("❌ Використання: delete --id <ідентифікатор>");
        return;
      }
      await deleteHabit(args.id);
      break;

    case "update":
      if (!args.id || (!args.name && !args.freq)) {
        console.log(
          '❌ Використання: update --id <ідентифікатор> --name "<нове ім’я>" --freq <частота>'
        );
        return;
      }
      await updateHabit(args.id, args.name, args.freq);
      break;

    case "stats":
      await showStats();
      break;

    default:
      console.log("ℹ️ Команди: add, list, done, delete, update, stats");
  }
}
