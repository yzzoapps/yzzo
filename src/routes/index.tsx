import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@yzzo/pages";

export const Route = createFileRoute("/")({
  component: Home,
});
