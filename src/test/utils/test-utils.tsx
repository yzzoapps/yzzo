import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

/**
 * Create a mock router for testing
 * This creates a minimal route tree that renders the test component
 */
function createMockRouter(component: ReactElement, initialPath: string = "/") {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => component,
  });

  const routeTree = rootRoute.addChildren([testRoute]);

  return createRouter({
    routeTree,
    history: memoryHistory,
    defaultPreload: false,
    defaultPreloadDelay: 0,
  });
}

interface RenderWithRouterOptions {
  initialPath?: string;
  renderOptions?: Omit<RenderOptions, "wrapper">;
}

/**
 * Custom render function with TanStack Router
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: RenderWithRouterOptions,
) {
  const { initialPath = "/", renderOptions } = options || {};

  const router = createMockRouter(ui, initialPath);

  const result = render(<RouterProvider router={router} />, renderOptions);

  return {
    ...result!,
    router: router!,
  };
}

// Re-export everything from testing library
export * from "@testing-library/react";
export { renderWithRouter as render };
