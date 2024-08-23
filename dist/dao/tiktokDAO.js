import qs from "qs";
let organisatioId = "7405352534107472902";
let clientId = "awvf3sierz50scrj";
let client_secret = "ugCvWxqfLfZ8WfXPr9kkRxcuNPwuKE35";
class TiktokDAO {
    async generateUrl(req) {
        const csrfState = Math.random().toString(36).substring(2);
        // res.cookie('csrfState', csrfState, { maxAge: 60000 });
        let url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=user.info.basic,video.list&response_type=code&redirect_uri=${SERVER_ENDPOINT_REDIRECT}&state=" + ${csrfState}`;
        return { url, csrfState };
    }
    async handleOauth(req) {
        const code = req.query.code;
        const state = req.query.state;
        const response = await fetch("https://open-api.tiktok.com/oauth/access_token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: qs.stringify({
                client_key: "your_client_key",
                client_secret: "your_client_secret",
                code,
                grant_type: "authorization_code",
                redirect_uri: "your_redirect_uri",
            }),
        });
        const { data } = await response.json();
        console.log("Access Token:", data);
    }
}
//# sourceMappingURL=tiktokDAO.js.map