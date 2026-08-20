import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/news")({
  beforeLoad: () => {
    throw redirect({ to: "/updates", hash: "news", replace: true });
  },
});
