const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MONGODB_URI } = require("./config/constants");
const userRoutes = require("./routes/user");
const path = require("path");

// require("./mail/transporter");
// require("./processors/index");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/users", userRoutes);

app.use("/files", express.static(path.join(__dirname, "public/files")));

mongoose
  .connect(MONGODB_URI)
  .then((success) => console.log("Mongodb connected successfully..."))
  .catch((error) => console.log(error));

const PORT = 4000;

app.listen(PORT, () => console.log(`App is running on ${PORT}...`));
