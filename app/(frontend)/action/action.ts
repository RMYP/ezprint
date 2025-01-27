import axios from "axios";

interface Login {
  email: string;
  password: string;
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
    return response.data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unexpected error";
    throw new Error(message);
  }
};
