import { Outlet, Link } from "@tanstack/react-router";

const Root = () => {
  return (
    <div>
      <nav style={{ display: "flex", gap: 10 }}>
        <Link to="/">Home</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      <Outlet />
    </div>
  );
};

export default Root;
