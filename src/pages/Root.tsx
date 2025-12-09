import { Outlet } from "@tanstack/react-router";
import "@yzzo/styles/App.css";

const Root = () => {
  return (
    <div className="font-ubuntu flex flex-col bg-primary text-neutral-white h-screen w-full">
      <Outlet />
    </div>
  );
};

export default Root;
