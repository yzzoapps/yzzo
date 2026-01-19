import { Outlet } from "@tanstack/react-router";
import "@yzzo/styles/App.css";
import {
  useClipboardEventWatcher,
  useFirstLaunchNotification,
} from "@yzzo/hooks";

const Root = () => {
  useClipboardEventWatcher();
  useFirstLaunchNotification();

  return (
    <div className="font-mona pt-2 bg-white dark:bg-[#191B26] text-neutral-black dark:text-neutral-white flex flex-col h-screen w-full overflow-hidden overscroll-none">
      <Outlet />
    </div>
  );
};

export default Root;
