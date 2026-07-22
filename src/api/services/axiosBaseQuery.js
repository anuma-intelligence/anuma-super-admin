import axios from "axios";

import { setAccessToken } from "../slices/authSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_HOST || "/",
  headers: {
    accept: "application/json",
  },
});

const setUpRequestInterceptor = (getState) => {
  axiosInstance.interceptors.request.clear?.();
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getState()?.auth?.accessToken;
      if (token && config.url !== "auth/refresh/") {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
};

const axiosBaseQuery =
  () =>
  async ({ url, method, body, params, ...requestOpts }, { getState, dispatch }) => {
    setUpRequestInterceptor(getState);
    try {
      const axiosOptions = {
        url,
        method,
        data: body,
        params,
        headers: requestOpts.headers,
        responseType: requestOpts.responseType,
      };
      if (/^auth\//.test(url)) {
        axiosOptions.withCredentials = true;
      }
      const result = await axiosInstance(axiosOptions);
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      const status = err.response?.status;

      // 401 outside the login page means the token is dead — drop it so the
      // app bounces back to /login. Never redirect from /login itself.
      if (
        status === 401 &&
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        dispatch(setAccessToken(null));
      }

      return {
        error: {
          status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export default axiosBaseQuery();
