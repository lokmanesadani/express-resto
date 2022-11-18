const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// --------- routes -----------------
const authRoute = require("./routes/auth");

const port = process.env.port || 8080;

dotenv.config();
// ---------- uses ----------
app.use(morgan("tiny"));
app.use(cors({}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// ********** endpoints ***********
// test endpoint
app.get("/", (req, res) => {
  res.json({ name: "lokmane" });
});

// register endpoint

app.use("/api/auth", authRoute);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
  app.listen(port, console.log(`listening to port ${port} ...`));
});
