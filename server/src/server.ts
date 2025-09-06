import { config } from "dotenv";
config({ path: ".env" });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import storeRouter from "./routes/store.routes.js";
import storeOwnerRouter from "./routes/store-owner.routes.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Public and user routes
app.use("/api/auth", userRouter);

app.use("/api/stores", storeRouter);

// Store owner routes
app.use("/api/store-owner", storeOwnerRouter);

// Admin routes
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
