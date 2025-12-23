import { getItems, bumpItem } from "@yzzo/api/tauriApi";
import { Header, HighlightedText } from "@yzzo/components";
import { useClipboardEventWatcher } from "@yzzo/hooks/useClipboardWatcher";
import { Item } from "@yzzo/models/Item";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { getCurrentWindow } from "@tauri-apps/api/window";

const Home = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const clipboardText = useClipboardEventWatcher();

  const filteredItems = items.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedIndex]);

  // global keydown listener - focus input when user starts typing
  useEffect(() => {
    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (e.key === "ArrowDown") {
            return prev === null
              ? 0
              : Math.min(prev + 1, filteredItems.length - 1);
          } else {
            return prev === null ? null : prev === 0 ? null : prev - 1;
          }
        });
        return;
      }

      if (
        e.key === "Enter" &&
        filteredItems.length > 0 &&
        selectedIndex !== null
      ) {
        e.preventDefault();
        const selectedItem = filteredItems[selectedIndex];
        if (selectedItem) {
          await bumpItem(selectedItem.id);
          await writeText(selectedItem.content);

          setSearchQuery("");
          searchInputRef.current?.blur();

          try {
            await getCurrentWindow().minimize();
          } catch (error) {
            console.error("Failed to hide window:", error);
          }
        }
        return;
      }

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
  }, [filteredItems, selectedIndex]);

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
          placeholder={t("components.home.searchPlaceholder")}
          className={`${BORDER_BOTTOM} w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-full`}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="w-full">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <li
                key={idx}
                ref={idx === selectedIndex ? selectedItemRef : null}
                className={`py-3 px-4 w-full wrap-break-word text-sm text-neutral-black ${BORDER_BOTTOM} ${
                  idx === selectedIndex ? "bg-secondary/10" : ""
                }`}
              >
                <HighlightedText text={item.content} query={searchQuery} />
              </li>
            ))
          ) : (
            <li className="py-8 px-4 text-center text-sm text-gray-500">
              {searchQuery
                ? t("components.home.noResults")
                : t("components.home.noItems")}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Home;
