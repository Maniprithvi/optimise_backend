import { decode } from "../helper/middleware.js";
import youtubeDAO from "../dao/youtubeDAO.js";
import userModel from "../db/userModel.js";
import accountModel from "../db/accountModel.js";
class YoutubeController {
    async enableYoutube(req, res) {
        try {
            res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //http://localhost:5173
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Referrer-Policy", "no-referrer-when-downgrade");
            const response = await youtubeDAO.generateRedirectUrl(req);
            res.status(200).json({ url: response });
        }
        catch (error) {
            res.status(500).json({ error: "An error occurred during youtube." });
        }
    }
    async handleOauth(req, res) {
        try {
            const response = await youtubeDAO.getVerifyfromYoutube(req);
            res.redirect(303, "http://localhost:3000");
        }
        catch (error) {
            console.error("Error during sign-in request:", error.message);
            res.status(500).json({ error: "An error occurred during sign-in." });
        }
    }
    async getVideoAnalytics(req, res) {
        try {
            const response = await youtubeDAO.getAnalyticsData(req);
            res.status(200).json(response);
        }
        catch (error) {
            console.error("Error during video request:", error.message);
            res
                .status(500)
                .json({ error: "An error occurred during getVideo data." });
        }
    }
    async getvideosInfo(req, res) {
        try {
            const response = await youtubeDAO.getvideosInfo(req);
            res.status(200).json(response);
        }
        catch (error) {
            console.error("Error during sign-in request:", error.message);
            res
                .status(500)
                .json({ error: "An error occurred during get channel data." });
        }
    }
    async getstatus(req, res) {
        try {
            const userId = decode(req);
            console.log(userId, "userid");
            let account;
            const user = await userModel.findById(userId.id);
            for (let acc of user?.account) {
                account = await accountModel.findOne({
                    type: "youtube",
                    _id: acc._id,
                });
            }
            if (account) {
                const response = { message: `${userId.name} youtube enebled` };
                res.status(200).json(response);
            }
        }
        catch (error) {
            console.error("Error during sign-in request:", error.message);
            res
                .status(500)
                .json({ error: "An error occurred during get channel data." });
        }
    }
}
export default new YoutubeController();
//# sourceMappingURL=youtubeController.js.map