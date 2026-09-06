/**
 * Route definitions for the API.
 */

import { Router } from "express";
import { analysisController } from "../controllers/analysisController";
import { userController } from "../controllers/userController";

export function createRouter(): Router {
  const router = Router();

  // Analysis routes
  router.post("/analysis", (req, res) => analysisController.runAnalysis(req, res));
  router.get("/analysis/:analysisId", (req, res) => analysisController.getAnalysis(req, res));
  router.get("/analysis", (req, res) => analysisController.listAnalyses(req, res));

  // User routes
  router.post("/users", (req, res) => userController.createUser(req, res));
  router.get("/users/:userId", (req, res) => userController.getUser(req, res));

  return router;
}
