import { test, expect, describe, beforeEach, afterEach, mock } from "bun:test";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "../LanguageContext";

const mockChangeLanguage = mock(() => Promise.resolve());

mock.module("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

const TestComponent = () => {
  const { language, effectiveLanguage, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="effective-language">{effectiveLanguage}</span>
      <button data-testid="set-system" onClick={() => setLanguage("system")}>
        System
      </button>
      <button data-testid="set-en" onClick={() => setLanguage("en")}>
        English
      </button>
      <button data-testid="set-pt" onClick={() => setLanguage("pt")}>
        Portuguese
      </button>
    </div>
  );
};

const WrappedTestComponent = () => (
  <LanguageProvider>
    <TestComponent />
  </LanguageProvider>
);

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
    mockChangeLanguage.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Initial state", () => {
    test("should default to system language when no stored preference", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(getByTestId("language").textContent).toBe("system");
      });
    });

    test("should load stored language from localStorage", async () => {
      localStorage.setItem("yzzo-language", "pt");

      const { getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(getByTestId("language").textContent).toBe("pt");
        expect(getByTestId("effective-language").textContent).toBe("pt");
      });
    });

    test("should default to system if localStorage has invalid value", async () => {
      localStorage.setItem("yzzo-language", "invalid");

      const { getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(getByTestId("language").textContent).toBe("system");
      });
    });
  });

  describe("Language switching", () => {
    test("should switch to English", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-en"));

      await waitFor(() => {
        expect(getByTestId("language").textContent).toBe("en");
        expect(getByTestId("effective-language").textContent).toBe("en");
      });
    });

    test("should switch to Portuguese", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-pt"));

      await waitFor(() => {
        expect(getByTestId("language").textContent).toBe("pt");
        expect(getByTestId("effective-language").textContent).toBe("pt");
      });
    });

    test("should switch to system language", async () => {
      localStorage.setItem("yzzo-language", "en");

      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-system"));

      await waitFor(() => {
        expect(getByTestId("language").textContent).toBe("system");
      });
    });
  });

  describe("localStorage persistence", () => {
    test("should save language to localStorage when changed", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-pt"));

      await waitFor(() => {
        expect(localStorage.getItem("yzzo-language")).toBe("pt");
      });
    });

    test("should update localStorage when language changes", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-pt"));
      await waitFor(() => {
        expect(localStorage.getItem("yzzo-language")).toBe("pt");
      });

      fireEvent.click(getByTestId("set-en"));
      await waitFor(() => {
        expect(localStorage.getItem("yzzo-language")).toBe("en");
      });

      fireEvent.click(getByTestId("set-system"));
      await waitFor(() => {
        expect(localStorage.getItem("yzzo-language")).toBe("system");
      });
    });
  });

  describe("i18n integration", () => {
    test("should call changeLanguage when language changes", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-pt"));

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith("pt");
      });
    });

    test("should call changeLanguage on initial render", async () => {
      render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalled();
      });
    });
  });
});
