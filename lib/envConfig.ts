import { google } from "googleapis";

export const SALT = Number(process.env.SALT);
export const JWT_SECRET = process.env.JWT_SECRET as string;
const ClientId = process.env.OAUTH_CLIENT_ID;
const ClientSecret = process.env.OAUTH_CLIENT_SECRET;
const OauthCallbackUrl = process.env.CALLBACK_URL;
export const DocPath = process.env.DOCUMENT_PATH as string

export const oauth2Client = new google.auth.OAuth2(
  ClientId,
  ClientSecret,
  OauthCallbackUrl
);
