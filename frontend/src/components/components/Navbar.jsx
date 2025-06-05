import React from "react";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import UserProfileForm from "../../pages/dashboard/UserProfileForm";

const Navbar = () => {
  return (
    <nav>
      <div style={{ display: "flex", gap: 10 }}>
        <div>TrackEats</div>
        <div>
          <Link to="/dashboard/user-profile">Profile</Link>
          <Link to="/dashboard/explore">Explore</Link>
          <Link to="/dashboard/tools">Tools</Link>
          <Link to="/dashboard/diabetic">Health</Link>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
