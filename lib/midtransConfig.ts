import { MidtransClient } from "midtrans-node-client";
import {
  isProduction,
  MidtransClientKey,
  MidtransServerKey,
} from "./envConfig";


export const coreAPI = new MidtransClient.CoreApi({
  isProduction: isProduction,
  serverKey: MidtransServerKey,
  clientKey: MidtransClientKey,
});
