import { Outlet, Link } from "@tanstack/react-router";
import "@yzzo/styles/App.css";

const Root = () => {
  return (
    <div className="font-ubuntu">
      <nav style={{ display: "flex", gap: 10 }}>
        <Link to="/">Home</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      <Outlet />
    </div>
  );
};

export default Root;
