import { decode } from "../helper/middleware.js";
import analyticsDAO from "../dao/analyticsDAO.js";

import { Request, Response } from "express";
import userModel from "../db/userModel.js";
import accountModel from "../db/accountModel.js";

class AnalyticsController {
  async enableAnalytics(req: Request, res: Response) {
    try {
      res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //http://localhost:5173
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Referrer-Policy", "no-referrer-when-downgrade");
      const response = await analyticsDAO.generateRedirectUrl(req);

      res.status(200).json({ url: response });
    } catch (error) {
      res.status(500).json({ error: "An error occurred during analytic." });
    }
  }
  async handleOauth(req: Request, res: Response) {
    try {
      const response = await analyticsDAO.getVerifyfromConsole(req);

      res.redirect(303, "http://localhost:3000/dashboard/analytics");
    } catch (error: any) {
      console.error("Error during sign-in request:", error.message);

      res.status(500).json({ error: "An error occurred during analytic." });
    }
  }
  async getstatus(req: Request, res: Response) {
    try {
      const userId = decode(req);
      console.log(userId, "userid");
      let account;
      const user: any = await userModel.findById(userId.id);
      console.log({ user });
      for (let acc of user?.account) {
        account = await accountModel.findOne({
          type: "analytic",
          _id: acc._id,
        });
      }
      if (account) {
        const response = { message: `${userId.name} analytics enebled` };

        res.status(200).json(response);
      }
    } catch (error: any) {
      console.error("Error during sign-in request:", error.message);

      res
        .status(500)
        .json({ error: "An error occurred during get channel data." });
    }
  }

  //   async getVideoAnalytics(req: Request, res: Response) {
  //     try {
  //       const response = await youtubeDAO.getAnalyticsData(req);

  //       res.status(200).json(response);
  //     } catch (error: any) {
  //       console.error("Error during video request:", error.message);

  //       res
  //         .status(500)
  //         .json({ error: "An error occurred during getVideo data." });
  //     }
  //   }
}
export default new AnalyticsController();
