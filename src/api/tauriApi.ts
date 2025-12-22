import { invoke } from "@tauri-apps/api/core";
import type { Item } from "@yzzo/models/Item";

export async function addItem(content: string): Promise<void> {
  try {
    await invoke("add_item", { content });
  } catch (err) {
    console.error("Failed to add item:", err);
  }
}

export async function getItems(): Promise<Item[]> {
  try {
    return (await invoke("get_items")) as Item[];
  } catch (err) {
    console.error("Failed to get items:", err);
    return [];
  }
}

export async function bumpItem(id: number): Promise<void> {
  try {
    await invoke("bump_item", { id });
  } catch (err) {
    console.error("Failed to bump item:", err);
  }
}
