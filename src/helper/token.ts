import { OAuth2Client } from "google-auth-library";
export interface Token {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export const getRefreshToken = async ({
  clientId,
  clientSecret,
  refreshToken,
}: Token) => {
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("clientId/secret not found");
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret);

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    const accessToken = credentials.access_token;
    const expiryDate = credentials.expiry_date;

    return { accessToken, expiryDate };
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const getUserData = async (token: string) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    //console.log('response',response);
    const data = await response.json();
    // console.log("data from token", data);
    return data;
  } catch (error: any) {
    console.log(error.message);
  }
};
