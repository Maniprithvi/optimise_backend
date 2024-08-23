import accountModel from "../db/accountModel.js";
import { Token, getRefreshToken, getUserData } from "../helper/token.js";
import { Request } from "express";
import { IAccount, IUser, RequestCustom } from "../types/model.js";
import { OAuth2Client } from "google-auth-library";
import userModel from "../db/userModel.js";
import { google } from "googleapis";
import { decode } from "../helper/middleware.js";

class YoutubeDAO {
  async generateRedirectUrl(req: Request) {
    // const userId = decode(req);

    // if (!userId) {
    //   throw new Error("un authorised");
    // }
    try {
      if (
        !process.env.GOOGLE_CLIENT_ID2 ||
        !process.env.GOOGLE_CLIENT_SECRET2
      ) {
        throw new Error("Missing required environment variables.");
      }
      const redirectUrl = "http://127.0.0.1:8080/youtubeOauth";
      const youtubeClient = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID2,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET2,
        redirectUri: redirectUrl,
      });
      console.log(youtubeClient, "client");
      const authoriseUrl = youtubeClient.generateAuthUrl({
        scope:
          "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl ",
        access_type: "offline",
        prompt: "consent",
      });
      console.log("url", authoriseUrl);
      return authoriseUrl;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getVerifyfromYoutube(req: Request) {
    const code: any = req.query.code;
    const redirectUrl = "http://127.0.0.1:8080/youtubeOauth";
    const youtubeClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID2,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET2,
      redirectUri: redirectUrl,
    });
    const authorise = await youtubeClient.getToken(code);

    await youtubeClient.setCredentials(authorise.tokens);
    if (!authorise) {
      throw new Error("acces denied");
    }
    const user = await youtubeClient.credentials;

    const userData = await getUserData(
      youtubeClient.credentials.access_token as string
    );
    console.log({ userData });
    const saveUser = await userModel
      .findOneAndUpdate(
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
      )
      .populate("account");

    console.log({ saveUser });
    if (saveUser.account.length > 0) {
      let youtueAcc;

      for (let acc of saveUser.account) {
        const results = await accountModel.findOne({
          _id: { $in: acc._id }, // Match any _id in the ids array
          type: "youtube", // Match documents with the specific type
        });

        console.log({ results });
        if (results != null && results !== undefined) {
          youtueAcc = results;
        }
      }

      if (youtueAcc) {
        // Get the refreshed token
        // const refreshToken = await getRefreshToken(tokenObj as Token);
        youtubeClient.setCredentials({
          refresh_token: youtueAcc?.refresh_token,
        });
        const { credentials } = await youtubeClient.refreshAccessToken();
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
          type: "youtube",
        });

        console.log({ newAccount }, { saveUser });

        // Add the newly created account's _id to the user's account array
        const update = await userModel.findByIdAndUpdate(
          saveUser?._id,
          { $addToSet: { account: newAccount?._id } }, // Use $addToSet to avoid duplicates
          { new: true } // Return the updated document
        );
      }
    }
  }

  async getAnalyticsData(req: Request) {
    console.log("haii");
    const userId = decode(req);
    const { startDate } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID2;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET2;
    const user = await userModel.findById(userId.id).select("account");

    if (!user) {
      throw new Error("user not found");
    }
    let account;
    for (let acc of user.account) {
      account = await accountModel.findOne({
        type: "youtube",
      });
    }

    const token = Number(account?.refresh_token) * 1000;
    if (Date.now() > Number(token)) {
      const tokenObj = {
        refreshToken: account?.refresh_token,
        clientId: process.env.GOOGLE_CLIENT_ID2,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET2,
      };
      const refreshToken: any = await getRefreshToken(tokenObj as Token);

      account = await accountModel.findOneAndUpdate(account?._id, {
        ...refreshToken,
      });
    }
    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: account?.access_token as string,
    });
    const youtubeanalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    const getDate = () => new Date().toISOString().split("T")[0];
    const data = await youtubeanalytics.reports.query({
      ids: "channel==MINE",
      startDate: startDate,
      endDate: getDate(),
      metrics:
        "views,likes,subscribersGained,estimatedMinutesWatched,comments,dislikes,shares,videosAddedToPlaylists",
      dimensions: "day",
      sort: "day",
    });
    return data.data;
    // const dataMonth = await youtubeanalytics.reports.query({
    //   ids: "channel==MINE",
    //   startDate: startDate,
    //   endDate: getDate(),
    //   metrics:
    //     "views,likes,subscribersGained,estimatedMinutesWatched,comments,dislikes,shares,videosAddedToPlaylists",
    //   dimensions: "month",
    //   sort: "month",
    // });

    // return dataMonth;
  }

  async getvideosInfo(req: Request) {
    const userId = decode(req);
    console.log(userId, "userid");
    const clientId = process.env.GOOGLE_CLIENT_ID2;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET2;
    const user = await userModel
      .findById(userId.id)
      .select("account")
      .populate("account");

    if (!user) {
      throw new Error("user not found");
    }
    let account;
    for (let acc of user.account) {
      account = await accountModel.findOne({
        type: "youtube",
        _id: acc._id,
      });
    }

    const token = Number(account?.refresh_token) * 1000;
    if (Date.now() > Number(token)) {
      const tokenObj = {
        refreshToken: account?.refresh_token,
        clientId: process.env.GOOGLE_CLIENT_ID2,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET2,
      };

      const refreshToken: any = await getRefreshToken(tokenObj as Token);
      account = await accountModel.findByIdAndUpdate(account?._id, {
        ...refreshToken,
      });
    }

    // const response = await youtube.channels.list({
    //   auth: oauth2Client,
    //   part: 'snippet,contentDetails,statistics', // Parts you want to retrieve
    //   mine: true, // To specify that you want the authenticated user's channel info
    // });

    // const channelInfo = response.data.items[0];
    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: account?.access_token as string,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    let nextPageToken = "";
    const allUploads: any = [];
    const videoIds: any = [];

    const channelInfo = await youtube.channels.list({
      part: ["snippet", "contentDetails", "statistics"],
      mine: true,
    });
    console.log(channelInfo, "channelInfo");
    console.log(channelInfo.data.items, "chenel inof");
    do {
      try {
        const response = await youtube.activities.list({
          part: ["snippet", "contentDetails"], // Corrected to an array
          mine: true,
          maxResults: 10, // Adjust as needed
          pageToken: nextPageToken,
        });

        nextPageToken = response.data.nextPageToken || "";

        const uploads: any = response?.data?.items?.filter(
          (item: any) => item.snippet.type === "upload"
        );

        const ids = uploads?.map(
          (item: any) => item?.contentDetails?.upload?.videoId
        );

        allUploads.push(...uploads);
        videoIds.push(...ids);
      } catch (error) {
        console.error("Error fetching data from YouTube API:", error);
        return new Error("Failed to fetch data");
      }
    } while (nextPageToken);

    const videosData: any = [];
    for (const videoId of videoIds) {
      const videos = await youtube.videos.list({
        part: ["snippet", "statistics"],
        id: videoId,
      });
      let videoComment;
      try {
        const comments = await youtube.commentThreads.list({
          part: ["snippet", "replies"],
          videoId: videoId,
          maxResults: 100,
        });

        if (comments.data.items && comments.data.items.length > 0) {
          // Process the comments
          console.log("Comments fetched:", comments.data.items);

          videoComment = comments.data.items;
        } else {
          console.log("No comments available for this video.");
          videosData.push({
            videoComment: { message: "No comments available for this video." },
          });
        }
        console.log({ comments });
      } catch (error: any) {
        if (error.message.includes("disabled comments")) {
          console.log("The video has disabled comments.");
        } else {
          console.error("An error occurred while fetching comments:", error);
        }
      }
      // const comments = await youtube.commentThreads.list({
      //   part: ["snippet", "replies"],
      //   videoId: videoId,
      //   maxResults: 100,
      // });

      const [videoDetailsResponse] = await Promise.all([
        videos.data,
        videoComment,
      ]);
      console.log(videoDetailsResponse, "data from promise");
      videosData.push({
        ...videoDetailsResponse,
        channelInfo: channelInfo.data.items,
      });
    }

    console.log(videosData, "All video comments data");
    return videosData;
  }
}
export default new YoutubeDAO();
