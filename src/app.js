const express = require("express");
const cors = require("cors");

const AppError = require("./utils/AppError");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const mappingRoutes = require("./routes/mappingRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));


app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Healthcare API is running"
    });
});


app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/mappings", mappingRoutes);


app.use((req, res, next) => {
    next(new AppError(
        `Route not found: ${req.method} ${req.originalUrl}`,
        404
    ));
});


app.use(errorMiddleware);

module.exports = app;