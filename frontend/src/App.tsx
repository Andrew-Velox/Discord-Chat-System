import Home from "./pages/Home";
import ServerPage from "./pages/Server";
import Explore from "./pages/Explore";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import ToggleColorMode from "./components/ToggleColorMode";
import Login from "./pages/Login";
import { AuthServiceProvider } from "./context/AuthContext";
import TestLogin from "./pages/TestLogin";
import ProtectedRoute from "./services/ProtectedRoute";
import Register from "./pages/Register";
import { MembershipProvider } from "./context/MemberContext";
import MembershipCheck from "./components/Membership/MembershipCheck";
import TokenRefresh from "./components/Auth/TokenRefresh";

const App = () => {
  return (
    <BrowserRouter>
      <AuthServiceProvider>
        <TokenRefresh />
        <MembershipProvider>
          <ToggleColorMode>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/server/:serverId/:channelId?"
                element={
                  <ProtectedRoute>
                    <MembershipCheck>
                      <ServerPage />
                    </MembershipCheck>
                  </ProtectedRoute>
                }
              />
              <Route path="/explore/:categoryName" element={<Explore />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/testlogin"
                element={
                  <ProtectedRoute>
                    <TestLogin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ToggleColorMode>
        </MembershipProvider>
      </AuthServiceProvider>
    </BrowserRouter>
  );
};

export default App;
