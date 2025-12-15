import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, expect } from "bun:test";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

GlobalRegistrator.register();

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
