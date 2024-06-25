import express from "express";
import "dotenv/config";
import connectdb from "./utils/db.js";
import cookieParser from "cookie-parser";

const app = express();

connectdb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection error", error);
  });

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
app.use("/worko/user", userRouter);
