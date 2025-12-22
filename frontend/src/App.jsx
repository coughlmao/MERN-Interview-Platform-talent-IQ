import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import { Routes } from "react-router";

function App() {
  return (
    <>
      <h1 className="text-red-500">Welcome to the app</h1>
      <button className="btn btn-primary">Click me</button>

      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton />
      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
