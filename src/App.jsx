import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";

import { Toaster } from "@/components/ui/sonner";
import { store } from "@/api/store";
import AuthProvider from "@/providers/AuthProvider";
import Router from "@/router";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <Router />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}
