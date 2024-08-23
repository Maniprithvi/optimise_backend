import { decode } from "../helper/middleware.js";
import searchConsole from "../dao/searchConsoleDAO.js";

import { Request, Response } from "express";
import userModel from "../db/userModel.js";
import accountModel from "../db/accountModel.js";

class ConsoleController {
  async enableConsole(req: Request, res: Response) {
    try {
      res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //http://localhost:5173
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Referrer-Policy", "no-referrer-when-downgrade");
      const response = await searchConsole.generateRedirectUrl(req);

      res.status(200).json({ url: response });
    } catch (error) {
      res.status(500).json({ error: "An error occurred during console" });
    }
  }
  async handleOauth(req: Request, res: Response) {
    try {
      const response = await searchConsole.getVerifyfromConsole(req);

      res.redirect(303, "http://localhost:3000/dashboard");
    } catch (error: any) {
      console.error("Error during sign-in request:", error.message);

      res.status(500).json({ error: "An error occurred during console" });
    }
  }
  async getstatus(req: Request, res: Response) {
    try {
      const userId = decode(req);
      console.log(userId, "userid");
      let account;
      const user: any = await userModel.findById(userId.id);
      for (let acc of user?.account) {
        account = await accountModel.findOne({
          type: "console",
          _id: acc._id,
        });
      }
      if (account) {
        const response = { message: `${userId.name} console enebled` };

        res.status(200).json(response);
      }
    } catch (error: any) {
      console.error("Error during sign-in request:", error.message);

      res
        .status(500)
        .json({ error: "An error occurred during get channel data." });
    }
  }
  async getPerformence(req: Request, res: Response) {
    try {
      const response = await searchConsole.getPerformanceData(req);
      res.status(200).json(response);
    } catch (error: any) {
      console.error("Error during get performance data:", error.message);

      res.status(500).json({
        error: "An error occurred during  get performance data from console",
      });
    }
  }
  async getSiteMapData(req: Request, res: Response) {
    try {
      const response = await searchConsole.getSiteMapData(req);
      res.status(200).json(response);
    } catch (error: any) {
      console.error("Error during get sitemap data:", error.message);

      res.status(500).json({
        error: "An error occurred during  get sitemap data from console",
      });
    }
  }
}
export default new ConsoleController();
