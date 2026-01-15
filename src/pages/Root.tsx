import { Outlet } from "@tanstack/react-router";
import "@yzzo/styles/App.css";
import { useClipboardEventWatcher } from "@yzzo/hooks";

const Root = () => {
  useClipboardEventWatcher();

  return (
    <div className="font-mona bg-white dark:bg-[#191B26] dark:bg-{} text-neutral-black dark:text-neutral-white flex flex-col h-screen w-full">
      <Outlet />
    </div>
  );
};

export default Root;
