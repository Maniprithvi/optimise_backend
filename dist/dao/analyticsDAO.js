import accountModel from "../db/accountModel.js";
import { getUserData } from "../helper/token.js";
import { OAuth2Client } from "google-auth-library";
import userModel from "../db/userModel.js";
class AnalyticsDAO {
    async generateRedirectUrl(req) {
        // const userId = decode(req);
        // if (!userId) {
        //   throw new Error("un authorised");
        // }
        try {
            if (!process.env.GOOGLE_CLIENT_ID3 ||
                !process.env.GOOGLE_CLIENT_SECRET3) {
                throw new Error("Missing required environment variables.");
            }
            const redirectUrl = "http://127.0.0.1:8080/analyticsOauth";
            const analyticClient = new OAuth2Client({
                clientId: process.env.GOOGLE_CLIENT_ID3,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET3,
                redirectUri: redirectUrl,
            });
            console.log(analyticClient, "client");
            const authoriseUrl = analyticClient.generateAuthUrl({
                scope: "openid email profile https://www.googleapis.com/auth/analytics.readonly ",
                access_type: "offline",
                prompt: "consent",
            });
            console.log("url", authoriseUrl);
            return authoriseUrl;
        }
        catch (error) {
            console.log(error.message);
            throw new Error(error.message);
        }
    }
    async getVerifyfromConsole(req) {
        const code = req.query.code;
        const redirectUrl = "http://127.0.0.1:8080/analyticsOauth";
        const analyticClient = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID3,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET3,
            redirectUri: redirectUrl,
        });
        const authorise = await analyticClient.getToken(code);
        await analyticClient.setCredentials(authorise.tokens);
        if (!authorise) {
            throw new Error("acces denied");
        }
        const user = await analyticClient.credentials;
        const userData = await getUserData(analyticClient.credentials.access_token);
        console.log({ userData }, "its this");
        const saveUser = await userModel
            .findOneAndUpdate({ email: userData.email }, {
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
        }, {
            upsert: true,
            new: true,
        })
            .populate("account")
            .populate("account");
        console.log({ saveUser });
        if (saveUser.account.length > 0) {
            let analyicAcc;
            for (let acc of saveUser.account) {
                const results = await accountModel.findOne({
                    _id: { $in: acc._id }, // Match any _id in the ids array
                    type: "analytic", // Match documents with the specific type
                });
                console.log("jaii");
                console.log({ results });
                if (results != null && results !== undefined) {
                    analyicAcc = results;
                }
            }
            if (analyicAcc) {
                // If account exists, update the tokens
                const tokenObj = {
                    refreshToken: analyicAcc?.refresh_token,
                    clientId: process.env.GOOGLE_CLIENT_ID3,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET3,
                };
                // Get the refreshed token
                // const refreshToken = await getRefreshToken(tokenObj as Token);
                analyticClient.setCredentials({
                    refresh_token: analyicAcc?.refresh_token,
                });
                const { credentials } = await analyticClient.refreshAccessToken();
                console.log(credentials);
                // Update the account with the new token details
                const update = await accountModel.findOneAndUpdate({ _id: analyicAcc?._id }, // Find the account by _id
                { ...credentials }, // Update the token fields
                { new: true } // Return the updated document
                );
                console.log({ update });
                console.log("updated token");
            }
            else {
                const newAccount = await accountModel.create({
                    ...user,
                    type: "analytic",
                });
                console.log({ newAccount }, { saveUser });
                // Add the newly created account's _id to the user's account array
                const update = await userModel.findByIdAndUpdate(saveUser?._id, { $addToSet: { account: newAccount?._id } }, // Use $addToSet to avoid duplicates
                { new: true } // Return the updated document
                );
            }
        }
    }
}
export default new AnalyticsDAO();
//# sourceMappingURL=analyticsDAO.js.map