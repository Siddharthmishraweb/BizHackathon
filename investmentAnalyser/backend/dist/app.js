"use strict";
/**
 * Main Express application setup.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3000;
exports.PORT = PORT;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// API routes (all under /api/v1)
const apiRouter = (0, routes_1.createRouter)();
app.use("/api/v1", apiRouter);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: `Endpoint ${req.method} ${req.path} not found`,
        },
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
        },
    });
});
