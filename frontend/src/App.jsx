import { useAuth } from "@clerk/react";
import { useAuthStore } from "./store/useAuthStore";

import { WallpaperProvider } from "./context/WallpaperContext";
import { ThemeProvider } from "./context/ThemeContext";

import { Navigate, Route, Routes } from "react-router";

import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";

import PageLoader from "./components/PageLoader";

import { useEffect } from "react";

import { Toaster } from "react-hot-toast";

function App() {
  console.log("APP RENDER");

  const { isSignedIn, isLoaded, getToken } = useAuth();

  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    console.log("APP EFFECT RUN");

    async function authenticate() {
      const checkAuth = useAuthStore.getState().checkAuth;
      const clearAuth = useAuthStore.getState().clearAuth;
      const connectSocket = useAuthStore.getState().connectSocket;

      if (isSignedIn) {
        const user = await checkAuth();

        if (user) {
          const token = await getToken();

          connectSocket(user, token);
        }
      } else {
        clearAuth();
      }
    }

    authenticate();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route
            path="/"
            element={
              isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />
            }
          />

          <Route
            path="/auth"
            element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />}
          />
        </Routes>

        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
