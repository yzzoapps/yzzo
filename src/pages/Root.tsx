import { Outlet } from "@tanstack/react-router";
import "@yzzo/styles/App.css";

const Root = () => {
  return (
    <div className="font-mona bg-neutral-white text-neutral-black flex flex-col h-screen w-full">
      <Outlet />
    </div>
  );
};

export default Root;
