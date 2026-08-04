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
  const { isSignedIn, isLoaded, getToken } = useAuth();

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const checkAuth = useAuthStore((state) => state.checkAuth);

  const connectSocket = useAuthStore((state) => state.connectSocket);

  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    async function authenticate() {
      if (!isLoaded) return;

      if (isSignedIn) {
        // check PostgreSQL user

        await checkAuth();

        // get Clerk JWT

        const token = await getToken();

        // connect socket

        connectSocket(token);
      } else {
        clearAuth();
      }
    }

    authenticate();
  }, [isLoaded, isSignedIn, checkAuth, clearAuth, getToken, connectSocket]);

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
