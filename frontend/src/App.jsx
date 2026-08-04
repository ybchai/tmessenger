import { useAuth } from "@clerk/react";
import { useAuthStore } from "./store/useAuthStore";

import { WallpaperProvider } from "./context/WallpaperContext";
import { ThemeProvider } from "./context/ThemeContext";

import { Navigate, Route, Routes } from "react-router";

import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";

import PageLoader from "./components/PageLoader";

import { useEffect, useRef } from "react";

import { Toaster } from "react-hot-toast";

function App() {
  console.log("APP RENDER");

  const { isSignedIn, isLoaded, getToken } = useAuth();

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const checkAuth = useAuthStore((state) => state.checkAuth);

  const connectSocket = useAuthStore((state) => state.connectSocket);

  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  // Use refs to stabilize function references
  const checkAuthRef = useRef(checkAuth);
  const clearAuthRef = useRef(clearAuth);
  const connectSocketRef = useRef(connectSocket);

  checkAuthRef.current = checkAuth;
  clearAuthRef.current = clearAuth;
  connectSocketRef.current = connectSocket;

  useEffect(() => {
    async function authenticate() {
      if (!isLoaded) return;

      console.log("APP EFFECT RUN");

      if (isSignedIn) {
        const user = await checkAuthRef.current();

        if (user) {
          const token = await getToken();

          connectSocketRef.current(user, token);
        }
      } else {
        clearAuthRef.current();
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
