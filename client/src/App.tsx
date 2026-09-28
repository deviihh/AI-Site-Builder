import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import MyProjects from "./pages/MyProjects";
import Builder from "./pages/Builder";
import Community from "./pages/Community";
import FullPreview from "./pages/FullPreview";

const App = () => {
  const { pathname } = useLocation();

  // Full-screen pages have their own layout, so the main navbar is hidden there.
  const hideNavbar =
    pathname.startsWith("/projects/") ||
    pathname.startsWith("/preview/") ||
    pathname.startsWith("/view/");

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/community" element={<Community />} />
        <Route path="/view/:projectId" element={<FullPreview mode="public" />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <MyProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preview/:projectId"
          element={
            <ProtectedRoute>
              <FullPreview mode="private" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preview/:projectId/:versionId"
          element={
            <ProtectedRoute>
              <FullPreview mode="private" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;