import { Window } from "happy-dom";
import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

const window = new Window();
const document = window.document;

global.document = document as any;
global.window = window as any;
global.navigator = window.navigator as any;

afterEach(() => {
  cleanup();
});
