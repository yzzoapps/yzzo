import { test, expect, describe, beforeEach, mock, spyOn } from "bun:test";
import { waitFor, within, fireEvent } from "@testing-library/react";
import { render } from "@yzzo/test/utils/test-utils";
import { setupI18nMock, hasTranslationKey } from "@yzzo/test/utils/i18n-mock";
import Settings from "@yzzo/pages/settings";
import * as tauriApi from "@yzzo/api/tauriApi";

mock.module("@yzzo/components", () => ({
  Header: ({ title, previousRoute, type = "secondary" }: any) => (
    <header data-testid="header" data-type={type}>
      <h1>{title}</h1>
      <a href={previousRoute} data-testid="back-link">
        Back
      </a>
    </header>
  ),
  SettingsItem: ({ name, route }: any) => (
    <a href={route} data-testid="settings-item">
      {name}
    </a>
  ),
}));

mock.module("@yzzo/api/tauriApi", () => ({
  clearAllItems: mock(() => Promise.resolve()),
}));

mock.module("@tauri-apps/api/app", () => ({
  getVersion: mock(() => Promise.resolve("1.0.0")),
}));

const mockAsk = mock(() => Promise.resolve(true));
const mockExit = mock(() => Promise.resolve());

mock.module("@tauri-apps/plugin-dialog", () => ({
  ask: mockAsk,
}));

mock.module("@tauri-apps/plugin-process", () => ({
  exit: mockExit,
}));

describe("Home page", () => {
  describe("Structure", () => {
    beforeEach(() => {
      setupI18nMock("en");
    });

    test("should render header", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const header = within(container).getByTestId("header");
        expect(header).toBeInTheDocument();
        expect(header).toHaveAttribute("data-type", "secondary");
      });
    });

    test("should render items list", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const list = within(container).getByRole("list");
        expect(list).toBeInTheDocument();
      });
    });
  });

  describe("Translation keys", () => {
    const keysToCheck = [
      "common.settings.title",
      "common.settings.hotkeys",
      "common.settings.preferences",
      "common.settings.privacy",
      "common.settings.about",
      "common.settings.clearHistory.label",
      "common.settings.clearHistory.dialog",
      "common.settings.clearHistory.dialog.title",
      "common.settings.clearHistory.dialog.description",
      "common.settings.clearHistory.dialog.okLabel",
      "common.settings.clearHistory.dialog.cancelLabel",
      "common.settings.quit.label",
      "common.settings.quit.dialog",
      "common.settings.quit.dialog.title",
      "common.settings.quit.dialog.description",
      "common.settings.quit.dialog.okLabel",
      "common.settings.quit.dialog.cancelLabel",
      "common.notifications.firstLaunch",
    ];

    describe("common", () => {
      test("all Settings page keys should exist in English", () => {
        keysToCheck.forEach((key) => {
          expect(hasTranslationKey(key, "en")).toBe(true);
        });
      });

      test("all Settings page keys should exist in Portuguese", () => {
        keysToCheck.forEach((key) => {
          expect(hasTranslationKey(key, "pt")).toBe(true);
        });
      });
    });
  });

  describe("Content (English)", () => {
    test("should render all settings items", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        expect(within(container).getByText("Hotkeys")).toBeInTheDocument();
        expect(within(container).getByText("Preferences")).toBeInTheDocument();
        expect(within(container).getByText("Privacy")).toBeInTheDocument();
        expect(within(container).getByText("About")).toBeInTheDocument();
      });
    });

    test("should render clear history button", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Clear clipboard history",
        );
        expect(clearButton).toBeInTheDocument();
        expect(clearButton.tagName).toBe("BUTTON");
      });
    });

    test("should render quit button", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText("Quit");
        expect(clearButton).toBeInTheDocument();
        expect(clearButton.tagName).toBe("BUTTON");
      });
    });

    test("should render header with the correct previousRoute", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const backLink = within(container).getByTestId("back-link");
        expect(backLink).toHaveAttribute("href", "/");
      });
    });

    test("should render hotkeys item with the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("Hotkeys");
        expect(hotkeysItem).toHaveAttribute("href", "/settings/hotkeys");
      });
    });

    test("should render preferences item with the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const preferencesItem = within(container).getByText("Preferences");
        expect(preferencesItem).toHaveAttribute(
          "href",
          "/settings/preferences",
        );
      });
    });

    test("should render privacy item with correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("Privacy");
        expect(hotkeysItem).toHaveAttribute("href", "/settings/privacy");
      });
    });

    test("should render about item with the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("About");
        expect(hotkeysItem).toHaveAttribute("href", "/settings/about");
      });
    });
  });

  describe("Content (Portuguese)", () => {
    beforeEach(() => {
      setupI18nMock("pt");
    });

    test("should render all settings items", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        expect(within(container).getByText("Atalhos")).toBeInTheDocument();
        expect(within(container).getByText("Preferências")).toBeInTheDocument();
        expect(within(container).getByText("Privacidade")).toBeInTheDocument();
        expect(within(container).getByText("Sobre")).toBeInTheDocument();
      });
    });

    test("header should have the correct title", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const header = within(container).getByTestId("header");
        expect(header).toHaveTextContent("Configurações");
      });
    });

    test("header should have the correct previousRoute", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const backLink = within(container).getByTestId("back-link");
        expect(backLink).toHaveAttribute("href", "/");
      });
    });

    test("hotkeys item should have the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("Atalhos");
        expect(hotkeysItem).toHaveAttribute("href", "/settings/hotkeys");
      });
    });

    test("preferences item should have the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const preferencesItem = within(container).getByText("Preferências");
        expect(preferencesItem).toHaveAttribute(
          "href",
          "/settings/preferences",
        );
      });
    });

    test("privacy item should have the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("Privacidade");
        expect(hotkeysItem).toHaveAttribute("href", "/settings/privacy");
      });
    });

    test("about item should have the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("Sobre");
        expect(hotkeysItem).toHaveAttribute("href", "/settings/about");
      });
    });

    test("should render clear history button", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Limpar histórico da área de transferência",
        );
        expect(clearButton).toBeInTheDocument();
      });
    });

    test("should render quit button", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText("Sair");
        expect(clearButton).toBeInTheDocument();
        expect(clearButton.tagName).toBe("BUTTON");
      });
    });
  });

  describe("Clear history button", () => {
    beforeEach(() => {
      setupI18nMock("en");
      mockAsk.mockClear();
    });

    test("should call clearAllItems when confirmed", async () => {
      const clearAllItemsSpy = spyOn(
        tauriApi,
        "clearAllItems",
      ).mockResolvedValue(undefined);
      mockAsk.mockResolvedValue(true);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Clear clipboard history",
        );
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(mockAsk).toHaveBeenCalled();
        expect(clearAllItemsSpy).toHaveBeenCalled();
      });

      clearAllItemsSpy.mockRestore();
    });

    test("should not call clearAllItems when cancelled", async () => {
      const clearAllItemsSpy = spyOn(
        tauriApi,
        "clearAllItems",
      ).mockResolvedValue(undefined);
      mockAsk.mockResolvedValue(false);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Clear clipboard history",
        );
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(mockAsk).toHaveBeenCalled();
        expect(clearAllItemsSpy).not.toHaveBeenCalled();
      });

      clearAllItemsSpy.mockRestore();
    });

    test("should show confirmation dialog with correct message", async () => {
      mockAsk.mockResolvedValue(false);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Clear clipboard history",
        );
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(mockAsk).toHaveBeenCalledWith(
          "Are you sure you want to clear all clipboard history? This action cannot be undone.",
          {
            title: "Clear clipboard history?",
            kind: "warning",
            okLabel: "Clear history",
            cancelLabel: "Cancel",
          },
        );
      });
    });
  });

  describe("Quit Button", () => {
    beforeEach(() => {
      setupI18nMock("en");
      mockAsk.mockClear();
      mockExit.mockClear();
    });

    test("should render quit button", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const quitButton = within(container).getByText("Quit");
        expect(quitButton).toBeInTheDocument();
        expect(quitButton.tagName).toBe("BUTTON");
      });
    });

    test("should call exit when confirmed", async () => {
      mockAsk.mockResolvedValue(true);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const quitButton = within(container).getByText("Quit");
        fireEvent.click(quitButton);
      });

      await waitFor(() => {
        expect(mockAsk).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(0);
      });
    });

    test("should not call exit when cancelled", async () => {
      mockAsk.mockResolvedValue(false);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const quitButton = within(container).getByText("Quit");
        fireEvent.click(quitButton);
      });

      await waitFor(() => {
        expect(mockAsk).toHaveBeenCalled();
        expect(mockExit).not.toHaveBeenCalled();
      });
    });

    test("should show confirmation dialog with correct options", async () => {
      mockAsk.mockResolvedValue(false);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const quitButton = within(container).getByText("Quit");
        fireEvent.click(quitButton);
      });

      await waitFor(() => {
        expect(mockAsk).toHaveBeenCalledWith(
          "Are you sure you want to quit YZZO?",
          {
            title: "Quit YZZO?",
            kind: "warning",
            okLabel: "Quit",
            cancelLabel: "Go back",
          },
        );
      });
    });
  });
});
