import { Outlet } from "@tanstack/react-router";
import "@yzzo/styles/App.css";

const Root = () => {
  return (
    <div className="font-ubuntu flex flex-col bg-[#F5F5F5] h-screen w-full">
      <Outlet />
    </div>
  );
};

export default Root;
