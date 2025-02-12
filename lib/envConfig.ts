import { google } from "googleapis";

export const SALT = Number(process.env.SALT);
export const JWT_SECRET = process.env.JWT_SECRET as string;
const ClientId = process.env.OAUTH_CLIENT_ID;
const ClientSecret = process.env.OAUTH_CLIENT_SECRET;
const OauthCallbackUrl = process.env.CALLBACK_URL;
export const DocPath = process.env.DOCUMENT_PATH as string;
export const MidtransServerKey = process.env.SERVER_KEY as string;
export const MidtransClientKey = process.env.CLIENT_KEY;
export const isProduction = process.env.IS_PRODUCTION == "true" ? true : false;
export const MidtransBaseUrl = process.env.MIDTRANS_BASE_URL;
export const AfterPayment = process.env.AFTER_PAYMENT as string;
const midtransUsername = process.env.MIDTRANS_USERNAME;
const midtransPassword = process.env.MIDTRANS_PASSWORD;

export const oauth2Client = new google.auth.OAuth2(
  ClientId,
  ClientSecret,
  OauthCallbackUrl
);

export const midtransCredential = Buffer.from(`${MidtransServerKey}:`).toString(
  "base64"
);
