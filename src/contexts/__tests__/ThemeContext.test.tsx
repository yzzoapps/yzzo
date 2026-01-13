import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";

const TestComponent = () => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="effective-theme">{effectiveTheme}</span>
      <button data-testid="set-light" onClick={() => setTheme("light")}>
        Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>
        Dark
      </button>
      <button data-testid="set-auto" onClick={() => setTheme("auto")}>
        Auto
      </button>
    </div>
  );
};

const WrappedTestComponent = () => (
  <ThemeProvider>
    <TestComponent />
  </ThemeProvider>
);

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  describe("Initial state", () => {
    test("should default to light theme when no stored preference", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(getByTestId("theme").textContent).toBe("light");
        expect(getByTestId("effective-theme").textContent).toBe("light");
      });
    });

    test("should load stored theme from localStorage", async () => {
      localStorage.setItem("yzzo-theme", "dark");

      const { getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(getByTestId("theme").textContent).toBe("dark");
        expect(getByTestId("effective-theme").textContent).toBe("dark");
      });
    });

    test("should default to light if localStorage has invalid value", async () => {
      localStorage.setItem("yzzo-theme", "invalid");

      const { getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(getByTestId("theme").textContent).toBe("light");
      });
    });
  });

  describe("Theme switching", () => {
    test("should switch to dark theme", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-dark"));

      await waitFor(() => {
        expect(getByTestId("theme").textContent).toBe("dark");
        expect(getByTestId("effective-theme").textContent).toBe("dark");
      });
    });

    test("should switch to light theme", async () => {
      localStorage.setItem("yzzo-theme", "dark");

      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-light"));

      await waitFor(() => {
        expect(getByTestId("theme").textContent).toBe("light");
        expect(getByTestId("effective-theme").textContent).toBe("light");
      });
    });

    test("should switch to auto theme", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-auto"));

      await waitFor(() => {
        expect(getByTestId("theme").textContent).toBe("auto");
      });
    });
  });

  describe("localStorage persistence", () => {
    test("should save theme to localStorage when changed", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-dark"));

      await waitFor(() => {
        expect(localStorage.getItem("yzzo-theme")).toBe("dark");
      });
    });

    test("should update localStorage when theme changes", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-dark"));
      await waitFor(() => {
        expect(localStorage.getItem("yzzo-theme")).toBe("dark");
      });

      fireEvent.click(getByTestId("set-light"));
      await waitFor(() => {
        expect(localStorage.getItem("yzzo-theme")).toBe("light");
      });

      fireEvent.click(getByTestId("set-auto"));
      await waitFor(() => {
        expect(localStorage.getItem("yzzo-theme")).toBe("auto");
      });
    });
  });

  describe("DOM class management", () => {
    test("should add dark class to documentElement when dark theme", async () => {
      const { getByTestId } = render(<WrappedTestComponent />);

      fireEvent.click(getByTestId("set-dark"));

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
    });

    test("should remove dark class when switching to light theme", async () => {
      localStorage.setItem("yzzo-theme", "dark");

      const { getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });

      fireEvent.click(getByTestId("set-light"));

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(false);
      });
    });
  });
});
