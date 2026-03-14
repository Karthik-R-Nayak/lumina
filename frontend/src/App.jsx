import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing";
import SignIn from "./pages/SignIn";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Explore from "./pages/explore";
import Postdetails from "./pages/postdetails";
import Account from "./pages/account";
import Upload from "./pages/upload";
import EditProfile from "./pages/editprofile";
import Search from "./pages/search";
import Settings from "./pages/setting";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/profile";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/post/:id" 
          element={
            <ProtectedRoute>
              <Postdetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-profile" 
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;





