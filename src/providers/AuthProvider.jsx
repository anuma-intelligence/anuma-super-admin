import { createContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Spinner from "@/components/spinner";
import {
  useGetSessionMutation,
  useLogoutMutation,
} from "@/api/services/auth";
import { setAccessToken } from "@/api/slices/authSlice";

export const AuthContext = createContext({});

// Boots the app by refreshing the session cookie against /auth/refresh/ before
// rendering any children. This mirrors merchants-app so downstream RTK Query
// hooks never fire without a token attached — the request interceptor reads
// state.auth.accessToken, and children can only mount once that's in place
// (or the refresh has failed and we know the user is signed out).
const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const sessionCheckRef = useRef(false);
  const authState = useSelector((s) => s?.auth);

  const [
    getSession,
    { data: sessionData, isLoading, isFetching, isError, isUninitialized },
  ] = useGetSessionMutation();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // ignore — clearing local token is what signs the user out either way
    }
    dispatch(setAccessToken(null));
    await getSession();
  };

  useEffect(() => {
    if (sessionCheckRef.current) return;
    if (authState?.accessToken) return;
    sessionCheckRef.current = true;
    getSession()
      .unwrap()
      .catch(() => {
        dispatch(setAccessToken(null));
      });
  }, [authState?.accessToken, dispatch, getSession]);

  useEffect(() => {
    const token = sessionData?.access || sessionData?.access_token || sessionData?.token;
    if (token) dispatch(setAccessToken(token));
  }, [sessionData, dispatch]);

  const isAuthenticated = Boolean(authState?.accessToken) || !isError;
  const notInitialized = isLoading || isFetching;

  return (
    <AuthContext.Provider
      value={{
        authState,
        isAuthenticated,
        notInitialized,
        handleLogout,
      }}
    >
      {isLoading || isFetching || isUninitialized ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
