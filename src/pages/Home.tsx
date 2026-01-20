import { getItems, bumpItem, writeImageToClipboard } from "@yzzo/api/tauriApi";
import { Header, HighlightedText, Input } from "@yzzo/components";
import ImagePreview from "@yzzo/components/home/ImagePreview";
import { Item } from "@yzzo/models/Item";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

const isMacOS = navigator.platform.toLowerCase().includes("mac");

const hideWindow = async () => {
  const window = getCurrentWindow();
  if (isMacOS) {
    await window.hide();
  } else {
    await window.minimize();
  }
};

const Home = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const filteredItems = items.filter((item) => {
    if (searchQuery === "") {
      return true; // show all items when no search query
    }

    // Search both text and image items by their content (filename for images)
    return item.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({
      behavior: "instant",
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

          if (selectedItem.item_type === "image" && selectedItem.file_path) {
            await writeImageToClipboard(selectedItem.file_path);
          } else {
            await writeText(selectedItem.content);
          }

          setSearchQuery("");
          searchInputRef.current?.blur();

          try {
            await hideWindow();
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
      setHasLoaded(true);
    })();
  }, []);

  // listen for clipboard changes to refresh items list
  useEffect(() => {
    const unlisten = listen("clipboard-changed", () => {
      setRefreshTrigger((prev) => prev + 1);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  // refresh items when clipboard changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      (async () => {
        const updatedItems = await getItems();
        setItems(updatedItems);
      })();
    }
  }, [refreshTrigger]);

  return (
    <div className="flex flex-col h-screen">
      <Header type="primary" />
      <div className={`px-4 py-2 ${BORDER_BOTTOM}`}>
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("components.home.searchPlaceholder")}
          rounded="rounded-full"
        />
      </div>
      <div
        className={`h-1 w-full overflow-hidden relative ${!hasLoaded ? "bg-gray-200 dark:bg-gray-700" : "bg-transparent"}`}
      >
        {!hasLoaded && (
          <div
            className="h-full bg-secondary absolute inset-0"
            style={{
              animation: "progressPulse 1.5s ease-in-out infinite",
            }}
          ></div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="w-full">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <li
                key={idx}
                ref={idx === selectedIndex ? selectedItemRef : null}
                onClick={() => setSelectedIndex(idx)}
                onDoubleClick={async () => {
                  await bumpItem(item.id);

                  if (item.item_type === "image" && item.file_path) {
                    await writeImageToClipboard(item.file_path);
                  } else {
                    await writeText(item.content);
                  }

                  setSearchQuery("");
                  searchInputRef.current?.blur();

                  try {
                    await hideWindow();
                  } catch (error) {
                    console.error("Failed to hide window:", error);
                  }
                }}
                className={`py-3 px-4 w-full wrap-break-word text-sm text-neutral-black dark:text-neutral-white ${BORDER_BOTTOM} ${
                  idx === selectedIndex
                    ? "bg-secondary/10 dark:bg-secondary/5"
                    : ""
                } cursor-pointer`}
              >
                {item.item_type === "image" && item.file_path ? (
                  <div className="flex items-center gap-3">
                    <ImagePreview filePath={item.file_path} />
                    <span
                      className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <HighlightedText
                        text={item.content}
                        query={searchQuery}
                      />
                    </span>
                  </div>
                ) : (
                  <div className="line-clamp-10">
                    <HighlightedText text={item.content} query={searchQuery} />
                  </div>
                )}
              </li>
            ))
          ) : hasLoaded ? (
            <li className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? t("components.home.noResults")
                : t("components.home.noItems")}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};

export default Home;
