import userModel from "@/db/userModel.js";
import auth from "../dao/authDAO.js";
import { Request, Response } from "express";

class AuthController {
  async signInRequest(req: Request, res: Response) {
    try {
      // Set headers for CORS and security
      res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //http://localhost:5173
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Referrer-Policy", "no-referrer-when-downgrade");
      // Generate the Google OAuth redirect URL
      const response = await auth.generateRedirectUrl(req);
      console.log("res", response);
      // Return the redirect URL as a JSON response
      res.status(200).json({ url: response });
    } catch (error: any) {
      console.error("Error during sign-in request:", error.message);

      // Handle errors and send a proper response
      res.status(500).json({ error: "An error occurred during sign-in." });
    }
  }
  async handleOauth(req: Request, res: Response) {
    try {
      const response = await auth.getVerify(req);

      res.setHeader("Authorization", `Bearer ${response}`);

      res.redirect(303, `http://127.0.0.1:3000?token=${response}`);
    } catch (error: any) {
      console.error("Error during sign-in request:", error.message);

      res.status(500).json({ error: "An error occurred during sign-in." });
    }
  }
  async register(req: Request, res: Response) {
    try {
      const response = await auth.register(req);
      res.header({ "Set-Cookie": response });
      res
        .status(200)
        .json({ message: "register successfully", token: response });
    } catch (error: any) {
      console.error("Error during register:", error.message);

      res.status(500).json({ message: error.message });
    }
  }
  async login(req: Request, res: Response) {
    try {
      const response = await auth.login(req);

      res.status(200).json({ message: "login successfully", token: response });
    } catch (error: any) {
      console.error("Error during login:", error.message);

      res.status(500).json({ error: "An error occurred during login." });
    }
  }
}
export default new AuthController();
