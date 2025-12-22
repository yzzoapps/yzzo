import { test, expect, describe, beforeEach, mock } from "bun:test";
import { waitFor, within } from "@testing-library/react";
import { render } from "@yzzo/test/utils/test-utils";
import { setupI18nMock, hasTranslationKey } from "@yzzo/test/utils/i18n-mock";
import Settings from "@yzzo/pages/settings";

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
        const hotkeysItem = within(container).getByText("Preferences");
        expect(hotkeysItem).toHaveAttribute("href", "/");
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
        const hotkeysItem = within(container).getByText("Preferências");
        expect(hotkeysItem).toHaveAttribute("href", "/");
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
  });
});
