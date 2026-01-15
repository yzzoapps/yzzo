import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@yzzo/pages";

export const Route = createFileRoute("/settings_/privacy")({
  component: Privacy,
});
