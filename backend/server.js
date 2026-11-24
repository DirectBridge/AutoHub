const express = require("express");
const app = express();
require("dotenv").config();
PORT = process.env.PORT || 5000;
app.use(express.json());
app.get("/", (req, res) => {
  res.send("express is running succefully");
});

app.listen(PORT, () =>
  console.log(`server running succefully on :http://localhost:${PORT}/`),
);
