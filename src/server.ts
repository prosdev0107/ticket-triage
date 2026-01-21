import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { triageRouter } from "./routes/triage";
import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./utils/logger";

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(triageRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info("Server started", {
    port,
    nodeEnv: process.env.NODE_ENV || "development",
  });
});