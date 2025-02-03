import axios, { AxiosError } from "axios";
import { file } from "googleapis/build/src/apis/file";

interface Login {
  email: string;
  password: string;
}

interface createOrder {
  sheetCount: number;
  paperType: string;
  finishing: string;
  quantity: number;
  printType: string;
  totalPrice: number | undefined;
  fieldId: string;
}

export const tryLogin = async (data: Login) => {
  try {
    const response = await axios.post("/api/v1/auth/login", data);
    if (response.data.status !== 201) {
      throw new Error(response.data.message || "Unexpected error occurred");
    }
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const serverMessage = err.response.data?.message || "Unexpected error";
      throw new Error(serverMessage);
    } else {
      throw new Error("Unexpected error occurred");
    }
  }
};

export const tryRegister = async (data: Login) => {
  try {
    const response = await axios.post("/api/v1/auth/register", data);
    if (response.data.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Axios request error");
    } else {
      console.error("Unexpected error:", err);
      throw new Error("Unexpected server error");
    }
  }
};

export const createCheckout = async (data: createOrder, token: string) => {
  try {
    const response = await axios.post("api/v1/order", data, {
      headers: {
        Authorization: `${token}`,
      },
    });

    if (response.status !== 201) {
      throw new Error(response.data.message || "Upload failed");
    }
    return;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Axios request error");
    } else {
      console.error("Unexpected error:", err);
      throw new Error("Unexpected server error");
    }
  }
};

export const uploadFileCheckout = async (data: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("file", data);

    const response = await axios.post("/api/v1/order/file", formData, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status !== 201) {
      throw new Error(response.data.message || "Upload failed");
    }

    console.log(response.data);
    return response.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Axios request error");
    } else {
      console.error("Unexpected error:", err);
      throw new Error("Unexpected server error");
    }
  }
};

export const getTransaction = async (id: string, token: string) => {
  try {
    const response = await axios.get(`/api/v1/payment/check-transaction/${id}`, {
      headers: {
        Authorization: `${token}`,
      },
    });

    return response.data.data;    
  } catch (err: unknown) {
    const error = axiosErrorHandler(err);
    throw new Error(error);
  }
};

const axiosErrorHandler = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || "Request server error, try again";
  } else {
    return "Unexpected server error";
  }
};
