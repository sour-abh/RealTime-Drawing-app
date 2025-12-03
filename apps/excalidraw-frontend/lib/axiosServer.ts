import axios from "axios";
import { cookies } from "next/headers";
import { BACKEND_HTTP_URL } from "@/config";

export function axiosServer() {
  const axiosInstance = axios.create({
    baseURL: BACKEND_HTTP_URL,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(async (config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.log("NO TOKEN FOUND IN COOKIES");
    } else {
      console.log("TOKEN FOUND:", token);
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return axiosInstance;
}
