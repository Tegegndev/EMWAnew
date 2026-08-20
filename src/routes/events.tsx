import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/events")({
  beforeLoad: () => {
    throw redirect({ to: "/updates", hash: "events", replace: true });
  },
});
