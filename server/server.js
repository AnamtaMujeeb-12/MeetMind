import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";
import connect_db from "./config/db.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const port = process.env.PORT || 5000;

connect_db()
  .then(() =>
    app.listen(port, () =>
      console.log(`MeetMind API running on http://localhost:${port}`)
    )
  )
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });