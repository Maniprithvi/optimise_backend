import instagramDAO from "../dao/instagramDAO.js";
class FaceBookController {
    async enableFacebook(req, res) {
        try {
            res.header("Access-Control-Allow-Origin", "http://localhost:3000"); //http://localhost:5173
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Referrer-Policy", "no-referrer-when-downgrade");
            const response = await instagramDAO.generateUrl(req);
            res.status(200).json({ url: response });
        }
        catch (error) {
            res.status(500).json({ error: "An error occurred during analytic." });
        }
    }
    async handleOauth(req, res) {
        try {
            const response = await instagramDAO.handleOAuth(req);
            res.redirect(303, "http://localhost:3000");
        }
        catch (error) {
            console.error("Error during sign-in request:", error.message);
            res.status(500).json({ error: "An error occurred during analytic." });
        }
    }
}
export default new FaceBookController();
//# sourceMappingURL=instagramController.js.map