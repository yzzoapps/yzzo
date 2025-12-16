// import { test, expect, describe, beforeEach, mock } from "bun:test";
// import { screen, waitFor } from "@testing-library/react";
// import { render } from "./utils/test-utils";
// import { setupI18nMock } from "./utils/i18n-mock";
// import Settings from "../src/pages/Settings";

// mock.module("@yzzo/components", () => ({
//   Header: ({ title }: any) => <h1>{title}</h1>,
//   SettingsItem: ({ name }: any) => <div>{name}</div>,
// }));

// describe("Settings Page - Language Switching", () => {
//   test("switches from English to Spanish", async () => {
//     const { changeLanguage } = setupI18nMock("en");

//     const { rerender } = render(<Settings />);

//     // Initially in English
//     expect(screen.getByText("Settings")).toBeInTheDocument();
//     expect(screen.getByText("Hotkeys")).toBeInTheDocument();

//     // Switch to Spanish
//     await changeLanguage("es");

//     // Re-render component
//     rerender(<Settings />);

//     // Now in Spanish
//     await waitFor(() => {
//       expect(screen.getByText("Configuración")).toBeInTheDocument();
//       expect(screen.getByText("Atajos de teclado")).toBeInTheDocument();
//     });
//   });
// });
