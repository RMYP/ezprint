import { MidtransClient } from "midtrans-node-client";
import {
  isProduction,
  MidtransClientKey,
  MidtransServerKey,
} from "./envConfig";

interface ItemDetails {
  id: string | null;
  // name: string | null;
  price: number | null;
  quantity: number | null;
  category: string | null;
}

export const coreAPI = new MidtransClient.CoreApi({
  isProduction: isProduction,
  serverKey: MidtransServerKey,
  clientKey: MidtransClientKey,
});

export const regularBankParameter = (
  paymentType: string,
  bank: string,
  uuidv4: string,
  grossAmount: number | null,
  details: ItemDetails
) => {
  const regularBank = {
    payment_type: "bank_transfer",
    bank_transfer: { bank: bank },
    transaction_details: {
      order_id: uuidv4,
      gross_amount: grossAmount,
    },
    item_details: [details],
  };

  const mandiriBill = {
    payment_type: "echannel",
    transaction_details: {
      order_id: uuidv4,
      gross_amount: grossAmount,
    },
    echannel: {
      bill_info1: "Payment:",
      bill_info2: "Online purchase",
    },
    item_details: [details],
  };

  const permataBank = {
    payment_type: "permata",
    transaction_details: {
      order_id: uuidv4,
      gross_amount: grossAmount,
    },
    item_details: [details],
  };

  if (paymentType == "bank_transfer") {
    return regularBank;
  }

  if (paymentType == "echannel") {
    return mandiriBill;
  }

  if (paymentType == "permata") {
    return permataBank;
  }

  throw new Error("Invalid payment type");
};
