import { describe, test, expect, beforeEach, mock } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useGlobalHotkey } from "../useGlobalHotkey";
import type { InvokeArgs } from "@tauri-apps/api/core";

const mockInvoke = mock(
  <T>(_cmd: string, _args?: InvokeArgs): Promise<T> =>
    Promise.resolve(undefined as T),
);

(global.window as any).__TAURI_INTERNALS__ = {
  invoke: mockInvoke,
};

describe("useGlobalHotkey", () => {
  beforeEach(() => {
    mockInvoke.mockClear();
  });

  test("loads hotkey on mount", async () => {
    mockInvoke.mockImplementation((cmd: string): Promise<any> => {
      if (cmd === "get_hotkey") return Promise.resolve("Ctrl+A");
      if (cmd === "get_hold_behavior") return Promise.resolve(false);
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useGlobalHotkey());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hotkey).toBe("Ctrl+A");
    expect(result.current.holdBehavior).toBe(false);
  });

  test("updates hotkey", async () => {
    mockInvoke.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGlobalHotkey());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateHotkey("Cmd+B");
    });

    expect(mockInvoke).toHaveBeenLastCalledWith(
      "set_hotkey",
      {
        hotkey: "Cmd+B",
      },
      undefined,
    );
    expect(result.current.hotkey).toBe("Cmd+B");
  });

  test("updates hold behavior", async () => {
    mockInvoke.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGlobalHotkey());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateHoldBehavior(true);
    });

    expect(mockInvoke).toHaveBeenLastCalledWith(
      "set_hold_behavior",
      {
        holdBehavior: true,
      },
      undefined,
    );
    expect(result.current.holdBehavior).toBe(true);
  });

  test("handles error when loading fails", async () => {
    const originalError = console.error;
    console.error = mock(() => {});

    mockInvoke.mockRejectedValue(new Error("Database error"));

    const { result } = renderHook(() => useGlobalHotkey());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hotkey).toBe("Alt+`");
    expect(result.current.holdBehavior).toBe(false);

    expect(console.error).toHaveBeenCalledWith(
      "Failed to load hotkey settings:",
      expect.any(Error),
    );

    console.error = originalError;
  });
});
