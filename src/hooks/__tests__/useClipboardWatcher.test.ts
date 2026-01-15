import { describe, test, expect, beforeEach, mock } from "bun:test";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useClipboardEventWatcher } from "../useClipboardWatcher";

interface ClipboardEvent {
  type: string;
  content: string;
  file_path?: string;
  metadata?: string;
}

type EventCallback = (event: { payload: ClipboardEvent }) => void;

let eventListeners: Map<string, EventCallback> = new Map();
const mockUnlisten = mock(() => {});

const mockListen = mock(
  (eventName: string, callback: EventCallback): Promise<() => void> => {
    eventListeners.set(eventName, callback);
    return Promise.resolve(mockUnlisten);
  },
);

const mockAddItem = mock(
  (
    _content: string,
    _type?: string,
    _filePath?: string,
    _metadata?: string,
  ): Promise<void> => {
    return Promise.resolve();
  },
);

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

  describe("text clipboard events", () => {
    test("should update clipboard text when text event is received", async () => {
      const { result } = renderHook(() => useClipboardEventWatcher());

      await waitFor(() => {
        expect(eventListeners.has("clipboard-changed")).toBe(true);
      });

      const callback = eventListeners.get("clipboard-changed")!;

      await act(async () => {
        callback({ payload: { type: "text", content: "copied text" } });
      });

      expect(result.current).toBe("copied text");
    });

    test("should call addItem with text type when text event is received", async () => {
      renderHook(() => useClipboardEventWatcher());

      await waitFor(() => {
        expect(eventListeners.has("clipboard-changed")).toBe(true);
      });

      const callback = eventListeners.get("clipboard-changed")!;

      await act(async () => {
        callback({ payload: { type: "text", content: "new clipboard content" } });
      });

      expect(mockAddItem).toHaveBeenCalledWith("new clipboard content", "text");
    });
  });

  describe("image clipboard events", () => {
    test("should update clipboard text with image prefix when image event is received", async () => {
      const { result } = renderHook(() => useClipboardEventWatcher());

      await waitFor(() => {
        expect(eventListeners.has("clipboard-changed")).toBe(true);
      });

      const callback = eventListeners.get("clipboard-changed")!;

      await act(async () => {
        callback({
          payload: {
            type: "image",
            content: "image-hash-123",
            file_path: "/path/to/image.png",
            metadata: '{"width":100,"height":100}',
          },
        });
      });

      expect(result.current).toBe("image:image-hash-123");
    });

    test("should call addItem with image type and metadata when image event is received", async () => {
      renderHook(() => useClipboardEventWatcher());

      await waitFor(() => {
        expect(eventListeners.has("clipboard-changed")).toBe(true);
      });

      const callback = eventListeners.get("clipboard-changed")!;

      await act(async () => {
        callback({
          payload: {
            type: "image",
            content: "image-hash-456",
            file_path: "/path/to/screenshot.png",
            metadata: '{"width":800,"height":600}',
          },
        });
      });

      expect(mockAddItem).toHaveBeenCalledWith(
        "image-hash-456",
        "image",
        "/path/to/screenshot.png",
        '{"width":800,"height":600}',
      );
    });
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
      callback({ payload: { type: "text", content: "first copy" } });
    });

    expect(result.current).toBe("first copy");
    expect(mockAddItem).toHaveBeenCalledWith("first copy", "text");

    await act(async () => {
      callback({ payload: { type: "text", content: "second copy" } });
    });

    expect(result.current).toBe("second copy");
    expect(mockAddItem).toHaveBeenCalledWith("second copy", "text");
    expect(mockAddItem).toHaveBeenCalledTimes(2);
  });

  test("should handle mixed text and image events", async () => {
    const { result } = renderHook(() => useClipboardEventWatcher());

    await waitFor(() => {
      expect(eventListeners.has("clipboard-changed")).toBe(true);
    });

    const callback = eventListeners.get("clipboard-changed")!;

    await act(async () => {
      callback({ payload: { type: "text", content: "some text" } });
    });

    expect(result.current).toBe("some text");

    await act(async () => {
      callback({
        payload: {
          type: "image",
          content: "img-hash",
          file_path: "/tmp/img.png",
        },
      });
    });

    expect(result.current).toBe("image:img-hash");
    expect(mockAddItem).toHaveBeenCalledTimes(2);
  });
});
