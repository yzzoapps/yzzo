import { describe, test, expect, beforeEach, mock } from "bun:test";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useClipboardEventWatcher } from "../clipboardWatcher";

type EventCallback = (event: { payload: string }) => void;

let eventListeners: Map<string, EventCallback> = new Map();
const mockUnlisten = mock(() => {});

const mockListen = mock(
  (eventName: string, callback: EventCallback): Promise<() => void> => {
    eventListeners.set(eventName, callback);
    return Promise.resolve(mockUnlisten);
  },
);

const mockAddItem = mock((_content: string): Promise<void> => {
  return Promise.resolve();
});

mock.module("@tauri-apps/api/event", () => ({
  listen: mockListen,
}));

mock.module("@yzzo/api/tauriApi", () => ({
  addItem: mockAddItem,
}));

describe("useClipboardEventWatcher", () => {
  beforeEach(() => {
    mockListen.mockClear();
    mockUnlisten.mockClear();
    mockAddItem.mockClear();
    eventListeners.clear();
  });

  test("should return empty string initially", () => {
    const { result } = renderHook(() => useClipboardEventWatcher());

    expect(result.current).toBe("");
  });

  test("should register clipboard-changed event listener on mount", async () => {
    renderHook(() => useClipboardEventWatcher());

    await waitFor(() => {
      expect(mockListen).toHaveBeenCalledWith(
        "clipboard-changed",
        expect.any(Function),
      );
    });
  });

  test("should update clipboard text when event is received", async () => {
    const { result } = renderHook(() => useClipboardEventWatcher());

    await waitFor(() => {
      expect(eventListeners.has("clipboard-changed")).toBe(true);
    });

    const callback = eventListeners.get("clipboard-changed")!;

    await act(async () => {
      callback({ payload: "copied text" });
    });

    expect(result.current).toBe("copied text");
  });

  test("should call addItem when clipboard event is received", async () => {
    renderHook(() => useClipboardEventWatcher());

    await waitFor(() => {
      expect(eventListeners.has("clipboard-changed")).toBe(true);
    });

    const callback = eventListeners.get("clipboard-changed")!;

    await act(async () => {
      callback({ payload: "new clipboard content" });
    });

    expect(mockAddItem).toHaveBeenCalledWith("new clipboard content");
  });

  test("should cleanup listener on unmount", async () => {
    const { unmount } = renderHook(() => useClipboardEventWatcher());

    await waitFor(() => {
      expect(mockListen).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockUnlisten).toHaveBeenCalled();
    });
  });

  test("should handle multiple clipboard changes", async () => {
    const { result } = renderHook(() => useClipboardEventWatcher());

    await waitFor(() => {
      expect(eventListeners.has("clipboard-changed")).toBe(true);
    });

    const callback = eventListeners.get("clipboard-changed")!;

    await act(async () => {
      callback({ payload: "first copy" });
    });

    expect(result.current).toBe("first copy");
    expect(mockAddItem).toHaveBeenCalledWith("first copy");

    await act(async () => {
      callback({ payload: "second copy" });
    });

    expect(result.current).toBe("second copy");
    expect(mockAddItem).toHaveBeenCalledWith("second copy");
    expect(mockAddItem).toHaveBeenCalledTimes(2);
  });
});
