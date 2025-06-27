function parseArgs(argsArray) {
  const result = {
    method: "",
    body: {},
  };

  let key = null;

  if (argsArray.length > 0) {
    result.method = argsArray[0];
    argsArray = argsArray.slice(1);
  }

  argsArray.forEach((arg) => {
    if (arg.startsWith("--")) {
      key = arg.slice(2);
    } else if (key) {
      result.body[key] = arg;
      key = null;
    }
  });

  return result;
}

export { parseArgs };
