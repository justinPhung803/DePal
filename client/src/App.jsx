import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import ProfilePage from "./pages/ProfilePage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import FriendProfilePage from "./pages/FriendProfilePage.jsx"

import { useAuthStore } from "./store/useAuthStore.js"
import { useEffect } from "react"
import { Toaster } from "react-hot-toast"
import EventPage from "./pages/EventPage.jsx"


function App() {

  const {checkAuth, authUser, checkingAuth}=useAuthStore()

  useEffect(() => {
    checkAuth()
  },[checkAuth]);

  if(checkingAuth) return null;

  return (
    <div className="absolute inset-0 -z-10 h-full bg-white bg-[linear-gradient(to_right, #f0f0f0_1px, transparent_1px), linear-gradient(to_bottom, #f0f0f0_1px,transparent_1px)] bg[size:6rem_4rem]">
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> :<Navigate to = {"/auth"}/> } />
        <Route path="/auth" element={!authUser ? <AuthPage /> :<Navigate to = {"/"}/> } />
        <Route path="/profile" element={authUser ? <ProfilePage /> :<Navigate to = {"/auth"}/>} />
        <Route path="/friendprofile/:id" element={authUser ? <FriendProfilePage /> : <Navigate to = {"/auth"}/>} />
        <Route path="/chat/:id" element={authUser ? <ChatPage /> :<Navigate to = {"/auth"}/>} />
        <Route path="/event" element={authUser ? <EventPage /> :<Navigate to = {"/auth"}/>} />
      </Routes>

      <Toaster/>
    </div>
  )
}

export default App
