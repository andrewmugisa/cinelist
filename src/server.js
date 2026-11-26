require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");

async function start() {
  if (!process.env.SESSION_SECRET || !process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI and SESSION_SECRET in .env");
  }

  await connectDB();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`CineList running at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
