import { createApi } from "@reduxjs/toolkit/query/react";

import apiBaseQuery from "./axiosBaseQuery";

export const AUTH_API_REDUCER_KEY = "authApi";

export const authApi = createApi({
  reducerPath: AUTH_API_REDUCER_KEY,
  baseQuery: apiBaseQuery,
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    // Boot-time session refresh. Uses the HttpOnly refresh cookie set by
    // /auth/login/ — no body needed; withCredentials is forced by
    // axiosBaseQuery for any URL starting with "auth/".
    getSession: builder.mutation({
      query: () => ({
        url: "auth/refresh/",
        method: "POST",
      }),
      extraOptions: {
        maxRetries: 0,
      },
      invalidatesTags: ["auth"],
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "auth/login/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["auth"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "auth/logout/",
        method: "POST",
      }),
      invalidatesTags: ["auth"],
    }),
  }),
});

export const {
  useGetSessionMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
