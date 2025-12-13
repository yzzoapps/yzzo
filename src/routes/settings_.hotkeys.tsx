import { createFileRoute } from "@tanstack/react-router";
import { Hotkeys } from "@yzzo/pages";

export const Route = createFileRoute("/settings_/hotkeys")({
  component: Hotkeys,
});
