import { createApi } from "@reduxjs/toolkit/query/react";

import apiBaseQuery from "./axiosBaseQuery";

export const MODULES_API_REDUCER_KEY = "modulesApi";

// Platform-level module registry — endpoints live under
// /api/merchants/modules/. Per-merchant enable/disable is handled by
// merchants.toggleModule (POST /api/merchants/{id}/toggle-module/).
export const modulesApi = createApi({
  reducerPath: MODULES_API_REDUCER_KEY,
  baseQuery: apiBaseQuery,
  tagTypes: ["Modules"],
  endpoints: (builder) => ({
    listModules: builder.query({
      query: (params) => ({ url: "api/merchants/modules/", params }),
      providesTags: [{ type: "Modules", id: "ALL" }],
    }),
    getModule: builder.query({
      query: (id) => ({ url: `api/merchants/modules/${id}/` }),
      providesTags: (result, error, id) => [{ type: "Modules", id }],
    }),
    createModule: builder.mutation({
      query: (body) => ({ url: "api/merchants/modules/", method: "POST", body }),
      invalidatesTags: [{ type: "Modules", id: "ALL" }],
    }),
    updateModule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/merchants/modules/${id}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Modules", id },
        { type: "Modules", id: "ALL" },
      ],
    }),
    patchModule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/merchants/modules/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Modules", id },
        { type: "Modules", id: "ALL" },
      ],
    }),
    deleteModule: builder.mutation({
      query: (id) => ({ url: `api/merchants/modules/${id}/`, method: "DELETE" }),
      invalidatesTags: [{ type: "Modules", id: "ALL" }],
    }),
    bulkEnableModules: builder.mutation({
      query: (moduleIds) => ({
        url: "api/merchants/modules/bulk_enable/",
        method: "POST",
        body: { module_ids: moduleIds },
      }),
      invalidatesTags: [{ type: "Modules", id: "ALL" }],
    }),
  }),
});

export const {
  useListModulesQuery,
  useGetModuleQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  usePatchModuleMutation,
  useDeleteModuleMutation,
  useBulkEnableModulesMutation,
} = modulesApi;
