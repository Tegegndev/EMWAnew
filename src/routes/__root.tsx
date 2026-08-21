import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { LanguageProvider } from "../lib/language-context";
import logoUrl from "../assets/emwa-logo-new.png?url";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center px-6 py-32">
        <div className="max-w-2xl text-center">
          <p className="label-mono text-primary">Error 404</p>
          <h1 className="font-display text-[10rem] md:text-[16rem] leading-none mt-4 tracking-tighter">
            404
          </h1>
          <h2 className="font-display text-4xl md:text-5xl mt-4">Page not found</h2>
          <p className="mt-6 text-muted-foreground max-w-md mx-auto">
            The page you're looking for has moved, been renamed, or never existed.
            Let's get you back to something useful.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="bg-foreground text-background px-6 py-3 label-mono hover:bg-primary transition-colors"
            >
              Return home
            </Link>
            <Link
              to="/experts"
              className="border border-foreground px-6 py-3 label-mono hover:bg-foreground hover:text-background transition-colors"
            >
              Experts directory
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { to: "/about", label: "About EMWA" },
              { to: "/programs", label: "Programs" },
              { to: "/updates", label: "Updates" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="border-t border-border pt-4 label-mono hover:text-primary transition-colors"
              >
                → {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="label-mono text-primary">Something broke</p>
        <h1 className="font-display text-5xl mt-4">This page didn't load</h1>
        <p className="mt-4 text-muted-foreground">
          Something went wrong on our end. Try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-foreground text-background px-6 py-3 label-mono hover:bg-primary transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-foreground px-6 py-3 label-mono hover:bg-foreground hover:text-background transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EMWA — Ethiopian Media Women Association" },
      {
        name: "description",
        content:
          "The Ethiopian Media Women Association (EMWA) empowers women in Ethiopian media through advocacy, professional development, and a nationwide network of journalists, editors, and communicators.",
      },
      { name: "author", content: "EMWA" },
      { property: "og:site_name", content: "EMWA" },
      { property: "og:title", content: "EMWA — Ethiopian Media Women Association" },
      {
        property: "og:description",
        content:
          "The Ethiopian Media Women Association (EMWA) empowers women in Ethiopian media through advocacy, professional development, and a nationwide network of journalists, editors, and communicators.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c476bdbc-d005-4269-a9c3-6add5845e731" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Ethiopian Media Women Association (EMWA)" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "EMWA — Ethiopian Media Women Association" },
      { name: "twitter:description", content: "The Ethiopian Media Women Association (EMWA) empowers women in Ethiopian media through advocacy, professional development, and a nationwide network of journalists, editors, and communicators." },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c476bdbc-d005-4269-a9c3-6add5845e731" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", href: logoUrl },
      { rel: "apple-touch-icon", href: logoUrl },
      { rel: "shortcut icon", href: logoUrl },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Newsreader:ital@0;1&family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/emwa-logo-new.png" />
        <link rel="apple-touch-icon" href="/emwa-logo-new.png" />
        <link rel="shortcut icon" href="/emwa-logo-new.png" />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Outlet />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
