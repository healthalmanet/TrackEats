import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path

const Layout = () => {
  const { user } = useAuth();

  if (!user || user.role !== "user") {
    return <Navigate to="/" />; // or to "/dashboard-nutritionist" etc.
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
