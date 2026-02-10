import { invoke } from "@tauri-apps/api/core";
import type { Item } from "@yzzo/models/Item";

export async function addItem(
  content: string,
  itemType?: string,
  filePath?: string,
  metadata?: string,
): Promise<void> {
  try {
    await invoke("add_item", {
      content,
      itemType,
      filePath,
      metadata,
    });
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

export async function deleteItem(id: number): Promise<void> {
  try {
    await invoke("delete_item", { id });
  } catch (err) {
    console.error("Failed to delete item:", err);
  }
}

export async function getImageBase64(filePath: string): Promise<string> {
  try {
    return await invoke("get_image_base64", { filePath });
  } catch (err) {
    console.error("Failed to get image base64:", err);
    throw err;
  }
}

export async function writeImageToClipboard(filePath: string): Promise<void> {
  try {
    await invoke("write_image_to_clipboard", { filePath });
  } catch (err) {
    console.error("Failed to write image to clipboard:", err);
    throw err;
  }
}

export async function clearAllItems(): Promise<void> {
  try {
    await invoke("clear_all_items");
  } catch (err) {
    console.error("Failed to clear all items:", err);
    throw err;
  }
}

export async function checkIsFlatpak(): Promise<boolean> {
  try {
    return await invoke("check_is_flatpak");
  } catch (err) {
    console.error("Failed to check Flatpak status:", err);
    return false;
  }
}
