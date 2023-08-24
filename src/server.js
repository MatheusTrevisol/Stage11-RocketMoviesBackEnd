require("dotenv/config");

require("express-async-errors");

const express = require("express");
const AppError = require("./utils/AppError");
const sqliteConnection = require("./database/sqlite")
const routes = require("./routes");

const uploadConfig = require("./configs/upload");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/files", express.static(uploadConfig.UPLOAD_FOLDER));

app.use(routes);

sqliteConnection();

app.use(( error, request, response, next) => {
  if(error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message
    });
  }

  return response.status(500).json({
    status: "error",
    message: "Internal Server Error"
  });
})

const PORT = process.env.SERVER_PORT || 3333;
app.listen(PORT, () => console.log(`Server is running at PORT: ${PORT}`));
