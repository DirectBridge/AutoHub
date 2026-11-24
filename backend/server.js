const express = require("express");
const cors = require("cors");
require("dotenv").config();

const listingRouter = require("./router/listingRouter");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("express is running succefully");
});

app.use("/api/listings", listingRouter);

app.listen(PORT, () =>
  console.log(`server running succefully on :http://localhost:${PORT}/`),
);
