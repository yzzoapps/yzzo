import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@yzzo/pages";

export const Route = createFileRoute("/settings")({
  component: Settings,
});
