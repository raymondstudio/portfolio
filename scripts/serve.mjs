import express from "express";
import { fileURLToPath } from "node:url";
const app = express();
const root = fileURLToPath(new URL("../", import.meta.url));
app.use(express.static(root));
const port = Number(process.env.PORT || 4173);
app.listen(port, "127.0.0.1", () =>
  console.log(`Portfolio preview: http://127.0.0.1:${port}`),
);
