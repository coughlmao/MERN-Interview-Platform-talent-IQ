import { useUser } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router";

import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  // Check if user is signed in
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null; // get rid of the flickering effect for auth state

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />}
        />
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />}
        />
      </Routes>
      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
