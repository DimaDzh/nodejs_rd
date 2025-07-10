import "reflect-metadata";
import { Factory } from "./core/http";
import { CoursesModule } from "./apps/courses/books.module";

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const app = Factory([CoursesModule]);

const port = 8081;

app.listen(port, () =>
  console.log(`Nest-Like listening on http://localhost:${port}`)
);
