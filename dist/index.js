import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import router from "./router/index.js";
import cors from "cors";
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "15mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
server.listen(8080, () => {
    console.log("Server running on http://localhost:8080/");
    console.log(process.env.NODE_ENV + " mode is running.");
});
// Uncomment and configure MongoDB connection if needed
mongoose.set("strictQuery", false);
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL ? process.env.MONGO_URL : "");
mongoose.connection.on("error", (error) => console.log(error.message));
app.use("/", router());
//# sourceMappingURL=index.js.map