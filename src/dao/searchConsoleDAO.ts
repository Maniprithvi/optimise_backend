import accountModel from "../db/accountModel.js";
import { Token, getRefreshToken, getUserData } from "../helper/token.js";
import { Request } from "express";
import { OAuth2Client } from "google-auth-library";
import userModel from "../db/userModel.js";
import { google } from "googleapis";
import { decode } from "../helper/middleware.js";

class searchConsole {
  async generateRedirectUrl(req: Request) {
    try {
      if (
        !process.env.GOOGLE_CLIENT_ID4 ||
        !process.env.GOOGLE_CLIENT_SECRET4
      ) {
        throw new Error("Missing required environment variables.");
      }
      const redirectUrl = "http://127.0.0.1:8080/consoleOauth";
      const Client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID4,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET4,
        redirectUri: redirectUrl,
      });
      console.log(Client, "client");
      const authoriseUrl = Client.generateAuthUrl({
        scope:
          "openid email profile https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/webmasters ",
        access_type: "offline",
        prompt: "consent",
      });
      return authoriseUrl;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getVerifyfromConsole(req: Request) {
    const code: any = req.query.code;
    console.log("code", code);
    const redirectUrl = "http://127.0.0.1:8080/consoleOauth";
    const consoleClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID4,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET4,
      redirectUri: redirectUrl,
    });
    const authorise = await consoleClient.getToken(code);
    console.log(authorise, "authorise");
    await consoleClient.setCredentials(authorise.tokens);
    if (!authorise) {
      throw new Error("acces denied");
    }
    const user = await consoleClient.credentials;
    console.log("user from client", user);

    const userData = await getUserData(
      consoleClient.credentials.access_token as string
    );
    const saveUser = await userModel.findOneAndUpdate(
      { email: userData.email },
      {
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (saveUser.account.length > 0) {
      let youtueAcc;

      for (let acc of saveUser.account) {
        const results = await accountModel.findOne({
          _id: { $in: acc._id }, // Match any _id in the ids array
          type: "console", // Match documents with the specific type
        });

        console.log({ results });
        if (results != null && results !== undefined) {
          youtueAcc = results;
        }
      }

      if (youtueAcc) {
        consoleClient.setCredentials({
          refresh_token: youtueAcc?.refresh_token,
        });
        const { credentials } = await consoleClient.refreshAccessToken();
        console.log(credentials);
        // Update the account with the new token details
        const update = await accountModel.findOneAndUpdate(
          { _id: youtueAcc?._id }, // Find the account by _id
          { ...credentials }, // Update the token fields
          { new: true } // Return the updated document
        );

        console.log({ update });
        console.log("updated token");
      } else {
        const newAccount = await accountModel.create({
          ...user,
          type: "console",
        });

        // Add the newly created account's _id to the user's account array
        const update = await userModel.findByIdAndUpdate(
          saveUser?._id,
          { $addToSet: { account: newAccount?._id } }, // Use $addToSet to avoid duplicates
          { new: true } // Return the updated document
        );
      }
    }
  }

  async getPerformanceData(req: Request) {
    const userId = decode(req);
    const { url, startDate } = req.body;
    console.log(url);
    const user: any = await userModel.findById(userId.id);
    console.log("user", user);
    const clientId = process.env.GOOGLE_CLIENT_ID4;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET4;
    let account;
    for (let acc of user?.account) {
      account = await accountModel.findOne({
        _id: acc._id,
        type: "console",
      });
    }
    if (!account) {
      throw new Error("please enable the Console service first...");
    }
    console.log({ account });

    const token = Number(account?.refresh_token) * 1000;
    if (Date.now() > Number(token)) {
      const tokenObj = {
        refreshToken: account?.refresh_token,
        clientId: process.env.GOOGLE_CLIENT_ID4,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET4,
      };
      const refreshToken: any = await getRefreshToken(tokenObj as Token);
      console.log({ refreshToken });
      account = await accountModel.findOneAndUpdate(account?._id, {
        ...refreshToken,
      });
    }
    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: account?.access_token as string,
    });
    const webmasters = await google.webmasters({
      version: "v3",
      auth: oauth2Client,
    });
    const getDate = () => new Date().toISOString().split("T")[0];
    const response = await webmasters.searchanalytics.query({
      siteUrl: url,
      requestBody: {
        startDate: startDate,
        endDate: getDate(),
        dimensions: ["query"],
        rowLimit: 100,
      },
    });
    console.log(response.data);
    return response.data;
  }
  async getSiteMapData(req: Request) {
    const userId = decode(req);
    const { siteUrl, feedpath } = req.body;
    const user: any = await userModel.findById(userId.id);
    console.log("user", user);
    const clientId = process.env.GOOGLE_CLIENT_ID4;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET4;
    let account;
    for (let acc of user?.account) {
      account = await accountModel.findOne({
        _id: acc._id,
        type: "console",
      });
    }
    if (!account) {
      throw new Error("please enable the Console service first...");
    }
    console.log({ account });

    const token = Number(account?.refresh_token) * 1000;
    if (Date.now() > Number(token)) {
      const tokenObj = {
        refreshToken: account?.refresh_token,
        clientId: process.env.GOOGLE_CLIENT_ID4,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET4,
      };
      const refreshToken: any = await getRefreshToken(tokenObj as Token);
      console.log({ refreshToken });
      account = await accountModel.findOneAndUpdate(account?._id, {
        ...refreshToken,
      });
    }
    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: account?.access_token as string,
    });
    const webmasters = await google.webmasters({
      version: "v3",
      auth: oauth2Client,
    });

    const res = await webmasters.sitemaps.submit({
      // siteUrl: "https://www.example.com",
      // feedpath: "https://www.example.com/sitemap.xml",
      siteUrl: siteUrl,
      feedpath: feedpath,
    });
    console.log(res);
    return res.data;
  }
  async ref(req: Request) {
    const userId = decode(req);
    const user: any = await userModel.findById(userId.id);
    console.log({ user });
    const clientId = process.env.GOOGLE_CLIENT_ID4;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET4;
    let account;
    for (let acc of user?.account) {
      account = await accountModel.findOne({
        _id: acc._id,
        type: "console",
      });
    }
    if (!account) {
      throw new Error("please enable the Console service first...");
    }
    console.log({ account });

    const token = Number(account?.refresh_token) * 1000;
    if (Date.now() > Number(token)) {
      const tokenObj = {
        refreshToken: account?.refresh_token,
        clientId: process.env.GOOGLE_CLIENT_ID4,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET4,
      };
      const refreshToken: any = await getRefreshToken(tokenObj as Token);
      console.log({ refreshToken });
      account = await accountModel.findOneAndUpdate(account?._id, {
        ...refreshToken,
      });
    }
    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: account?.access_token as string,
    });
    const webmasters = await google.webmasters({
      version: "v3",
      auth: oauth2Client,
    });
    const getDate = () => new Date().toISOString().split("T")[0];
  }
}
export default new searchConsole();
