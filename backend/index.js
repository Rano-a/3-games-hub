const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 5000; // retirer plus tard le || 5000

dotenv.config();
connectDB();

app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
