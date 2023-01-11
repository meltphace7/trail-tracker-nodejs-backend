const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const trailsRoutes = require("./routes/trails");
const bodyParser = require("body-parser");
const multer = require("multer");
const helmet = require("helmet");

const app = express();

// const singleUpload = multer({ storage: storage }).single("file");

// const multipleUpload = multer({ storage: storage }).array("file");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use("/trails", upload.array("image"), trailsRoutes);
app.use(helmet());

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    `mongodb+srv://psychoticOwlEyes888:eyesWideShut123@cluster0.czn6dqq.mongodb.net/trail-tracker?retryWrites=true&w=majority`
  )
  .then((result) => {
    console.log("CONNECTED TO MONGODB");
    app.listen(8080);
  })
  .catch((error) => {
    console.log(error);
  });
