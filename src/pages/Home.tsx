import { Link } from "@tanstack/react-router";
import { getItems } from "@yzzo/api/tauriApi";
import { useClipboardEventWatcher } from "@yzzo/hooks/clipboardWatcher";
import { Item } from "@yzzo/models/Item";
import { PADDING_X, PADDING_Y } from "@yzzo/styles/constants";
import { useEffect, useState } from "react";

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
    <div className={`flex flex-col h-screen ${PADDING_X} ${PADDING_Y}`}>
      <nav className="flex flex-row items-center justify-between h-12 pb-8">
        <Link to="/" className="h-10">
          <img src="logo.svg" alt="Logo" className="h-full w-auto" />
        </Link>
        <div className="flex flex-row gap-4 items-start">
          <Link to="/settings">S</Link>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2 w-full">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="py-3 rounded shadow w-full wrap-break-word font-light"
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
