const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : []),
]
  .map((origin) => origin && origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin || "");
    const isVercelApp = /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin || "");
    const isAllowed = !origin || isLocalhost || isVercelApp || allowedOrigins.includes(origin);
    if (isAllowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Root
app.get("/", (req, res) => {
  res.json({ message: "Inventory Management API Running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`),
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
