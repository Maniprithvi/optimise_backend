import express from "express";
import authController from "../controllers/authController.js";

export default (router: express.Router) => {
  router.post("/auth", authController.signInRequest);
  router.get("/oauth", authController.handleOauth);
  router.post("/register", authController.register);
  router.post("/login", authController.login);
};
