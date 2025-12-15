import { getItems } from "@yzzo/api/tauriApi";
import { Header } from "@yzzo/components";
import { useClipboardEventWatcher } from "@yzzo/hooks/useClipboardWatcher";
import { Item } from "@yzzo/models/Item";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";
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
    <div className="flex flex-col h-screen">
      <Header type="primary" />
      <div className="flex-1 overflow-y-auto">
        <ul className="w-full">
          {items.map((item, idx) => (
            <li
              key={idx}
              className={`py-3 px-4 w-full wrap-break-word text-sm text-neutral-black ${BORDER_BOTTOM}`}
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
