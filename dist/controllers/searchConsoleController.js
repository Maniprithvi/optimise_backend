import { decode } from "../helper/middleware.js";
import searchConsole from "../dao/searchConsoleDAO.js";
import userModel from "../db/userModel.js";
import accountModel from "../db/accountModel.js";
class ConsoleController {
    async enableConsole(req, res) {
        try {
            res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //http://localhost:5173
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Referrer-Policy", "no-referrer-when-downgrade");
            const response = await searchConsole.generateRedirectUrl(req);
            res.status(200).json({ url: response });
        }
        catch (error) {
            res.status(500).json({ error: "An error occurred during console" });
        }
    }
    async handleOauth(req, res) {
        try {
            const response = await searchConsole.getVerifyfromConsole(req);
            res.redirect(303, "http://localhost:3000/dashboard");
        }
        catch (error) {
            console.error("Error during sign-in request:", error.message);
            res.status(500).json({ error: "An error occurred during console" });
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
                    type: "console",
                    _id: acc._id,
                });
            }
            if (account) {
                const response = { message: `${userId.name} console enebled` };
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
    async getPerformence(req, res) {
        try {
            const response = await searchConsole.getPerformanceData(req);
            res.status(200).json(response);
        }
        catch (error) {
            console.error("Error during get performance data:", error.message);
            res.status(500).json({
                error: "An error occurred during  get performance data from console",
            });
        }
    }
    async getSiteMapData(req, res) {
        try {
            const response = await searchConsole.getSiteMapData(req);
            res.status(200).json(response);
        }
        catch (error) {
            console.error("Error during get sitemap data:", error.message);
            res.status(500).json({
                error: "An error occurred during  get sitemap data from console",
            });
        }
    }
}
export default new ConsoleController();
//# sourceMappingURL=searchConsoleController.js.map