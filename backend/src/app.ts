import "dotenv/config";
import express from "express";
import cors from "cors";

import { authRoutes } from "./routes/auth.routes.js";
import { labRoutes } from "./routes/lab.routes.js";
import { componentRoutes } from "./routes/component.routes.js";
import { bookingRoutes } from "./routes/booking.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { applicationRoutes } from "./routes/application.routes.js";
import { hierarchyRoutes } from "./routes/hierarchy.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { initCronJobs } from "./utils/cron.js";
import mongoose from "mongoose";
import helmet from "helmet";
import dns from "dns";
import { rateLimit } from "express-rate-limit";

const app = express();

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("Custom DNS applied");
} catch (err) {
  console.log("DNS override failed:", err);
}
// Security Hardening
app.use(helmet());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Start background cron jobs
initCronJobs();

console.log("Jai Shree Ganesh")

app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authLimiter);

app.get("/health", (req, res) => res.send("Server is running"))

await mongoose.connect(process.env.MONGO_URI!).then(() => console.log("Connected to MongoDB")).catch((error) => console.log(error))
    ;
// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/labs", labRoutes);
app.use("/api/v1/components", componentRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/hierarchy", hierarchyRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));

export default app; 