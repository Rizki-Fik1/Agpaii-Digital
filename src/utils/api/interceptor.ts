import { Axios, AxiosError, InternalAxiosRequestConfig } from "axios";

const setupInterceptors = (api: Axios) => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig<any>) => {
      const access_token = localStorage.getItem("access_token");
      if (!!access_token)
        config.headers.Authorization = "Bearer " + access_token;
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );
};

export default setupInterceptors;
