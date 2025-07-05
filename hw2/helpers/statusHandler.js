export function statusHandler(res, statusCode, contentType, messageOrData) {
  res.writeHead(statusCode, { "Content-Type": contentType });

  if (typeof messageOrData === "string") {
    res.end(messageOrData);
  } else {
    res.end(JSON.stringify(messageOrData));
  }
}
