import { getItems } from "@yzzo/api/tauriApi";
import { Header, HighlightedText } from "@yzzo/components";
import { useClipboardEventWatcher } from "@yzzo/hooks/useClipboardWatcher";
import { Item } from "@yzzo/models/Item";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";
import { useEffect, useState, useRef } from "react";

const Home = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const clipboardText = useClipboardEventWatcher();

  // global keydown listener - focus input when user starts typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ignore if modifier keys are pressed (Ctrl, Alt, Cmd)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // ignore special keys
      if (e.key.length > 1 && e.key !== "Backspace") return;

      // focus the search input if not already focused
      if (document.activeElement !== searchInputRef.current) {
        e.preventDefault(); // prevent the character from being typed into the input
        searchInputRef.current?.focus();

        // if it's a regular character, append to search
        if (e.key.length === 1) {
          setSearchQuery((prev) => prev + e.key);
        } else if (e.key === "Backspace") {
          setSearchQuery((prev) => prev.slice(0, -1));
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const filteredItems = items.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      <div className={`px-4 py-2 ${BORDER_BOTTOM}`}>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type to search..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="w-full">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <li
                key={idx}
                className={`py-3 px-4 w-full wrap-break-word text-sm text-neutral-black ${BORDER_BOTTOM}`}
              >
                <HighlightedText text={item.content} query={searchQuery} />
              </li>
            ))
          ) : (
            <li className="py-8 px-4 text-center text-sm text-gray-500">
              {searchQuery ? "No results found" : "No items yet"}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Home;
