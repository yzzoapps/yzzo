import { createFileRoute } from "@tanstack/react-router";
import { Language } from "@yzzo/pages";

export const Route = createFileRoute("/settings_/preferences_/language")({
  component: Language,
});
