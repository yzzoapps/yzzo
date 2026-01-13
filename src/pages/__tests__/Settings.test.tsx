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
    describe("common", () => {
      test("all Settings page keys should exist in English", () => {
        const keysToCheck = [
          "common.settings.title",
          "common.settings.hotkeys",
          "common.settings.preferences",
          "common.settings.privacy",
          "common.settings.about",
          "common.settings.clearHistory",
          "common.settings.clearHistoryConfirm",
        ];

        keysToCheck.forEach((key) => {
          expect(hasTranslationKey(key, "en")).toBe(true);
        });
      });

      test("all Settings page keys should exist in Portuguese", () => {
        const keysToCheck = [
          "common.settings.title",
          "common.settings.hotkeys",
          "common.settings.preferences",
          "common.settings.privacy",
          "common.settings.about",
          "common.settings.clearHistory",
          "common.settings.clearHistoryConfirm",
        ];

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
        expect(hotkeysItem).toHaveAttribute("href", "/");
      });
    });

    test("should render about item with the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("About");
        expect(hotkeysItem).toHaveAttribute("href", "/");
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
        expect(hotkeysItem).toHaveAttribute("href", "/");
      });
    });

    test("about item should have the correct route", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const hotkeysItem = within(container).getByText("Sobre");
        expect(hotkeysItem).toHaveAttribute("href", "/");
      });
    });

    test("should render clear history button in Portuguese", async () => {
      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText("Limpar histórico");
        expect(clearButton).toBeInTheDocument();
      });
    });
  });

  describe("Clear History Button", () => {
    beforeEach(() => {
      setupI18nMock("en");
    });

    test("should call clearAllItems when confirmed", async () => {
      const clearAllItemsSpy = spyOn(
        tauriApi,
        "clearAllItems",
      ).mockResolvedValue(undefined);
      const confirmSpy = spyOn(window, "confirm").mockReturnValue(true);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Clear clipboard history",
        );
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(clearAllItemsSpy).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
      clearAllItemsSpy.mockRestore();
    });

    test("should not call clearAllItems when cancelled", async () => {
      const clearAllItemsSpy = spyOn(
        tauriApi,
        "clearAllItems",
      ).mockResolvedValue(undefined);
      const confirmSpy = spyOn(window, "confirm").mockReturnValue(false);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Clear clipboard history",
        );
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(clearAllItemsSpy).not.toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
      clearAllItemsSpy.mockRestore();
    });

    test("should show confirmation dialog with correct message", async () => {
      const confirmSpy = spyOn(window, "confirm").mockReturnValue(false);

      const { container } = render(<Settings />);

      await waitFor(() => {
        const clearButton = within(container).getByText(
          "Clear clipboard history",
        );
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith(
          "Are you sure you want to clear all clipboard history? This action cannot be undone.",
        );
      });

      confirmSpy.mockRestore();
    });
  });
});
