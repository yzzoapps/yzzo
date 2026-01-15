import { createFileRoute } from "@tanstack/react-router";
import { About } from "@yzzo/pages";

export const Route = createFileRoute("/settings_/about")({
  component: About,
});
