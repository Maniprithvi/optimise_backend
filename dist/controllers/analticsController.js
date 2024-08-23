import { decode } from "../helper/middleware.js";
import analyticsDAO from "../dao/analyticsDAO.js";
import userModel from "../db/userModel.js";
import accountModel from "../db/accountModel.js";
class AnalyticsController {
    async enableAnalytics(req, res) {
        try {
            res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //http://localhost:5173
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Referrer-Policy", "no-referrer-when-downgrade");
            const response = await analyticsDAO.generateRedirectUrl(req);
            res.status(200).json({ url: response });
        }
        catch (error) {
            res.status(500).json({ error: "An error occurred during analytic." });
        }
    }
    async handleOauth(req, res) {
        try {
            const response = await analyticsDAO.getVerifyfromConsole(req);
            res.redirect(303, "http://localhost:3000/dashboard/analytics");
        }
        catch (error) {
            console.error("Error during sign-in request:", error.message);
            res.status(500).json({ error: "An error occurred during analytic." });
        }
    }
    async getstatus(req, res) {
        try {
            const userId = decode(req);
            console.log(userId, "userid");
            let account;
            const user = await userModel.findById(userId.id);
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
        }
        catch (error) {
            console.error("Error during sign-in request:", error.message);
            res
                .status(500)
                .json({ error: "An error occurred during get channel data." });
        }
    }
}
export default new AnalyticsController();
//# sourceMappingURL=analticsController.js.map