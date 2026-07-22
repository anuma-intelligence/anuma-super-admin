import { createApi } from "@reduxjs/toolkit/query/react";

import apiBaseQuery from "./axiosBaseQuery";

export const MERCHANTS_API_REDUCER_KEY = "merchantsApi";

export const merchantsApi = createApi({
  reducerPath: MERCHANTS_API_REDUCER_KEY,
  baseQuery: apiBaseQuery,
  tagTypes: ["Merchants"],
  endpoints: (builder) => ({
    listMerchants: builder.query({
      query: (params) => ({ url: "api/merchants/", params }),
      providesTags: [{ type: "Merchants", id: "ALL" }],
    }),
    getMerchant: builder.query({
      query: (id) => ({ url: `api/merchants/${id}/` }),
      providesTags: (result, error, id) => [{ type: "Merchants", id }],
    }),
    createMerchant: builder.mutation({
      query: (body) => ({ url: "api/merchants/", method: "POST", body }),
      invalidatesTags: [{ type: "Merchants", id: "ALL" }],
    }),
    updateMerchant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/merchants/${id}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Merchants", id },
        { type: "Merchants", id: "ALL" },
      ],
    }),
    patchMerchant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/merchants/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Merchants", id },
        { type: "Merchants", id: "ALL" },
      ],
    }),
    deleteMerchant: builder.mutation({
      query: (id) => ({ url: `api/merchants/${id}/`, method: "DELETE" }),
      invalidatesTags: [{ type: "Merchants", id: "ALL" }],
    }),
    assignPlan: builder.mutation({
      query: ({ id, plan_id }) => ({
        url: `api/merchants/${id}/assign-plan/`,
        method: "POST",
        body: { plan_id },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Merchants", id },
        { type: "Merchants", id: "ALL" },
      ],
    }),
    toggleActive: builder.mutation({
      query: (id) => ({
        url: `api/merchants/${id}/toggle_active/`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Merchants", id },
        { type: "Merchants", id: "ALL" },
      ],
    }),
    toggleModule: builder.mutation({
      query: ({ id, module_id }) => ({
        url: `api/merchants/${id}/toggle-module/`,
        method: "POST",
        body: { module_id },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Merchants", id }],
    }),
  }),
});

export const {
  useListMerchantsQuery,
  useGetMerchantQuery,
  useCreateMerchantMutation,
  useUpdateMerchantMutation,
  usePatchMerchantMutation,
  useDeleteMerchantMutation,
  useAssignPlanMutation,
  useToggleActiveMutation,
  useToggleModuleMutation,
} = merchantsApi;
