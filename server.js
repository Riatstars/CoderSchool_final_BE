import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./react-js-blog-website-ce8d0-firebase-adminsdk-e0mnm-f3df1d78d5.json" assert { type: "json" };
import { getImgUploadUrl } from "./utils/utils.js";
import { router } from "./routes/index.js";

const server = express();
let PORT = 3000;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});
server.use(express.json());
server.use(cors());
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});
server.listen(PORT, () => {
  console.log("listening on port => " + PORT);
});

server.get("/get-upload-url", getImgUploadUrl);
server.use("/", router);
