const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// --------------- routes -------------------
const authRoute = require("./routes/auth");
const productsRoute = require("./routes/products");
const refreshRoute = require("./routes/refreshRoute");
const verify = require("./utils/verification");

const port = process.env.port || 8080;

dotenv.config();

// ------------------ uses -----------------
app.use(morgan("tiny"));
app.use(cors({ credentials: true, origin: process.env.FRONT }));
app.use(cookieParser());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// ----------------- endpoints ----------------
// test endpoint
app.get("/", (req, res) => {
  res.json({ name: "lokmane" });
});

// ---------------- register route -------------
app.use("/api/auth", authRoute);
app.use("/api/v1", verify, productsRoute);
app.use("/api/refresh", refreshRoute);
// ----------------- launch app ----------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
  app.listen(port, console.log(`listening to port ${port}...`));
});
