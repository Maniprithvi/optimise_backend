import generateToken from "../helper/jwt.js";
import accountModel from "../db/accountModel.js";
import userModel from "../db/userModel.js";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { Token, getRefreshToken, getUserData } from "../helper/token.js";
import bcrypt from "bcryptjs";

class Auth {
  async generateRedirectUrl(req: Request) {
    try {
      console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
      console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_ID);
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error("Missing required environment variables.");
      }
      const redirectUrl = "http://127.0.0.1:8080/oauth";
      const oAuthClient = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: redirectUrl,
      });
      console.log(oAuthClient, "client");
      const authoriseUrl = oAuthClient.generateAuthUrl({
        scope: " https://www.googleapis.com/auth/userinfo.email",
        access_type: "offline",
        prompt: "consent",
      });
      return authoriseUrl;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getVerify(req: Request) {
    const code: any = req.query.code;
    console.log("code", code);
    const redirectUrl = "http://127.0.0.1:8080/oauth";
    const oAuthClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: redirectUrl,
    });
    const authorise = await oAuthClient.getToken(code);
    console.log(authorise, "authorise");
    await oAuthClient.setCredentials(authorise.tokens);
    if (!authorise) {
      throw new Error("acces denied");
    }
    const user = await oAuthClient.credentials;
    console.log("user from client", user);

    const userData = await getUserData(
      oAuthClient.credentials.access_token as string
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
    console.log({ saveUser });
    if (saveUser.account.length > 0) {
      for (let acc of saveUser.account) {
        const account = await accountModel.findOne({
          type: "auth",
          _id: acc._id,
        });

        console.log({ account });

        if (account) {
          const tokenObj = {
            refreshToken: account.refresh_token,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          };

          const refreshToken = await getRefreshToken(tokenObj as Token);

          const update = await accountModel.findOneAndUpdate(
            { _id: account._id }, // Find the account by _id
            { ...refreshToken }, // Update the token fields
            { new: true } // Return the updated document
          );

          console.log({ update });
          console.log("updated token");
        }
      }
    } else {
      const newAccount = await accountModel.create({
        ...user,
        type: "auth",
      });

      console.log({ newAccount });

      const update = await userModel.findByIdAndUpdate(
        saveUser?._id,
        { $addToSet: { account: newAccount?._id } },
        { new: true }
      );

      console.log({ update });
    }
    const token = generateToken(saveUser?._id, saveUser?.email, saveUser?.name);
    console.log(token, "token");
    return token;
  }

  async register(req: Request) {
    const data = req.body;
    console.log(data);
    const { email, password, name } = data;
    console.log({ data });

    const isEmailExist = await userModel.find({
      email,
    });
    console.log({ isEmailExist });
    if (isEmailExist.length > 0) {
      throw new Error("Email aready exist...");
    }
    console.log("hello");
    const hashPwd = await bcrypt.hash(password, 10);
    console.log("hello2");
    console.log({ hashPwd });
    const user = await userModel.create({
      email,
      name,
      password: hashPwd,
    });
    console.log({ user });
    if (!user) {
      throw new Error("un caught mongo error..");
    }
    const token = generateToken(user?._id, email, name);
    console.log({ token });
    return token;
  }
  async login(req: Request) {
    const data = req.body;
    const { email, password } = data;
    console.log(email, password);

    const isEmailExist = await userModel.findOne({
      email,
    });
    console.log({ isEmailExist });
    if (!isEmailExist) {
      throw new Error("Email not found...");
    }
    const passwordsMatch = await bcrypt.compare(
      password,
      isEmailExist?.password as string
    );

    if (!passwordsMatch) {
      throw new Error("password is not matched...");
    }
    const token = generateToken(isEmailExist?._id, email, isEmailExist.name);
    return token;
  }
}

export default new Auth();
