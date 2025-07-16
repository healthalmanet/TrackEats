import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path

const Layout = () => {
  const { user } = useAuth();

  if (!user || user.role !== "user") {
    return <Navigate to="/" />; // or to "/dashboard-nutritionist" etc.
  }

  return (
    // Set the theme's primary font for the entire layout
    <div className="flex flex-col min-h-screen font-['Poppins']">
      <Navbar />
      {/* Replaced bg-gray-50 with the theme's 'bg-main' class */}
      <main className="flex-grow p-4 bg-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;