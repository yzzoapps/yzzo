import { Outlet, Link } from "@tanstack/react-router";
import "@yzzo/styles/App.css";

const Root = () => {
  return (
    <div className="font-ubuntu flex flex-col bg-[#00213E] h-screen w-full">
      <nav className="flex flex-row items-center justify-between h-16 px-5 pt-4">
        <Link to="/" className="h-12">
          <img src="logo.svg" alt="Logo" className="h-full w-auto" />
        </Link>
        <div className="flex flex-row gap-4 items-start text-white">
          <Link to="/settings">S</Link>
        </div>
      </nav>

      <Outlet />
    </div>
  );
};

export default Root;
