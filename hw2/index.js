const http = require("http");
const url = require("url");

let questions = [
  { id: 1, question: "What is your name?" },
  { id: 2, question: "What is your quest?" },
  { id: 3, question: "What is your favorite color?" },
];

// Хелпер для парсингу body JSON
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const idMatch = pathname.match(/^\/questions\/(\d+)$/);
  const method = req.method;

  res.setHeader("Content-Type", "application/json");

  // GET /questions
  if (method === "GET" && pathname === "/questions") {
    res.writeHead(200);
    return res.end(JSON.stringify(questions));
  }

  // GET /questions/:id
  if (method === "GET" && idMatch) {
    const id = parseInt(idMatch[1]);
    const question = questions.find((q) => q.id === id);
    if (!question) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: "Question not found" }));
    }
    res.writeHead(200);
    return res.end(JSON.stringify(question));
  }

  // POST /questions
  if (method === "POST" && pathname === "/questions") {
    try {
      const body = await parseBody(req);
      const newQuestion = {
        id: questions.length ? questions[questions.length - 1].id + 1 : 1,
        question: body.question || "Untitled",
      };
      questions.push(newQuestion);
      res.writeHead(201);
      return res.end(JSON.stringify(newQuestion));
    } catch (err) {
      res.writeHead(400);
      return res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  }

  // PUT /questions/:id
  if (method === "PUT" && idMatch) {
    try {
      const id = parseInt(idMatch[1]);
      const index = questions.findIndex((q) => q.id === id);
      if (index === -1) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: "Question not found" }));
      }

      const body = await parseBody(req);
      questions[index].question = body.question || questions[index].question;

      res.writeHead(200);
      return res.end(JSON.stringify(questions[index]));
    } catch (err) {
      res.writeHead(400);
      return res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  }

  // DELETE /questions/:id
  if (method === "DELETE" && idMatch) {
    const id = parseInt(idMatch[1]);
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) {
      res.writeHead(404);
      return res.end(JSON.stringify({ message: "Question not found" }));
    }

    const deleted = questions.splice(index, 1);
    res.writeHead(200);
    return res.end(JSON.stringify(deleted[0]));
  }

  // 404 Not Found
  res.writeHead(404);
  res.end(JSON.stringify({ message: "Route not found" }));
});

// Запуск сервера
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
