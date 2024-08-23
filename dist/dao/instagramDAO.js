class InstagramDAO {
    INSTAGRAM_APP_SECRET = "48764caf0f4b88fcfae6b4e5ad6e0d50"; // Replace with your Instagram App Secret
    INSTAGRAM_APP_ID = "366973479789153"; // Replace with your Instagram App ID
    async generateUrl(req) {
        const REDIRECT_URI = "http://localhost:8080/instagramOauth"; // Your Instagram Redirect URI
        const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${this.INSTAGRAM_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email,public_profile,instagram_basic,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement&response_type=code`;
        console.log(authUrl);
        return authUrl;
    }
    async handleOAuth(req) {
        const code = req.query.code;
        const REDIRECT_URI = "http://localhost:8080/instagramOauth"; // Your Instagram Redirect URI
        // Exchange authorization code for access token
        const tokenResponse = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?client_id=${this.INSTAGRAM_APP_ID}&client_secret=${this.INSTAGRAM_APP_SECRET}&redirect_uri=${REDIRECT_URI}&code=${code}`);
        if (!tokenResponse.ok) {
            throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}`);
        }
        const tokenData = await tokenResponse.json();
        const access_token = tokenData.access_token;
        console.log("Instagram Token Data:", tokenData);
        const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,email&access_token=${access_token}`);
        console.log("haii mame");
        const profile = await profileResponse;
        console.log({ profile });
    }
}
export default new InstagramDAO();
//# sourceMappingURL=instagramDAO.js.map