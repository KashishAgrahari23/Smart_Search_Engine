const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const productRoutes = require("./routes/productRoutes")
const searchRoutes = require("./routes/SearchRoutes")
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Smart_SearchEngine API is running ",
//   });
// });

app.use("/api/v1" , productRoutes)
app.use("/api/v1" , searchRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

module.exports = app;
