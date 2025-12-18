import axios, { AxiosRequestConfig } from "axios";
import setupInterceptors from "./interceptor";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

setupInterceptors(API);

export default API;
