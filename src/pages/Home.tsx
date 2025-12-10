import { Link } from "@tanstack/react-router";
import { getItems } from "@yzzo/api/tauriApi";
import IconButton from "@yzzo/components/IconButton";
import { useClipboardEventWatcher } from "@yzzo/hooks/clipboardWatcher";
import { Item } from "@yzzo/models/Item";
import { PADDING_X, PADDING_Y } from "@yzzo/styles/constants";
import { useEffect, useState } from "react";
import { HiCog6Tooth } from "react-icons/hi2";

const Home = () => {
  const [items, setItems] = useState<Item[]>([]);
  const clipboardText = useClipboardEventWatcher();

  useEffect(() => {
    (async () => {
      const existingItems = await getItems();
      setItems(existingItems);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const updatedItems = await getItems();
      setItems(updatedItems);
    })();
  }, [clipboardText]);

  return (
    <div className="flex flex-col h-screen">
      <nav
        className={`flex flex-row items-center justify-between h-10 pb-8 ${PADDING_X} ${PADDING_Y}`}
      >
        <Link to="/" className="h-8">
          <img src="logo.svg" alt="Logo" className="h-full w-auto" />
        </Link>
        <div className="flex flex-row gap-4 items-start">
          <Link to="/settings">
            <IconButton icon={HiCog6Tooth} onClick={() => {}} />
          </Link>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto">
        <ul className="w-full">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="py-3 px-4 w-full wrap-break-word font-light text-sm text-primary border-b-[0.5px] border-gray-400"
            >
              {item.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
