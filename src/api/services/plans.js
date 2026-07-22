import { createApi } from "@reduxjs/toolkit/query/react";

import apiBaseQuery from "./axiosBaseQuery";

export const PLANS_API_REDUCER_KEY = "plansApi";

export const plansApi = createApi({
  reducerPath: PLANS_API_REDUCER_KEY,
  baseQuery: apiBaseQuery,
  tagTypes: ["Plans"],
  endpoints: (builder) => ({
    listPlans: builder.query({
      query: (params) => ({ url: "api/billing/plans/", params }),
      providesTags: [{ type: "Plans", id: "ALL" }],
    }),
    getPlan: builder.query({
      query: (id) => ({ url: `api/billing/plans/${id}/` }),
      providesTags: (result, error, id) => [{ type: "Plans", id }],
    }),
    createPlan: builder.mutation({
      query: (body) => ({ url: "api/billing/plans/", method: "POST", body }),
      invalidatesTags: [{ type: "Plans", id: "ALL" }],
    }),
    updatePlan: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/billing/plans/${id}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Plans", id },
        { type: "Plans", id: "ALL" },
      ],
    }),
    patchPlan: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/billing/plans/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Plans", id },
        { type: "Plans", id: "ALL" },
      ],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({ url: `api/billing/plans/${id}/`, method: "DELETE" }),
      invalidatesTags: [{ type: "Plans", id: "ALL" }],
    }),
    activatePlan: builder.mutation({
      query: (id) => ({
        url: `api/billing/plans/${id}/activate/`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Plans", id },
        { type: "Plans", id: "ALL" },
      ],
    }),
  }),
});

export const {
  useListPlansQuery,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  usePatchPlanMutation,
  useDeletePlanMutation,
  useActivatePlanMutation,
} = plansApi;
