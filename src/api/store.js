import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { authApi } from "./services/auth";
import { merchantsApi } from "./services/merchants";
import { modulesApi } from "./services/modules";
import { plansApi } from "./services/plans";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [plansApi.reducerPath]: plansApi.reducer,
    [merchantsApi.reducerPath]: merchantsApi.reducer,
    [modulesApi.reducerPath]: modulesApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      plansApi.middleware,
      merchantsApi.middleware,
      modulesApi.middleware,
    ),
});

setupListeners(store.dispatch);
