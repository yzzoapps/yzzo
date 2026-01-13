import { test, expect, describe, beforeEach, mock } from "bun:test";
import { waitFor, within, fireEvent } from "@testing-library/react";
import { render } from "@yzzo/test/utils/test-utils";
import { setupI18nMock, hasTranslationKey } from "@yzzo/test/utils/i18n-mock";
import Preferences from "../Preferences";

const mockSetTheme = mock(() => {});
let mockTheme = "light";

mock.module("@yzzo/contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockTheme,
    effectiveTheme: mockTheme === "auto" ? "light" : mockTheme,
    setTheme: mockSetTheme,
  }),
}));

mock.module("@yzzo/components", () => ({
  Header: ({ title, previousRoute }: any) => (
    <header data-testid="header">
      <h1>{title}</h1>
      <a href={previousRoute} data-testid="back-link">
        Back
      </a>
    </header>
  ),
  Label: ({ label }: any) => <label data-testid="label">{label}</label>,
}));

describe("Preferences page", () => {
  beforeEach(() => {
    setupI18nMock("en");
    mockTheme = "light";
    mockSetTheme.mockClear();
  });

  describe("Structure", () => {
    test("should render header with correct title", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const header = within(container).getByTestId("header");
        expect(header).toBeInTheDocument();
        expect(header).toHaveTextContent("Preferences");
      });
    });

    test("should render header with correct back route", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const backLink = within(container).getByTestId("back-link");
        expect(backLink).toHaveAttribute("href", "/settings");
      });
    });

    test("should render theme label", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const label = within(container).getByTestId("label");
        expect(label).toHaveTextContent("Theme");
      });
    });

    test("should render all theme options", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        expect(within(container).getByText("Light")).toBeInTheDocument();
        expect(within(container).getByText("Dark")).toBeInTheDocument();
        expect(
          within(container).getByText("Automatic (system)"),
        ).toBeInTheDocument();
      });
    });

    test("should render radio buttons for each option", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const radios = within(container).getAllByRole("radio");
        expect(radios).toHaveLength(3);
      });
    });
  });

  describe("Theme selection", () => {
    test("should have light theme selected by default", async () => {
      mockTheme = "light";
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const radios = within(container).getAllByRole("radio") as HTMLInputElement[];
        expect(radios[0].checked).toBe(true); // Light
        expect(radios[1].checked).toBe(false); // Dark
        expect(radios[2].checked).toBe(false); // Auto
      });
    });

    test("should show dark theme as selected when theme is dark", async () => {
      mockTheme = "dark";
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const radios = within(container).getAllByRole("radio") as HTMLInputElement[];
        expect(radios[0].checked).toBe(false); // Light
        expect(radios[1].checked).toBe(true); // Dark
        expect(radios[2].checked).toBe(false); // Auto
      });
    });

    test("should show auto theme as selected when theme is auto", async () => {
      mockTheme = "auto";
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const radios = within(container).getAllByRole("radio") as HTMLInputElement[];
        expect(radios[0].checked).toBe(false); // Light
        expect(radios[1].checked).toBe(false); // Dark
        expect(radios[2].checked).toBe(true); // Auto
      });
    });

    test("should call setTheme with 'dark' when dark option clicked", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const darkRadio = within(container).getAllByRole("radio")[1];
        fireEvent.click(darkRadio);
      });

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    test("should call setTheme with 'light' when light option clicked", async () => {
      mockTheme = "dark";
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const lightRadio = within(container).getAllByRole("radio")[0];
        fireEvent.click(lightRadio);
      });

      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    test("should call setTheme with 'auto' when auto option clicked", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const autoRadio = within(container).getAllByRole("radio")[2];
        fireEvent.click(autoRadio);
      });

      expect(mockSetTheme).toHaveBeenCalledWith("auto");
    });
  });

  describe("Translation keys", () => {
    test("all Preferences page keys should exist in English", () => {
      const keysToCheck = [
        "components.settings.preferences.theme",
        "components.settings.preferences.themeLight",
        "components.settings.preferences.themeDark",
        "components.settings.preferences.themeAuto",
      ];

      keysToCheck.forEach((key) => {
        expect(hasTranslationKey(key, "en")).toBe(true);
      });
    });

    test("all Preferences page keys should exist in Portuguese", () => {
      const keysToCheck = [
        "components.settings.preferences.theme",
        "components.settings.preferences.themeLight",
        "components.settings.preferences.themeDark",
        "components.settings.preferences.themeAuto",
      ];

      keysToCheck.forEach((key) => {
        expect(hasTranslationKey(key, "pt")).toBe(true);
      });
    });
  });

  describe("Content (Portuguese)", () => {
    beforeEach(() => {
      setupI18nMock("pt");
    });

    test("should render theme options in Portuguese", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        expect(within(container).getByText("Claro")).toBeInTheDocument();
        expect(within(container).getByText("Escuro")).toBeInTheDocument();
        expect(
          within(container).getByText("Automático (sistema)"),
        ).toBeInTheDocument();
      });
    });

    test("should render theme label in Portuguese", async () => {
      const { container } = render(<Preferences />);

      await waitFor(() => {
        const label = within(container).getByTestId("label");
        expect(label).toHaveTextContent("Tema");
      });
    });
  });
});
