import express from "express";
import path from "path";
import { createServer } from "http";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createHTTPServer() {
  const app = express();
  const httpServer = createServer(app);

  app.use(
    express.static(path.join(__dirname, "..", "..", "..", "client", "dist")),
  );

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "..", "..", "client", "dist", "index.html"),
    );
  });

  const PORT = process.env.PORT || 3000;

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  return httpServer;
}
