import { createFileRoute } from "@tanstack/react-router";
import { Preferences } from "@yzzo/pages";

export const Route = createFileRoute("/settings_/preferences")({
  component: Preferences,
});
