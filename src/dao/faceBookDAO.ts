import { Request } from "express";

class FacebookDAO {
  private FACEBOOK_APP_SECRET = "cc819a109f793efd7c0d909ca0397451";
  private FACEBOOK_APP_ID = "1197114374946072";
  async generateUrl(req: Request): Promise<string> {
    const REDIRECT_URI = "http://localhost:8080/facebookOauth";

    console.log("app id", this.FACEBOOK_APP_ID);
    const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${this.FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email,public_profile,pages_read_engagement,pages_read_user_content,read_insights,pages_show_list`;

    // const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${this.FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email`;
    console.log(authUrl);
    return authUrl;
  }

  async handleOAuth(req: Request): Promise<any> {
    const code = req.query.code as string;
    const REDIRECT_URI = "http://localhost:8080/facebookOauth";

    // Exchange authorization code for access token using fetch
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${this.FACEBOOK_APP_ID}&client_secret=${this.FACEBOOK_APP_SECRET}&redirect_uri=${REDIRECT_URI}&code=${code}`
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Failed to fetch access token: ${tokenResponse.statusText}`
      );
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;
    console.log(tokenData, "token data");
    // Use the access token to fetch the user's profile using fetch
    const profileResponse = await fetch(
      `https://graph.facebook.com/v20.0/me?fields=name,email&access_token=${access_token}`
    );
    // const getaccessFor60day = await fetch(
    //   `https://graph.facebook.com/v13.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.FACEBOOK_APP_ID}&client_secret=${this.FACEBOOK_APP_SECRET}&fb_exchange_token=${access_token}`
    // );
    // const accessToken = await getaccessFor60day.json();
    // console.log(accessToken, "res");
    if (!profileResponse.ok) {
      throw new Error(
        `Failed to fetch user profile: ${profileResponse.statusText}`
      );
    }

    const profile = await profileResponse.json();
    console.log("User Profile:", profile);
    const pageToken = await fetch(
      `https://graph.facebook.com/${profile.id}/accounts?access_token=${access_token}`
    );
    const pageToken_res = await pageToken.json();
    console.log(pageToken_res, "page token");

    return { profile, pageToken, access_token };
  }
}

export default new FacebookDAO();
