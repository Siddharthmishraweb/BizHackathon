"use strict";
/**
 * Route definitions for the API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = createRouter;
const express_1 = require("express");
const analysisController_1 = require("../controllers/analysisController");
const userController_1 = require("../controllers/userController");
function createRouter() {
    const router = (0, express_1.Router)();
    // Analysis routes
    router.post("/analysis", (req, res) => analysisController_1.analysisController.runAnalysis(req, res));
    router.get("/analysis/:analysisId", (req, res) => analysisController_1.analysisController.getAnalysis(req, res));
    router.get("/analysis", (req, res) => analysisController_1.analysisController.listAnalyses(req, res));
    // User routes
    router.post("/users", (req, res) => userController_1.userController.createUser(req, res));
    router.get("/users/:userId", (req, res) => userController_1.userController.getUser(req, res));
    return router;
}
