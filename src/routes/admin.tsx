import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleUserRound,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Type,
  UploadCloud,
  UserRoundCheck,
  UsersRound,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import logo from "@/assets/emwa-logo-new.png";
import {
  adminApi,
  API_BASE,
  ApiError,
  listData,
  loginAdmin,
  logoutAdmin,
  type ApplicationStatus,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administration — EMWA" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

type Section =
  | "overview"
  | "updates"
  | "events"
  | "experts"
  | "memberships"
  | "membership-types"
  | "resources"
  | "messages"
  | "subscribers"
  | "administrators"
  | "hero-slides";
type AdminSession = {
  token: string;
  refreshToken: string;
  admin: { id: string; fullName: string; email?: string; role: string };
};
type Dashboard = Record<string, string | number> & {
  recentApplications?: Record<string, unknown>[];
  recentContactMessages?: Record<string, unknown>[];
};
type Expert = {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  professional_title: string;
  area_of_expertise?: string;
  primary_expertise?: string;
  location: string;
  status: ApplicationStatus;
  created_at: string;
  biography?: string;
  professional_biography?: string;
  profile_photo_url?: string;
  profile_photo?: string;
  profilePhotoUrl?: string;
  photo_url?: string;
  photo?: string;
  image_url?: string;
  last_edited_at?: string;
};
type Membership = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  outlet_or_institution: string;
  current_position: string;
  region_or_chapter: string;
  address?: string;
  fee_amount?: number | string;
  fee_currency?: string;
  payment_screenshot_url?: string;
  paymentScreenshotUrl?: string;
  payment_proof_url?: string;
  paymentProofUrl?: string;
  dynamic_data?: {
    dateOfBirth?: string;
    citySubCity?: string;
    woreda?: string;
    houseNumber?: string;
    additionalSkills?: string;
    emergencyContact1?: { name?: string; phone?: string };
    emergencyContact2?: { name?: string; phone?: string };
    yearsOfExperience?: number;
    department?: string;
    educationLevel?: string;
    fieldOfStudy?: string;
    companyPhone?: string;
    additionalPhones?: Array<{ label?: string; type?: string; number: string }>;
    paymentConfirmation?: {
      fileName?: string;
      mimeType?: string;
      dataUrl?: string;
    };
    paymentScreenshotUrl?: string;
    paymentProofUrl?: string;
    [key: string]: unknown;
  };
  membership_type_id: string;
  status: ApplicationStatus;
  created_at: string;
};
type MembershipType = {
  id: string;
  name: string;
  description: string;
  requirements: string;
  price_amount: string;
  currency: string;
  is_active: boolean;
};
type Resource = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  mime_type: string;
  file_size: string;
  is_published: boolean;
  created_at: string;
};
type Contact = {
  id: string;
  full_name: string;
  email: string;
  company_name?: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  created_at: string;
};
type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type UpdateBlock = {
  id?: string;
  type: "text" | "image" | "video" | "header";
  position?: number;
  content?: string;
  url?: string;
  caption?: string;
};

type UpdatePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  content_type: "NEWS" | "PRESS" | "ARTICLE" | "PHOTO" | "VIDEO";
  featured_image_url?: string;
  video_url?: string;
  author_name: string;
  status: PublishStatus;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  blocks?: UpdateBlock[];
};
type AdminEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_type: string;
  location: string;
  starts_at: string;
  ends_at?: string;
  registration_url?: string;
  capacity_status: "AVAILABLE" | "AT_CAPACITY" | "CANCELLED";
  featured_image_url?: string;
  status: PublishStatus;
  created_at: string;
};
type Administrator = {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
};
type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
  subscribed_at: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
};
type HeroSlideItem = {
  id: string;
  imageUrl: string;
  title?: string;
  titleAm?: string;
  description?: string;
  descriptionAm?: string;
  text: string;
  textAm: string;
  signoff?: string;
  signoffAm?: string;
  author: string;
  role: string;
  roleAm: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "updates", label: "Updates", icon: Newspaper },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "experts", label: "Expert applications", icon: UserRoundCheck },
  { id: "memberships", label: "Membership requests", icon: UsersRound },
  { id: "membership-types", label: "Membership types", icon: BookOpen },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "messages", label: "Contact messages", icon: MessageSquare },
  { id: "subscribers", label: "Email subscribers", icon: Inbox },
  { id: "administrators", label: "Administrators", icon: ShieldCheck },
  { id: "hero-slides", label: "Hero slides", icon: ImageIcon },
];

const fmtDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );

const uploadUrl = (value?: string | null) => {
  if (!value) return "";
  try {
    const str = String(value).trim();
    if (!str) return "";
    if (str.startsWith("data:") || str.startsWith("blob:")) return str;
    const origin = new URL(API_BASE).origin;
    if (str.startsWith("http://") || str.startsWith("https://")) {
      const parsed = new URL(str);
      const uploadMatch = parsed.pathname.match(/(?:\/api\/v1)?(\/uploads\/.+)$/);
      if (uploadMatch) return `${origin}${uploadMatch[1]}`;
      return str;
    }
    const cleanPath = str.startsWith("/") ? str : `/${str}`;
    return `${origin}${cleanPath}`;
  } catch {
    return value || "";
  }
};

const compressImageFile = async (
  file: File,
  maxDimension = 1600,
  quality = 0.8,
): Promise<{ dataUrl: string; file: File }> => {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result), file });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = window.document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      throw new Error("Canvas context not available");
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outType = "image/jpeg";
    const dataUrl = canvas.toDataURL(outType, quality);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outType, quality),
    );

    if (blob) {
      const compressedFile = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "") + ".jpg",
        { type: outType, lastModified: Date.now() },
      );
      return { dataUrl, file: compressedFile };
    }
    return { dataUrl, file };
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result), file });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

const optimizeEventImage = async (data: FormData) => {
  const image = data.get("featuredImage");
  if (!(image instanceof File) || !image.size) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    throw new Error("Event image must be a JPG, PNG, or WEBP file.");
  }
  if (image.size <= 2 * 1024 * 1024) return;

  const { file: compressed } = await compressImageFile(image, 1920, 0.82);
  data.set("featuredImage", compressed);
};

function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);

  const logAdminButtonClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;

    const label =
      button.getAttribute("aria-label") ||
      button.getAttribute("title") ||
      button.textContent?.replace(/\s+/g, " ").trim() ||
      "Unlabelled button";

    console.info("[EMWA Admin] Button clicked", {
      action: label,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleLogin = useCallback((next: AdminSession) => {
    window.localStorage.setItem("emwa_admin_session", JSON.stringify(next));
    setSession(next);
  }, []);

  const handleLogout = useCallback(() => {
    if (session?.refreshToken && session.token !== "frontend-demo-session") {
      void logoutAdmin(session.refreshToken).catch(() => undefined);
    }
    window.localStorage.removeItem("emwa_admin_session");
    setSession(null);
  }, [session]);

  useEffect(() => {
    const saved = window.localStorage.getItem("emwa_admin_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AdminSession;
        if (!parsed.token || parsed.token === "frontend-demo-session") {
          window.localStorage.removeItem("emwa_admin_session");
          return;
        }
        setSession(parsed);
      } catch {
        window.localStorage.removeItem("emwa_admin_session");
      }
    }
  }, []);

  useEffect(() => {
    const expireSession = () => setSession(null);
    window.addEventListener("emwa-admin-session-expired", expireSession);
    return () => window.removeEventListener("emwa-admin-session-expired", expireSession);
  }, []);

  useEffect(() => {
    const updateSession = (event: Event) => {
      setSession((event as CustomEvent<AdminSession>).detail);
    };
    window.addEventListener("emwa-admin-session-updated", updateSession);
    return () => window.removeEventListener("emwa-admin-session-updated", updateSession);
  }, []);

  return (
    <div onClickCapture={logAdminButtonClick}>
      {!session ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminWorkspace session={session} onLogout={handleLogout} />
      )}
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginAdmin(email, password);
      onLogin({
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        admin: response.data.admin,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#171513] text-[#f5f0e7] grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden lg:flex min-h-screen flex-col justify-between overflow-hidden border-r border-white/10 p-12 xl:p-16">
        <div
          className="absolute inset-0 opacity-[.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="relative">
          <img src={logo} alt="EMWA" className="h-16 w-auto brightness-0 invert" />
        </div>
        <div className="relative max-w-2xl">
          <p className="label-mono text-[#e4ab3a]">Private administration</p>
          <h1 className="mt-6 text-[clamp(4.6rem,8vw,8.5rem)] leading-[.82] tracking-[-.055em]">
            THE WORK
            <br />
            <span className="text-[#a53b4d]">BEHIND</span>
            <br />
            THE MISSION.
          </h1>
          <p className="mt-8 max-w-lg font-[var(--font-body)] text-lg leading-8 text-white/55">
            Review applications, protect quality, publish resources, and keep EMWA's growing
            community moving.
          </p>
        </div>
        <p className="relative label-mono text-white/30">
          Ethiopian Media Women Association · Secure workspace
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 py-16 text-[#1c1917]">
        <div className="w-full max-w-md">
          <img src={logo} alt="EMWA" className="mb-16 h-14 w-auto lg:hidden" />
          <p className="label-mono text-[#8c2d3c]">Administrator access</p>
          <h2 className="mt-4 text-5xl font-black tracking-[-.04em] sm:text-6xl">Welcome back.</h2>
          <p className="mt-4 font-[var(--font-body)] text-sm leading-6 text-black/55">
            Sign in with your EMWA administrator account to access the secure command desk.
          </p>
          <form onSubmit={submit} className="mt-12 space-y-7">
            <AdminInput
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@emwa.org.et"
              autoComplete="email"
              required
            />
            <AdminInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            {error && (
              <div className="border-l-4 border-[#8c2d3c] bg-[#8c2d3c]/8 px-4 py-3 font-[var(--font-body)] text-sm text-[#6f1f2c]">
                {error}
              </div>
            )}
            <button
              disabled={loading}
              className="group flex w-full items-center justify-between bg-[#1c1917] px-6 py-5 font-[var(--font-body)] text-sm font-bold text-white transition hover:bg-[#8c2d3c] disabled:opacity-60"
            >
              <span>{loading ? "Signing in…" : "Enter administration"}</span>
              {loading ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>
          <a
            href="/"
            className="mt-10 inline-flex items-center gap-2 label-mono text-black/45 hover:text-[#8c2d3c]"
          >
            ← Return to public website
          </a>
        </div>
      </section>
    </main>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  ...props
}: { label: string; value: string; onChange: (value: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
>) {
  return (
    <label className="block">
      <span className="label-mono text-black/55">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full border-0 border-b border-black/25 bg-transparent px-0 py-4 font-[var(--font-body)] text-lg outline-none transition placeholder:text-black/25 focus:border-[#8c2d3c]"
      />
    </label>
  );
}

function AdminWorkspace({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const [section, setSection] = useState<Section>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [types, setTypes] = useState<MembershipType[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [updates, setUpdates] = useState<UpdatePost[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    if (session.token === "frontend-demo-session") {
      const now = new Date().toISOString();
      setDashboard({ demo: "true" });
      setExperts([
        {
          id: "demo-expert-1",
          full_name: "Hana Bekele",
          email: "hana@example.com",
          professional_title: "Investigative Reporter",
          area_of_expertise: "Journalism",
          location: "Addis Ababa",
          status: "PENDING",
          created_at: now,
          biography: "Reporter covering public-interest and community stories.",
        },
      ]);
      setMemberships([
        {
          id: "demo-member-1",
          full_name: "Marta Tesfaye",
          email: "marta@example.com",
          phone_number: "+251911000000",
          outlet_or_institution: "Addis Media Network",
          current_position: "Producer",
          region_or_chapter: "Addis Ababa",
          membership_type_id: "demo-type-1",
          status: "PENDING",
          created_at: now,
        },
      ]);
      setTypes([
        {
          id: "demo-type-1",
          name: "Full Member",
          description: "Working women journalists, producers, and editors.",
          requirements: "Active media professional",
          price_amount: "800",
          currency: "ETB",
          is_active: true,
        },
      ]);
      setResources([
        {
          id: "demo-resource-1",
          title: "Safe Reporting Handbook",
          description: "A practical guide for women working in Ethiopian media.",
          file_url: "#",
          mime_type: "application/pdf",
          file_size: "2400000",
          is_published: true,
          created_at: now,
        },
      ]);
      setContacts([
        {
          id: "demo-contact-1",
          full_name: "Selam Worku",
          email: "selam@example.com",
          subject: "Partnership",
          message: "We would like to discuss a regional media partnership.",
          status: "NEW",
          created_at: now,
        },
      ]);
      setUpdates([
        {
          id: "demo-update-1",
          title: "EMWA submits gender-equity brief to Parliament",
          slug: "emwa-submits-gender-equity-brief-to-parliament",
          excerpt: "A policy agenda for measurable representation and safer newsrooms.",
          content:
            "EMWA has submitted a new policy brief calling for measurable representation, safer working environments, and transparent leadership pathways across Ethiopia's public media institutions.",
          content_type: "NEWS",
          author_name: "EMWA Editorial Desk",
          status: "PUBLISHED",
          is_featured: true,
          published_at: now,
          created_at: now,
        },
      ]);
      setEvents([
        {
          id: "demo-event-1",
          title: "Regional Chapter Convening",
          slug: "regional-chapter-convening",
          description: "A gathering for regional members, editors, and program partners.",
          event_type: "Convening",
          location: "Hawassa University",
          starts_at: now,
          capacity_status: "AVAILABLE",
          status: "PUBLISHED",
          created_at: now,
        },
      ]);
      setHeroSlides([
        {
          id: "demo-slide-1",
          imageUrl: "https://images.unsplash.com/photo-1585637071663-799845ad5212?w=1600&q=80",
          text: "Women journalists on the frontlines are reshaping how the world sees conflict.",
          textAm: "በግንባር ላይ ያሉ ሴት ጋዜጠኞች ዓለም ግጭትን የሚያይበትን መንገድ እየቀየሩ ይገኛሉ።",
          author: "Reuters Institute",
          role: "Global Press Freedom Report 2026",
          roleAm: "ዓለም አቀፍ የፕሬስ ነፃነት ሪፖርት 2026",
          displayOrder: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      setLoading(false);
      return;
    }
    try {
      const [
        dash,
        expertList,
        memberList,
        typeList,
        resourceList,
        contactList,
        updateList,
        eventList,
        administratorList,
        subscriberList,
        heroList,
      ] = await Promise.all([
        adminApi<Dashboard>("/admin/dashboard", session.token),
        listData<Expert>("/admin/expert-applications?page=1&limit=100", session.token),
        listData<Membership>("/admin/membership-applications?page=1&limit=100", session.token),
        adminApi<MembershipType[]>("/public/membership-types", session.token),
        listData<Resource>("/admin/resources?page=1&limit=100", session.token),
        listData<Contact>("/admin/contact-messages?page=1&limit=100", session.token),
        listData<UpdatePost>("/admin/updates?page=1&limit=100", session.token),
        listData<AdminEvent>("/admin/events?page=1&limit=100&order=asc", session.token),
        listData<Administrator>("/admin/admins?page=1&limit=100", session.token),
        listData<NewsletterSubscriber>(
          "/admin/newsletter-subscribers?page=1&limit=100",
          session.token,
        ),
        adminApi<HeroSlideItem[]>("/admin/hero-slides", session.token).catch(() => ({ success: true, data: [] })),
      ]);
      setDashboard(dash.data);
      setExperts(expertList.rows);
      setMemberships(memberList.rows);
      setTypes(typeList.data);
      setResources(resourceList.rows);
      setContacts(contactList.rows);
      setUpdates(updateList.rows);
      setEvents(eventList.rows);
      setAdministrators(administratorList.rows);
      setSubscribers(subscriberList.rows);
      setHeroSlides(heroList.data ?? []);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) return onLogout();
      setError(cause instanceof Error ? cause.message : "Unable to load administration data");
    } finally {
      setLoading(false);
    }
  }, [session.token, onLogout]);

  useEffect(() => {
    void load();
  }, [load]);
  const navigate = (next: Section) => {
    setSection(next);
    setMobileNav(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_85%_5%,rgba(140,45,60,.10),transparent_24%),#f4f0e8] text-[14px] text-[#1c1917] lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[264px] min-h-0 flex-col overflow-hidden bg-[linear-gradient(165deg,#211e1b_0%,#171513_60%,#2a171a_100%)] text-white shadow-2xl transition-transform lg:sticky lg:top-0 ${mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-7">
          <img src={logo} alt="EMWA" className="h-11 w-auto brightness-0 invert" />
          <button onClick={() => setMobileNav(false)} className="lg:hidden">
            <X />
          </button>
        </div>
        <div className="shrink-0 px-7 pb-5 pt-6">
          <p className="label-mono text-white/35">Administration</p>
          <p className="mt-2 truncate font-[var(--font-body)] text-sm font-semibold">
            {session.admin.fullName}
          </p>
          <p className="mt-1 label-mono text-[#e4ab3a]">{session.admin.role}</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2 [scrollbar-width:thin]">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-[var(--font-body)] text-sm transition ${section === id ? "bg-[#9d3547] text-white shadow-lg shadow-black/20" : "text-white/60 hover:bg-white/8 hover:text-white"}`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
              {section === id && <ChevronRight className="ml-auto size-4" />}
            </button>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 bg-black/10 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 font-[var(--font-body)] text-sm text-white/65 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}
      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-black/10 bg-[#f4f0e8]/90 px-5 py-3 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNav(true)}
              className="grid size-10 place-items-center border border-black/15 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="label-mono !text-[8px] leading-none text-[#8c2d3c]">
                EMWA command desk
              </p>
              <p className="mt-2 font-[var(--font-display)] !text-[1.45rem] font-black leading-none tracking-[-.025em]">
                {navItems.find((item) => item.id === section)?.label}
              </p>
            </div>
          </div>
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 border border-black/15 px-4 py-2.5 label-mono hover:border-[#8c2d3c] hover:text-[#8c2d3c]"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>
        <div className="mx-auto w-full max-w-[1600px] p-5 md:p-7 xl:p-9">
          {error && (
            <div className="mb-7 flex items-center justify-between border-l-4 border-[#8c2d3c] bg-white p-5 font-[var(--font-body)] text-sm">
              <span>{error}</span>
              <button onClick={() => void load()} className="font-bold text-[#8c2d3c]">
                Retry
              </button>
            </div>
          )}
          {loading && !dashboard ? (
            <LoadingState />
          ) : (
            <>
              {section === "overview" && (
                <Overview
                  dashboard={dashboard}
                  experts={experts}
                  memberships={memberships}
                  resources={resources}
                  contacts={contacts}
                  navigate={navigate}
                />
              )}
              {section === "updates" && (
                <UpdatesPanel
                  rows={updates}
                  token={session.token}
                  reload={load}
                  setRows={setUpdates}
                />
              )}
              {section === "events" && (
                <EventsPanel
                  rows={events}
                  token={session.token}
                  reload={load}
                  setRows={setEvents}
                />
              )}
              {section === "experts" && (
                <ApplicationsPanel
                  title="Expert applications"
                  subtitle="Review professional profiles before they enter the public directory."
                  rows={experts}
                  type="expert"
                  token={session.token}
                  reload={load}
                />
              )}
              {section === "memberships" && (
                <MembershipPanel
                  rows={memberships}
                  types={types}
                  token={session.token}
                  reload={load}
                />
              )}
              {section === "membership-types" && (
                <MembershipTypesPanel rows={types} token={session.token} reload={load} />
              )}
              {section === "resources" && (
                <ResourcesPanel rows={resources} token={session.token} reload={load} />
              )}
              {section === "messages" && (
                <MessagesPanel rows={contacts} token={session.token} reload={load} />
              )}
              {section === "subscribers" && (
                <SubscribersPanel rows={subscribers} token={session.token} reload={load} />
              )}
              {section === "administrators" && (
                <AdministratorsPanel
                  rows={administrators}
                  token={session.token}
                  currentAdmin={session.admin}
                  reload={load}
                />
              )}
              {section === "hero-slides" && (
                <HeroSlidesPanel rows={heroSlides} token={session.token} reload={load} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function AdministratorsPanel({
  rows,
  token,
  currentAdmin,
  reload,
}: {
  rows: Administrator[];
  token: string;
  currentAdmin: AdminSession["admin"];
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const [accessBusy, setAccessBusy] = useState("");
  const isSuperAdmin = currentAdmin.role === "SUPER_ADMIN";

  const createAdministrator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    setCreated("");
    try {
      const fullName = String(values.get("fullName"));
      await adminApi<Administrator>("/admin/admins", token, {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email: String(values.get("email")),
          password: String(values.get("password")),
          role: String(values.get("role")),
        }),
      });
      form.reset();
      setCreated(`${fullName} can now sign in to the EMWA administration dashboard.`);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create administrator");
    } finally {
      setBusy(false);
    }
  };

  const setAdministratorActive = async (row: Administrator, isActive: boolean) => {
    if (
      !window.confirm(
        isActive
          ? `Restore administration access for ${row.full_name}?`
          : `Remove administration access for ${row.full_name}? Their audit history will be preserved.`,
      )
    ) return;
    setAccessBusy(row.id);
    setError("");
    try {
      await adminApi(`/admin/admins/${row.id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update administrator access");
    } finally {
      setAccessBusy("");
    }
  };

  return (
    <PagePanel
      title="Administrators"
      subtitle="View the people with access to the EMWA command desk and create secure accounts."
    >
      <div
        className={`grid gap-7 ${isSuperAdmin ? "xl:grid-cols-[minmax(320px,.72fr)_minmax(0,1.28fr)]" : ""}`}
      >
        {isSuperAdmin && (
          <form
            onSubmit={createAdministrator}
            className="h-fit rounded-2xl bg-[#191715] p-6 text-white shadow-xl"
          >
            <p className="label-mono text-[#e4ab3a]">Super-admin control</p>
            <h3 className="mt-3 text-3xl font-black">Create an administrator</h3>
            <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-white/50">
              Create a named account with its own password and access level.
            </p>
            <div className="mt-7 grid gap-4">
              <PublicationInput
                name="fullName"
                label="Full name"
                minLength={2}
                maxLength={150}
                required
              />
              <PublicationInput
                name="email"
                label="Email address"
                type="email"
                maxLength={320}
                autoComplete="off"
                required
              />
              <PublicationInput
                name="password"
                label="Temporary password"
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
              />
              <p className="-mt-2 font-[var(--font-body)] text-xs leading-5 text-white/40">
                At least 12 characters with uppercase, lowercase, number, and symbol.
              </p>
              <PublicationSelect
                name="role"
                label="Access level"
                defaultValue="ADMIN"
                options={["ADMIN", "SUPER_ADMIN"]}
              />
            </div>
            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
            {created && <p className="mt-4 text-sm text-emerald-300">{created}</p>}
            <button
              disabled={busy}
              className="mt-6 flex w-full items-center justify-between bg-[#8c2d3c] px-5 py-4 font-[var(--font-body)] text-sm font-bold hover:bg-[#a53b4d] disabled:opacity-50"
            >
              {busy ? "Creating accountâ€¦" : "Create administrator"}
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </button>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
          <PanelHeader
            eyebrow="Access directory"
            title={`${rows.length} administrator${rows.length === 1 ? "" : "s"}`}
          />
          {rows.length ? (
            <div className="divide-y divide-black/8">
              {rows.map((row) => (
                <article
                  key={row.id}
                  className="grid gap-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-[#eadfd3] font-black text-[#8c2d3c]">
                    {row.full_name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-[var(--font-body)] text-sm font-bold">{row.full_name}</h3>
                      {row.id === currentAdmin.id && (
                        <span className="bg-[#e4ab3a]/20 px-2 py-1 label-mono text-[#7a5310]">
                          You
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-[var(--font-body)] text-sm text-black/50">
                      {row.email}
                    </p>
                    <p className="mt-2 label-mono text-black/35">Added {fmtDate(row.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="bg-[#ece5da] px-2.5 py-1 label-mono text-black/55">
                      {row.role}
                    </span>
                    <StatusBadge value={row.is_active ? "ACTIVE" : "INACTIVE"} />
                    {isSuperAdmin && row.id !== currentAdmin.id && (
                      <button
                        type="button"
                        disabled={accessBusy === row.id}
                        onClick={() => void setAdministratorActive(row, !row.is_active)}
                        className={`inline-flex items-center gap-2 border px-3 py-2 font-[var(--font-body)] text-sm font-bold transition disabled:opacity-50 ${
                          row.is_active
                            ? "border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
                            : "border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white"
                        }`}
                      >
                        {row.is_active && <Trash2 className="size-4" />}
                        {accessBusy === row.id
                          ? "Updating…"
                          : row.is_active
                            ? "Remove access"
                            : "Restore"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="No administrator accounts found" />
          )}
        </div>
      </div>
    </PagePanel>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-9 animate-spin text-[#8c2d3c]" />
        <p className="mt-4 label-mono text-black/45">Loading administration</p>
      </div>
    </div>
  );
}

function Overview({
  dashboard,
  experts,
  memberships,
  resources,
  contacts,
  navigate,
}: {
  dashboard: Dashboard | null;
  experts: Expert[];
  memberships: Membership[];
  resources: Resource[];
  contacts: Contact[];
  navigate: (section: Section) => void;
}) {
  const stats = [
    {
      label: "Pending experts",
      value: experts.filter((x) => x.status === "PENDING").length,
      icon: UserRoundCheck,
      section: "experts" as Section,
    },
    {
      label: "Pending members",
      value: memberships.filter((x) => x.status === "PENDING").length,
      icon: UsersRound,
      section: "memberships" as Section,
    },
    {
      label: "New messages",
      value: contacts.filter((x) => x.status === "NEW").length,
      icon: Inbox,
      section: "messages" as Section,
    },
    {
      label: "Published resources",
      value: resources.filter((x) => x.is_published).length,
      icon: FileText,
      section: "resources" as Section,
    },
  ];
  const recent = [
    ...experts.map((x) => ({
      id: x.id,
      name: x.full_name,
      kind: "Expert",
      status: x.status,
      date: x.created_at,
    })),
    ...memberships.map((x) => ({
      id: x.id,
      name: x.full_name,
      kind: "Membership",
      status: x.status,
      date: x.created_at,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);
  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-[1.65rem] bg-[#1d1a18] px-7 py-8 text-white shadow-2xl shadow-black/10 md:px-9 md:py-9">
        <div className="absolute -right-12 -top-20 size-60 rounded-full border-[36px] border-[#9d3547]/70" />
        <div className="absolute bottom-0 right-1/3 h-24 w-px bg-white/10" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="label-mono text-[#e4ab3a]">Daily overview</p>
            <h2 className="mt-3 !text-[2.35rem] font-black leading-[.94] tracking-[-.04em] md:!text-[3rem]">
              Good work
              <br />
              starts here.
            </h2>
          </div>
          <p className="max-w-sm font-[var(--font-body)] text-sm leading-6 text-white/55">
            Everything requiring your attention, gathered in one clear workspace.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, section }) => (
          <button
            key={label}
            onClick={() => navigate(section)}
            className="group rounded-2xl border border-black/8 bg-[#fbf9f4] p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#8c2d3c]/25 hover:bg-white hover:shadow-xl hover:shadow-black/8"
          >
            <div className="flex items-start justify-between">
              <Icon className="size-5 text-[#8c2d3c]" />
              <ArrowRight className="size-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
            <strong className="mt-10 block text-5xl font-black">{value}</strong>
            <span className="mt-2 block label-mono text-black/45">{label}</span>
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-[1.35fr_.65fr]">
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
          <PanelHeader eyebrow="Incoming work" title="Recent applications" />
          <div>
            {recent.length ? (
              recent.map((item) => (
                <div
                  key={item.kind + item.id}
                  className="grid grid-cols-[1fr_auto] gap-4 border-t border-black/8 px-6 py-4 sm:grid-cols-[1fr_110px_110px]"
                >
                  <div>
                    <p className="font-[var(--font-body)] font-semibold">{item.name}</p>
                    <p className="mt-1 label-mono text-black/35">{fmtDate(item.date)}</p>
                  </div>
                  <span className="hidden self-center label-mono text-black/45 sm:block">
                    {item.kind}
                  </span>
                  <StatusBadge value={item.status} />
                </div>
              ))
            ) : (
              <EmptyState text="No applications yet" />
            )}
          </div>
        </section>
        <section className="rounded-2xl bg-[linear-gradient(145deg,#9d3547,#6e2230)] p-7 text-white shadow-xl shadow-[#8c2d3c]/15">
          <p className="label-mono text-white/55">At a glance</p>
          <h3 className="mt-4 text-3xl font-black">Community pulse</h3>
          <div className="mt-10 space-y-5 font-[var(--font-body)] text-sm">
            <Pulse label="Total expert requests" value={experts.length} />
            <Pulse label="Total member requests" value={memberships.length} />
            <Pulse label="Resource library" value={resources.length} />
            <Pulse label="Inbox" value={contacts.length} />
          </div>
          <p className="mt-10 border-t border-white/20 pt-5 text-sm leading-6 text-white/60">
            {dashboard
              ? "Live data from the EMWA administration API."
              : "Dashboard summary is syncing."}
          </p>
        </section>
      </div>
    </div>
  );
}

function Pulse({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/15 pb-3">
      <span className="text-white/65">{label}</span>
      <strong className="text-xl">{value}</strong>
    </div>
  );
}
function PanelHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4 p-6">
      <div>
        <p className="label-mono text-[#8c2d3c]">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-black">{title}</h3>
      </div>
      {action}
    </header>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid min-h-48 place-items-center p-8 text-center">
      <div>
        <Archive className="mx-auto size-7 text-black/25" />
        <p className="mt-3 font-[var(--font-body)] text-sm text-black/45">{text}</p>
      </div>
    </div>
  );
}
function StatusBadge({ value }: { value: string }) {
  const style =
    value === "APPROVED" || value === "READ" || value === "ACTIVE"
      ? "bg-emerald-100 text-emerald-800"
      : value === "REJECTED" ||
          value === "ARCHIVED" ||
          value === "INACTIVE" ||
          value === "UNSUBSCRIBED"
        ? "bg-stone-200 text-stone-600"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`self-center justify-self-end px-2.5 py-1 label-mono ${style}`}>{value}</span>
  );
}

function ApplicationsPanel({
  title,
  subtitle,
  rows,
  type,
  token,
  reload,
}: {
  title: string;
  subtitle: string;
  rows: Expert[];
  type: "expert";
  token: string;
  reload: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState<Expert | null>(null);
  const [editError, setEditError] = useState("");
  const visible = rows.filter(
    (row) =>
      (filter === "ALL" || row.status === filter) &&
      `${row.full_name} ${row.email} ${row.area_of_expertise}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const review = async (id: string, status: "APPROVED" | "REJECTED") => {
    setBusy(id + status);
    try {
      await adminApi(`/admin/${type}-applications/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reviewNote:
            status === "APPROVED"
              ? "Approved from administration dashboard."
              : "Rejected after administrative review.",
        }),
      });
      await reload();
    } finally {
      setBusy("");
    }
  };
  const remove = async (row: Expert) => {
    if (!window.confirm(`Permanently delete ${row.full_name}'s expert application?`)) return;
    setBusy(row.id + "DELETE");
    try {
      await adminApi(`/admin/${type}-applications/${row.id}`, token, { method: "DELETE" });
      await reload();
    } finally {
      setBusy("");
    }
  };
  const saveExpert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setBusy(editing.id + "UPDATE");
    setEditError("");
    try {
      await adminApi(`/admin/expert-applications/${editing.id}`, token, {
        method: "PATCH",
        body: new FormData(event.currentTarget),
      });
      setEditing(null);
      await reload();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to update this expert.");
    } finally {
      setBusy("");
    }
  };
  return (
    <PagePanel title={title} subtitle={subtitle}>
      <FilterBar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} />
      {visible.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((row) => {
            const photo =
              row.profile_photo_url ||
              row.profile_photo ||
              row.profilePhotoUrl ||
              row.photo_url ||
              row.photo ||
              row.image_url;
            const photoSrc = uploadUrl(photo);
            const expertField = row.area_of_expertise || row.primary_expertise || "Expert profile";
            const expertBio = row.biography || row.professional_biography || "No biography provided.";

            return (
              <article
                key={row.id}
                className="min-w-0 overflow-visible rounded-2xl border border-black/10 bg-[#fbf9f4] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/8"
              >
                <div className="relative mb-6 grid aspect-[16/8] overflow-hidden rounded-xl bg-[linear-gradient(135deg,#e8ded1,#d7c5b3)]">
                  <span className="m-auto text-5xl font-black text-[#8c2d3c]/45">
                    {row.full_name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={`${row.full_name}'s uploaded profile`}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover object-center transition duration-500 hover:scale-[1.02]"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="label-mono text-[#8c2d3c]">
                      {expertField}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{row.full_name}</h3>
                    <p className="mt-1 font-[var(--font-body)] text-sm text-black/50">
                      {row.professional_title} · {row.location}
                    </p>
                  </div>
                  <span className="shrink-0"><StatusBadge value={row.status} /></span>
                </div>
                <p className="mt-6 font-[var(--font-body)] text-sm leading-6 text-black/60">
                  {expertBio}
                </p>
                <p className="mt-3 break-all font-[var(--font-body)] text-sm font-semibold text-[#8c2d3c]">
                  {row.email || row.phone_number || "No contact method"}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
                  <span className="label-mono text-black/35">{fmtDate(row.created_at)}</span>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton
                      label="Edit"
                      onClick={() => {
                        setEditError("");
                        setEditing(row);
                      }}
                      variant="outline"
                    />
                    {row.status === "PENDING" && (
                      <>
                      <ActionButton
                        label="Reject"
                        busy={busy === row.id + "REJECTED"}
                        onClick={() => void review(row.id, "REJECTED")}
                        variant="outline"
                      />
                      <ActionButton
                        label="Approve"
                        busy={busy === row.id + "APPROVED"}
                        onClick={() => void review(row.id, "APPROVED")}
                      />
                      </>
                    )}
                    <button
                      type="button"
                      disabled={busy === row.id + "DELETE"}
                      onClick={() => void remove(row)}
                      className="inline-flex items-center gap-2 border border-red-700 px-3 py-2 font-[var(--font-body)] text-sm font-bold text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                      {busy === row.id + "DELETE" ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState text="No expert applications match this view" />
      )}
      {editing && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm" onMouseDown={() => setEditing(null)}>
          <form
            className="my-auto w-full max-w-3xl rounded-2xl bg-[#fbf9f4] shadow-2xl"
            onSubmit={saveExpert}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5 sm:px-8">
              <div>
                <p className="label-mono text-[#8c2d3c]">Expert directory editor</p>
                <h2 className="mt-2 text-3xl font-black text-black">Update expert profile</h2>
                <p className="mt-1 text-sm text-black/55">Changes to approved experts appear in the public directory.</p>
              </div>
              <button type="button" aria-label="Close editor" onClick={() => setEditing(null)} className="grid size-10 shrink-0 place-items-center rounded-full border border-black/15 text-black hover:bg-black hover:text-white"><X className="size-4" /></button>
            </header>
            <div className="grid max-h-[68vh] gap-5 overflow-y-auto px-6 py-6 sm:grid-cols-2 sm:px-8">
              <AdminExpertField label="Full name" name="fullName" defaultValue={editing.full_name} required />
              <AdminExpertField label="Professional title" name="professionalTitle" defaultValue={editing.professional_title} required />
              <AdminExpertField label="Expert category" name="primaryExpertise" defaultValue={editing.area_of_expertise || editing.primary_expertise || ""} required />
              <AdminExpertField label="Location" name="location" defaultValue={editing.location} required />
              <AdminExpertField label="Email address" name="email" type="email" defaultValue={editing.email ?? ""} />
              <AdminExpertField label="Phone number" name="phone" type="tel" defaultValue={editing.phone_number ?? ""} />
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="label-mono text-black/55">Professional biography</span>
                <textarea name="professionalBiography" required minLength={20} maxLength={10000} rows={7} defaultValue={editing.biography || editing.professional_biography || ""} className="rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#8c2d3c]" />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="label-mono text-black/55">Replace profile photo</span>
                {uploadUrl(
                  editing.profile_photo_url ||
                  editing.profile_photo ||
                  editing.profilePhotoUrl ||
                  editing.photo_url ||
                  editing.photo ||
                  editing.image_url
                ) && (
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadUrl(
                        editing.profile_photo_url ||
                        editing.profile_photo ||
                        editing.profilePhotoUrl ||
                        editing.photo_url ||
                        editing.photo ||
                        editing.image_url
                      )}
                      alt="Current profile"
                      className="size-16 rounded-lg object-cover border border-black/10"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <span className="text-xs text-black/60">Current profile photo</span>
                  </div>
                )}
                <input name="profilePhoto" type="file" accept="image/jpeg,image/png" className="rounded-lg border border-dashed border-black/20 bg-white px-4 py-4 text-sm text-black" />
                <small className="text-black/45">Leave empty to keep the current photo.</small>
              </label>
              {editError && <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{editError}</p>}
            </div>
            <footer className="flex flex-wrap justify-end gap-3 border-t border-black/10 px-6 py-5 sm:px-8">
              <button type="button" onClick={() => setEditing(null)} className="border border-black/20 px-5 py-3 text-sm font-bold text-black hover:bg-black/5">Cancel</button>
              <button type="submit" disabled={busy === editing.id + "UPDATE"} className="bg-[#8c2d3c] px-5 py-3 text-sm font-bold text-white hover:bg-[#6f2230] disabled:opacity-50">{busy === editing.id + "UPDATE" ? "Saving…" : "Save expert"}</button>
            </footer>
          </form>
        </div>
      )}
    </PagePanel>
  );
}

function AdminExpertField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="label-mono text-black/55">{label}</span>
      <input {...props} minLength={props.type === "email" ? undefined : 2} maxLength={props.type === "email" ? 254 : 150} className="min-w-0 rounded-lg border border-black/15 bg-white px-4 py-3 text-black outline-none focus:border-[#8c2d3c]" />
    </label>
  );
}

function MembershipPanel({
  rows,
  types,
  token,
  reload,
}: {
  rows: Membership[];
  types: MembershipType[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [nameFilter, setNameFilter] = useState("");
  const [typeId, setTypeId] = useState("ALL");
  const [status, setStatus] = useState<"ALL" | ApplicationStatus>("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  const getMemberPaymentScreenshot = (row: Membership) => {
    const raw =
      row.payment_screenshot_url ||
      row.paymentScreenshotUrl ||
      row.payment_proof_url ||
      row.paymentProofUrl ||
      row.dynamic_data?.paymentScreenshotUrl ||
      row.dynamic_data?.paymentProofUrl ||
      row.dynamic_data?.paymentConfirmation?.dataUrl;
    return uploadUrl(raw);
  };

  const openInNewTab = (src: string) => {
    if (src.startsWith("data:")) {
      try {
        const parts = src.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, "_blank");
        if (!win) {
          window.location.href = blobUrl;
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
        return;
      } catch (e) {
        console.error("Failed to open data URL in new tab", e);
      }
    }
    window.open(src, "_blank");
  };

  const downloadReceipt = (src: string, name: string) => {
    try {
      const link = document.createElement("a");
      link.href = src;
      link.download = `receipt-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Failed to download image", e);
    }
  };

  const getMemberFeeText = (row: Membership, typesList: MembershipType[]) => {
    if (row.fee_amount !== undefined && row.fee_amount !== null && String(row.fee_amount).trim() !== "") {
      const num = Number(row.fee_amount);
      const curr = row.fee_currency || "ETB";
      if (num <= 0) return "Free";
      return `${curr} ${num.toLocaleString()}`;
    }
    const typeObj = typesList.find((x) => x.id === row.membership_type_id);
    if (typeObj) {
      const num = Number(typeObj.price_amount);
      if (num <= 0) return "Free";
      return `${typeObj.currency || "ETB"} ${num.toLocaleString()}`;
    }
    return "—";
  };

  const visible = rows.filter((row) => {
    const matchesType = typeId === "ALL" || row.membership_type_id === typeId;
    const matchesStatus = status === "ALL" || row.status === status;
    const matchesName =
      !nameFilter.trim() ||
      row.full_name.toLowerCase().includes(nameFilter.toLowerCase().trim());
    const matchesQuery =
      !query.trim() ||
      `${row.full_name} ${row.email} ${row.phone_number} ${row.outlet_or_institution} ${row.current_position} ${row.region_or_chapter}`
        .toLowerCase()
        .includes(query.toLowerCase().trim());
    return matchesType && matchesStatus && matchesName && matchesQuery;
  });

  const clearAllFilters = () => {
    setNameFilter("");
    setQuery("");
    setTypeId("ALL");
    setStatus("ALL");
  };

  const isFiltered = Boolean(nameFilter.trim() || query.trim() || typeId !== "ALL" || status !== "ALL");

  const exportToExcel = () => {
    const headings = [
      "Full Name", "Email", "Phone", "Date of Birth", "City / Sub-city", "Woreda",
      "House Number", "Organization", "Department", "Current Role", "Years of Experience",
      "Education Level", "Field of Study", "Additional Skills", "Emergency Contact 1",
      "Emergency Contact 1 Phone", "Emergency Contact 2", "Emergency Contact 2 Phone",
      "Membership Type", "Required Fee", "Status", "Registration Date",
    ];
    const records = visible.map((row) => {
      const details = row.dynamic_data ?? {};
      return [
        row.full_name, row.email, row.phone_number, details.dateOfBirth,
        details.citySubCity || row.region_or_chapter, details.woreda, details.houseNumber,
        row.outlet_or_institution, details.department, row.current_position,
        details.yearsOfExperience, details.educationLevel, details.fieldOfStudy,
        details.additionalSkills, details.emergencyContact1?.name,
        details.emergencyContact1?.phone, details.emergencyContact2?.name,
        details.emergencyContact2?.phone,
        types.find((type) => type.id === row.membership_type_id)?.name ?? "Unknown",
        getMemberFeeText(row, types),
        row.status, new Date(row.created_at).toLocaleString(),
      ];
    });
    const escapeXml = (value: unknown) =>
      String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
    const excelRow = (cells: unknown[], header = false) =>
      `<Row>${cells.map((cell) => `<Cell${header ? ' ss:StyleID="Header"' : ""}><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`;
    const workbook = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Arial" ss:Size="10"/></Style>
<Style ss:ID="Header"><Font ss:FontName="Arial" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#8C2D3C" ss:Pattern="Solid"/></Style></Styles>
<Worksheet ss:Name="Registered Members"><Table>${excelRow(headings, true)}${records.map((record) => excelRow(record)).join("")}</Table></Worksheet>
</Workbook>`;
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", workbook], { type: "application/vnd.ms-excel;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `emwa-registered-members-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const review = async (id: string, next: "APPROVED" | "REJECTED") => {
    setBusy(id + next);
    try {
      await adminApi(`/admin/membership-applications/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({
          status: next,
          reviewNote: `${next === "APPROVED" ? "Approved" : "Rejected"} from administration dashboard.`,
        }),
      });
      await reload();
      if (selectedMember?.id === id) {
        setSelectedMember((prev) => (prev ? { ...prev, status: next } : null));
      }
    } finally {
      setBusy("");
    }
  };

  const remove = async (row: Membership) => {
    if (!window.confirm(`Permanently delete ${row.full_name}'s membership application?`)) return;
    setBusy(row.id + "DELETE");
    try {
      await adminApi(`/admin/membership-applications/${row.id}`, token, {
        method: "DELETE",
      });
      await reload();
      if (selectedMember?.id === row.id) {
        setSelectedMember(null);
      }
    } finally {
      setBusy("");
    }
  };

  return (
    <PagePanel
      title="Membership requests"
      subtitle="Review all membership applications individually with complete applicant details."
    >
      <div className="space-y-4">
        <div className="grid gap-3 bg-[#e9e3d9] p-4 sm:grid-cols-12 rounded-xl">
          <div className="relative flex items-center sm:col-span-4">
            <Search className="pointer-events-none absolute left-3 size-4 text-black/40" />
            <input
              type="search"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filter by applicant name…"
              className="w-full bg-white pl-9 pr-8 py-2.5 font-[var(--font-body)] text-sm border border-black/10 outline-none focus:border-[#8c2d3c] rounded"
            />
            {nameFilter && (
              <button
                type="button"
                onClick={() => setNameFilter("")}
                className="absolute right-2.5 text-black/40 hover:text-black"
                title="Clear name filter"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="relative flex items-center sm:col-span-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, phone, role…"
              className="w-full bg-white px-3 py-2.5 font-[var(--font-body)] text-sm border border-black/10 outline-none focus:border-[#8c2d3c] rounded"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 text-black/40 hover:text-black"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="sm:col-span-2">
            <Select
              value={typeId}
              onChange={setTypeId}
              options={[
                { value: "ALL", label: "All categories" },
                ...types.map((x) => ({ value: x.id, label: x.name })),
              ]}
            />
          </div>
          <div className="sm:col-span-1">
            <Select
              value={status}
              onChange={(v) => setStatus(v as typeof status)}
              options={["ALL", "PENDING", "APPROVED", "REJECTED"].map((x) => ({
                value: x,
                label: x === "ALL" ? "All status" : x,
              }))}
            />
          </div>
          <div className="sm:col-span-2 flex items-center">
            <button
              type="button"
              onClick={exportToExcel}
              disabled={!visible.length}
              className="flex w-full min-h-10 items-center justify-center gap-1.5 bg-[#8c2d3c] px-3 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[.12em] text-white transition hover:bg-[#702330] disabled:cursor-not-allowed disabled:opacity-45 rounded"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Filter status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-black/60">
          <p>
            Showing <b>{visible.length}</b> of <b>{rows.length}</b> membership requests
            {isFiltered && <span className="text-[#8c2d3c] font-medium ml-1">(filtered)</span>}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[#8c2d3c] hover:underline font-bold text-xs inline-flex items-center gap-1"
            >
              <X className="size-3" /> Reset all filters
            </button>
          )}
        </div>

        {visible.length ? (
          <div className="overflow-x-auto rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-black/12 bg-black/[0.02]">
                  <Th>Full Name</Th>
                  <Th>Email Address</Th>
                  <Th>Phone Number</Th>
                  <Th>Organization</Th>
                  <Th>Current Role</Th>
                  <Th>City / Region</Th>
                  <Th>Membership Category</Th>
                  <Th>Required Fee</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} className="border-b border-black/8 last:border-0 hover:bg-black/[0.015] transition-colors">
                    <Td>
                      <strong className="font-bold text-black whitespace-nowrap block">
                        {row.full_name}
                      </strong>
                    </Td>
                    <Td>
                      <a
                        href={`mailto:${row.email}`}
                        className="text-[#8c2d3c] hover:underline font-medium break-all"
                      >
                        {row.email}
                      </a>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap font-mono text-xs text-black/80">
                        {row.phone_number || "—"}
                      </span>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap text-black/80">
                        {row.outlet_or_institution || "—"}
                      </span>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap text-black/80">
                        {row.current_position || "—"}
                      </span>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap text-black/80">
                        {row.region_or_chapter || (row.dynamic_data?.citySubCity ?? "—")}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-semibold text-black">
                          {types.find((x) => x.id === row.membership_type_id)?.name ?? "Unknown"}
                        </span>
                        {Boolean(getMemberPaymentScreenshot(row)) && (
                          <span
                            title="Payment receipt / screenshot attached"
                            className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200"
                          >
                            <ImageIcon className="size-3" /> Receipt
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap font-mono text-xs font-bold text-[#8c2d3c]">
                        {getMemberFeeText(row, types)}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge value={row.status} />
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap font-mono text-xs text-black/60">
                        {fmtDate(row.created_at)}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMember(row)}
                          title="View complete application details"
                          className="inline-flex items-center gap-1 border border-black/15 bg-white px-2.5 py-1.5 font-[var(--font-body)] text-xs font-semibold text-black hover:bg-black hover:text-white transition rounded"
                        >
                          <Eye className="size-3.5" /> Details
                        </button>

                        {row.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={busy === row.id + "APPROVED"}
                              onClick={() => void review(row.id, "APPROVED")}
                              className="inline-flex items-center bg-[#8c2d3c] px-2.5 py-1.5 font-[var(--font-body)] text-xs font-bold text-white hover:bg-[#6f2230] transition rounded disabled:opacity-50"
                            >
                              {busy === row.id + "APPROVED" ? "…" : "Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={busy === row.id + "REJECTED"}
                              onClick={() => void review(row.id, "REJECTED")}
                              className="inline-flex items-center border border-black/20 bg-white px-2.5 py-1.5 font-[var(--font-body)] text-xs font-bold text-black hover:bg-black/5 transition rounded disabled:opacity-50"
                            >
                              {busy === row.id + "REJECTED" ? "…" : "Reject"}
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={busy === row.id + "DELETE"}
                          onClick={() => void remove(row)}
                          title="Delete application"
                          className="inline-flex items-center justify-center p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800 transition rounded disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState text="No membership requests match this view" />
        )}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
          onMouseDown={() => setSelectedMember(null)}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-2xl bg-[#fbf9f4] shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5 sm:px-8">
              <div>
                <p className="label-mono text-[#8c2d3c]">Membership Application</p>
                <h2 className="mt-1 text-2xl font-black text-black">
                  {selectedMember.full_name}
                </h2>
                <p className="text-xs text-black/55">
                  Applied on {new Date(selectedMember.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-black/15 text-black hover:bg-black hover:text-white"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Full Name</span>
                  <strong className="text-black text-sm">{selectedMember.full_name}</strong>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Email Address</span>
                  <a href={`mailto:${selectedMember.email}`} className="text-[#8c2d3c] text-sm hover:underline font-medium">
                    {selectedMember.email}
                  </a>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Phone Number</span>
                  <span className="text-black text-sm">{selectedMember.phone_number || "—"}</span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Membership Category</span>
                  <span className="text-black font-semibold text-sm">
                    {types.find((x) => x.id === selectedMember.membership_type_id)?.name ?? "Unknown"}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Required Membership Fee</span>
                  <span className="text-[#8c2d3c] font-bold text-sm font-mono">
                    {getMemberFeeText(selectedMember, types)}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Organization</span>
                  <span className="text-black text-sm">{selectedMember.outlet_or_institution || "—"}</span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Current Role</span>
                  <span className="text-black text-sm">{selectedMember.current_position || "—"}</span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Location / Sub-city</span>
                  <span className="text-black text-sm">
                    {[
                      selectedMember.region_or_chapter || selectedMember.dynamic_data?.citySubCity,
                      selectedMember.dynamic_data?.woreda,
                      selectedMember.dynamic_data?.houseNumber,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/10">
                  <span className="label-mono text-black/45 text-[10px] block">Status</span>
                  <div className="mt-1">
                    <StatusBadge value={selectedMember.status} />
                  </div>
                </div>
              </div>

              {/* Dynamic details */}
              {selectedMember.dynamic_data && (
                <div className="space-y-4 pt-2 border-t border-black/10">
                  <h4 className="label-mono text-[#8c2d3c]">Additional Application Details</h4>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    {selectedMember.dynamic_data.dateOfBirth && (
                      <div>
                        <span className="text-black/50 block">Date of Birth:</span>
                        <span className="font-semibold text-black">{selectedMember.dynamic_data.dateOfBirth}</span>
                      </div>
                    )}
                    {selectedMember.dynamic_data.yearsOfExperience !== undefined && (
                      <div>
                        <span className="text-black/50 block">Years of Experience:</span>
                        <span className="font-semibold text-black">{selectedMember.dynamic_data.yearsOfExperience} years</span>
                      </div>
                    )}
                    {selectedMember.dynamic_data.educationLevel && (
                      <div>
                        <span className="text-black/50 block">Education Level:</span>
                        <span className="font-semibold text-black">{selectedMember.dynamic_data.educationLevel}</span>
                      </div>
                    )}
                    {selectedMember.dynamic_data.fieldOfStudy && (
                      <div>
                        <span className="text-black/50 block">Field of Study:</span>
                        <span className="font-semibold text-black">{selectedMember.dynamic_data.fieldOfStudy}</span>
                      </div>
                    )}
                    {selectedMember.dynamic_data.companyPhone && (
                      <div>
                        <span className="text-black/50 block">Company Phone:</span>
                        <span className="font-semibold text-black">{selectedMember.dynamic_data.companyPhone}</span>
                      </div>
                    )}
                    {selectedMember.dynamic_data.emergencyContact1 && (
                      <div>
                        <span className="text-black/50 block">Emergency Contact 1:</span>
                        <span className="font-semibold text-black">
                          {selectedMember.dynamic_data.emergencyContact1.name} (
                          {selectedMember.dynamic_data.emergencyContact1.phone})
                        </span>
                      </div>
                    )}
                    {selectedMember.dynamic_data.emergencyContact2 && (
                      <div>
                        <span className="text-black/50 block">Emergency Contact 2:</span>
                        <span className="font-semibold text-black">
                          {selectedMember.dynamic_data.emergencyContact2.name} (
                          {selectedMember.dynamic_data.emergencyContact2.phone})
                        </span>
                      </div>
                    )}
                  </div>

                  {Array.isArray(selectedMember.dynamic_data.additionalPhones) &&
                    selectedMember.dynamic_data.additionalPhones.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-black/5">
                        <span className="text-black/50 text-xs block mb-1">Additional Phone Numbers:</span>
                        <div className="space-y-1">
                          {selectedMember.dynamic_data.additionalPhones.map((p: any, idx: number) => (
                            <div key={idx} className="text-xs bg-white p-2 rounded border border-black/10 flex justify-between">
                              <span className="font-medium text-black/70">{p.label || p.type}:</span>
                              <span className="font-bold text-black">{p.number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedMember.dynamic_data.additionalSkills && (
                    <div className="mt-3">
                      <span className="text-black/50 text-xs block">Additional Skills & Background:</span>
                      <p className="text-xs text-black/80 mt-1 bg-white p-3 rounded border border-black/10">
                        {selectedMember.dynamic_data.additionalSkills}
                      </p>
                    </div>
                  )}
                  {(() => {
                    const screenshotSrc = getMemberPaymentScreenshot(selectedMember);
                    if (!screenshotSrc) return null;
                    const fileName =
                      selectedMember.dynamic_data?.paymentConfirmation?.fileName ||
                      `${selectedMember.full_name}-payment-receipt.png`;

                    return (
                      <div className="mt-4 border-t border-black/10 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="label-mono text-[#8c2d3c] flex items-center gap-1.5 font-bold">
                            <ImageIcon className="size-4" /> Bank Payment Confirmation Screenshot
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  src: screenshotSrc,
                                  title: `${selectedMember.full_name} — Payment Receipt`,
                                })
                              }
                              className="text-xs font-semibold text-[#8c2d3c] hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                            >
                              <Eye className="size-3.5" /> Full View
                            </button>
                            <span className="text-black/30">·</span>
                            <button
                              type="button"
                              onClick={() => openInNewTab(screenshotSrc)}
                              className="text-xs font-semibold text-black/70 hover:text-black hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                            >
                              <ArrowRight className="size-3.5" /> New Tab
                            </button>
                            <span className="text-black/30">·</span>
                            <button
                              type="button"
                              onClick={() => downloadReceipt(screenshotSrc, selectedMember.full_name)}
                              className="text-xs font-semibold text-black/70 hover:text-black hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                            >
                              <Download className="size-3.5" /> Download
                            </button>
                          </div>
                        </div>

                        <div
                          onClick={() =>
                            setLightboxImage({
                              src: screenshotSrc,
                              title: `${selectedMember.full_name} — Payment Receipt`,
                            })
                          }
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-black/10 bg-white p-2 transition hover:border-[#8c2d3c]/50 hover:shadow-md"
                        >
                          <img
                            src={screenshotSrc}
                            alt={`Payment confirmation submitted by ${selectedMember.full_name}`}
                            className="max-h-80 w-full rounded-lg object-contain bg-black/[0.02] transition group-hover:scale-[1.01]"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100 rounded-xl">
                            <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-black shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                              <Eye className="size-4" /> Click to enlarge
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-black/50">
                          {fileName} · Click image to expand in full size
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-6 py-4 sm:px-8 bg-black/[0.02]">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="border border-black/20 px-4 py-2 text-xs font-bold text-black hover:bg-black/5 rounded"
              >
                Close
              </button>

              <div className="flex gap-2">
                {selectedMember.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      disabled={busy === selectedMember.id + "REJECTED"}
                      onClick={() => void review(selectedMember.id, "REJECTED")}
                      className="border border-black/20 bg-white px-4 py-2 text-xs font-bold text-black hover:bg-black/5 rounded disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busy === selectedMember.id + "APPROVED"}
                      onClick={() => void review(selectedMember.id, "APPROVED")}
                      className="bg-[#8c2d3c] px-4 py-2 text-xs font-bold text-white hover:bg-[#6f2230] rounded disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Lightbox / High-Res Image Preview Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[200] grid place-items-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative flex max-h-[92vh] max-w-5xl w-full flex-col items-center rounded-2xl bg-[#1a1a1a] p-4 text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-xs text-white/80 truncate max-w-md">
                {lightboxImage.title}
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => openInNewTab(lightboxImage.src)}
                  className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white hover:underline bg-white/10 px-3 py-1.5 rounded"
                >
                  <ArrowRight className="size-3.5" /> New tab
                </button>
                <button
                  type="button"
                  onClick={() => downloadReceipt(lightboxImage.src, lightboxImage.title)}
                  className="inline-flex items-center gap-1 rounded bg-[#8c2d3c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#6f2230]"
                >
                  <Download className="size-3.5" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="grid size-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex max-h-[78vh] w-full items-center justify-center overflow-auto rounded-lg bg-black/40 p-2">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[72vh] w-auto max-w-full rounded object-contain shadow"
              />
            </div>
          </div>
        </div>
      )}
    </PagePanel>
  );
}

function MembershipTypesPanel({
  rows,
  token,
  reload,
}: {
  rows: MembershipType[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    requirements: "",
    hasFee: false,
    priceAmount: "",
    currency: "ETB",
  });
  const [editing, setEditing] = useState<MembershipType | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const priceNum = form.hasFee && form.priceAmount.trim() ? Number(form.priceAmount) : 0;

    try {
      await adminApi(
        editing ? `/admin/membership-types/${editing.id}` : "/admin/membership-types",
        token,
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            requirements: form.requirements.trim(),
            priceAmount: priceNum,
            price: priceNum,
            currency: form.currency || "ETB",
            isActive: editing?.is_active ?? true,
          }),
        },
      );
      setForm({
        name: "",
        description: "",
        requirements: "",
        hasFee: false,
        priceAmount: "",
        currency: "ETB",
      });
      setEditing(null);
      await reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Unable to ${editing ? "update" : "create"} membership type`,
      );
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (row: MembershipType) => {
    setEditing(row);
    const numPrice = Number(row.price_amount) || 0;
    setForm({
      name: row.name,
      description: row.description ?? "",
      requirements: row.requirements ?? "",
      hasFee: numPrice > 0,
      priceAmount: numPrice > 0 ? String(numPrice) : "",
      currency: row.currency || "ETB",
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      requirements: "",
      hasFee: false,
      priceAmount: "",
      currency: "ETB",
    });
    setError("");
  };

  const remove = async (row: MembershipType) => {
    if (!window.confirm(`Delete the "${row.name}" membership type? Existing applications will remain.`))
      return;
    setDeleting(row.id);
    setError("");
    try {
      await adminApi(`/admin/membership-types/${row.id}`, token, { method: "DELETE" });
      if (editing?.id === row.id) cancelEdit();
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete membership type");
    } finally {
      setDeleting("");
    }
  };

  return (
    <PagePanel
      title="Membership types"
      subtitle="Define the membership paths applicants can choose and their respective fee amounts."
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)]">
        <form
          onSubmit={submit}
          className="h-fit rounded-2xl bg-[#191715] p-6 sm:p-7 text-white shadow-xl space-y-4"
        >
          <p className="label-mono text-[#e4ab3a]">
            {editing ? "Edit category" : "Add a category"}
          </p>
          <h3 className="mt-1 text-2xl font-black">
            {editing ? `Edit ${editing.name}` : "New membership type"}
          </h3>
          <p className="font-[var(--font-body)] text-xs leading-5 text-white/50">
            Define eligibility, membership requirements, and pricing fees.
          </p>

          <div className="mt-4 grid gap-4">
            <PublicationInput
              label="Name"
              placeholder="e.g. Full Member"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <PublicationTextarea
              label="Description"
              placeholder="Brief description of this membership category"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <PublicationTextarea
              label="Requirements"
              placeholder="Eligibility and requirements"
              rows={3}
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            />

            {/* Fee Configuration */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <label className="label-mono text-white/70 text-xs block">Membership Fee</label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, hasFee: false, priceAmount: "" })}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-3 text-xs font-bold transition ${
                    !form.hasFee
                      ? "bg-[#e4ab3a] text-black shadow font-black"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  <Check className={`size-3.5 ${!form.hasFee ? "opacity-100" : "opacity-0"}`} />
                  No Fee (Free)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      hasFee: true,
                      priceAmount: form.priceAmount || "600",
                    })
                  }
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-3 text-xs font-bold transition ${
                    form.hasFee
                      ? "bg-[#8c2d3c] text-white shadow font-black"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  <Plus className={`size-3.5 ${form.hasFee ? "opacity-100" : "opacity-0"}`} />
                  Paid Fee
                </button>
              </div>

              {form.hasFee && (
                <div className="grid grid-cols-[1fr_auto] gap-3 pt-1">
                  <label className="block">
                    <span className="label-mono text-white/50 text-[10px] block mb-1">
                      Price / Amount *
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required={form.hasFee}
                      placeholder="e.g. 600"
                      value={form.priceAmount}
                      onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                      className="w-full rounded-lg border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#e4ab3a]"
                    />
                  </label>
                  <label className="block w-28">
                    <span className="label-mono text-white/50 text-[10px] block mb-1">
                      Currency
                    </span>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="w-full rounded-lg border border-white/20 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e4ab3a]"
                    >
                      <option value="ETB">ETB (Ethiopian Birr)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="KES">KES (Kenyan Shilling)</option>
                      <option value="CAD">CAD (Canadian Dollar)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                      <option value="CHF">CHF (Swiss Franc)</option>
                      <option value="AUD">AUD (Australian Dollar)</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <button
            disabled={busy}
            className="mt-4 flex w-full items-center justify-between bg-[#8c2d3c] px-5 py-3.5 font-[var(--font-body)] text-sm font-bold text-white transition hover:bg-[#a53b4d] disabled:opacity-50"
          >
            <span>{busy ? "Saving…" : editing ? "Save changes" : "Create membership type"}</span>
            <ArrowRight className="size-4" />
          </button>
          {editing && (
            <button
              type="button"
              disabled={busy}
              onClick={cancelEdit}
              className="flex w-full items-center justify-center border border-white/25 px-5 py-3 font-[var(--font-body)] text-sm font-bold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel editing
            </button>
          )}
        </form>

        <div className="space-y-3">
          {rows.map((row, index) => (
            <article
              key={row.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 rounded-2xl border border-black/10 bg-[#fbf9f4] p-5 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <span className="label-mono text-[#8c2d3c]">0{index + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black">{row.name}</h3>
                  {Number(row.price_amount) === 0 ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      No Fee (Free)
                    </span>
                  ) : (
                    <span className="rounded bg-rose-50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#8c2d3c] border border-rose-200">
                      {row.currency ?? "ETB"} {Number(row.price_amount).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-[var(--font-body)] text-sm text-black/55">
                  {row.description}
                </p>
                <p className="mt-3 label-mono text-black/35">{row.requirements}</p>
              </div>
              <div className="col-start-2 text-left sm:col-start-auto sm:text-right">
                <strong className="font-[var(--font-body)] block font-mono">
                  {Number(row.price_amount) === 0
                    ? "Free"
                    : `${row.currency ?? "ETB"} ${Number(row.price_amount).toLocaleString()}`}
                </strong>
                <p className="mt-2 label-mono text-emerald-700">
                  {row.is_active ? "Active" : "Inactive"}
                </p>
                <div className="mt-3 flex items-center gap-3 sm:justify-end">
                  <button
                    type="button"
                    disabled={busy || deleting === row.id}
                    onClick={() => beginEdit(row)}
                    className="flex items-center gap-1 font-[var(--font-body)] text-xs text-[#8c2d3c] hover:text-[#6f2230] disabled:opacity-50"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={deleting === row.id}
                    onClick={() => void remove(row)}
                    className="flex items-center gap-1 font-[var(--font-body)] text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" />
                    {deleting === row.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PagePanel>
  );
}

function UpdatesPanel({
  rows,
  token,
  reload,
  setRows,
}: {
  rows: UpdatePost[];
  token: string;
  reload: () => Promise<void>;
  setRows: React.Dispatch<React.SetStateAction<UpdatePost[]>>;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UpdatePost | null>(null);
  const [preview, setPreview] = useState<UpdatePost | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PublishStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const demo = token === "frontend-demo-session";

  const [blocks, setBlocks] = useState<UpdateBlock[]>([
    { id: crypto.randomUUID(), type: "text", content: "", url: "", caption: "" },
  ]);

  const isModalOpen = creating || editing !== null;

  const openCreateModal = () => {
    setEditing(null);
    setBlocks([{ id: crypto.randomUUID(), type: "text", content: "", url: "", caption: "" }]);
    setError("");
    setCreating(true);
  };

  const openEditModal = (row: UpdatePost) => {
    setCreating(false);
    setError("");
    setEditing(row);
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    setError("");
  };

  useEffect(() => {
    if (editing) {
      if (editing.blocks && editing.blocks.length > 0) {
        setBlocks(
          editing.blocks.map((b) => ({
            id: b.id || crypto.randomUUID(),
            type: b.type === "image" ? "image" : "text",
            content: b.content || "",
            url: b.url || "",
            caption: b.caption || "",
          })),
        );
      } else if (editing.content) {
        const paras = editing.content.split(/\n{2,}/).filter(Boolean);
        setBlocks(
          paras.length > 0
            ? paras.map((p) => ({
                id: crypto.randomUUID(),
                type: "text",
                content: p,
                url: "",
                caption: "",
              }))
            : [{ id: crypto.randomUUID(), type: "text", content: editing.content, url: "", caption: "" }],
        );
      } else {
        setBlocks([{ id: crypto.randomUUID(), type: "text", content: "", url: "", caption: "" }]);
      }
    }
  }, [editing]);

  const addTextBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "text", content: "", url: "", caption: "" },
    ]);
  };

  const addImageBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "image", content: "", url: "", caption: "" },
    ]);
  };

  const updateBlock = (id: string, updates: Partial<UpdateBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index]!;
      copy[index] = copy[target]!;
      copy[target] = temp;
      return copy;
    });
  };

  const handleBlockImageFile = async (id: string, file: File) => {
    try {
      const { dataUrl } = await compressImageFile(file, 1400, 0.78);
      updateBlock(id, { url: dataUrl });
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateBlock(id, { url: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("isFeatured", data.has("isFeatured") ? "true" : "false");
    data.set("authorName", editing?.author_name || "EMWA Editorial Desk");

    const featuredImage = data.get("featuredImage");
    if (featuredImage instanceof File && featuredImage.size > 0) {
      if (featuredImage.size > 1.5 * 1024 * 1024) {
        const { file: compressedCover } = await compressImageFile(featuredImage, 1920, 0.82);
        data.set("featuredImage", compressedCover);
      }
    }

    // Clean blocks and format for backend
    const cleanBlocks = blocks.map((b, idx) => ({
      position: idx,
      type: b.type,
      content: b.type === "text" ? b.content?.trim() || "" : null,
      url: b.type === "image" ? b.url?.trim() || "" : null,
      caption: b.type === "image" ? b.caption?.trim() || null : null,
    }));
    data.set("blocks", JSON.stringify(cleanBlocks));

    const derivedContent =
      blocks
        .filter((b) => b.type === "text" && b.content?.trim())
        .map((b) => b.content?.trim())
        .join("\n\n") || String(data.get("excerpt") || "");
    data.set("content", derivedContent);

    try {
      if (demo) {
        const now = new Date().toISOString();
        const next: UpdatePost = {
          id: editing?.id ?? crypto.randomUUID(),
          title: String(data.get("title")),
          slug: String(data.get("slug") || data.get("title"))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          excerpt: String(data.get("excerpt")),
          content: derivedContent,
          content_type: String(data.get("contentType")) as UpdatePost["content_type"],
          video_url: String(data.get("videoUrl") || "") || undefined,
          author_name: String(data.get("authorName")),
          status: String(data.get("status")) as PublishStatus,
          is_featured: data.get("isFeatured") === "true",
          published_at: data.get("status") === "PUBLISHED" ? now : undefined,
          created_at: editing?.created_at ?? now,
          blocks: cleanBlocks as UpdateBlock[],
        };
        setRows((current) =>
          [next, ...current.filter((row) => row.id !== next.id)].map((row) =>
            next.is_featured && next.status === "PUBLISHED" && row.id !== next.id
              ? { ...row, is_featured: false }
              : row,
          ),
        );
      } else {
        await adminApi(editing ? `/admin/updates/${editing.id}` : "/admin/updates", token, {
          method: editing ? "PATCH" : "POST",
          body: data,
        });
        await reload();
      }
      form.reset();
      closeModal();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save update");
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (row: UpdatePost, status: PublishStatus) => {
    if (demo) {
      setRows((current) =>
        current.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status,
                published_at: status === "PUBLISHED" ? new Date().toISOString() : undefined,
              }
            : item,
        ),
      );
      return;
    }
    const data = new FormData();
    data.set("status", status);
    await adminApi(`/admin/updates/${row.id}`, token, { method: "PATCH", body: data });
    await reload();
  };

  const remove = async (row: UpdatePost) => {
    if (!window.confirm(`Delete “${row.title}”?`)) return;
    if (demo) setRows((current) => current.filter((item) => item.id !== row.id));
    else {
      await adminApi(`/admin/updates/${row.id}`, token, { method: "DELETE" });
      await reload();
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery =
        !query.trim() ||
        row.title.toLowerCase().includes(query.toLowerCase()) ||
        row.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        row.author_name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || row.status === statusFilter;
      const matchesType = typeFilter === "ALL" || row.content_type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [rows, query, statusFilter, typeFilter]);

  return (
    <PagePanel
      title="Updates"
      subtitle="Write, compose with ordered text & image blocks, preview, and publish newsroom content."
    >
      {/* Top Filter and Action Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-[#e9e3d9] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <label className="flex flex-1 min-w-[200px] items-center gap-3 rounded-xl bg-[#fbf9f4] px-4 py-2.5 shadow-sm">
            <Search className="size-4 text-black/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search updates by title, excerpt..."
              className="w-full bg-transparent font-[var(--font-body)] text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-black/40 hover:text-black"
              >
                Clear
              </button>
            )}
          </label>

          <Select
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            options={[
              { value: "ALL", label: "All Content Types" },
              { value: "NEWS", label: "News" },
              { value: "PRESS", label: "Press Release" },
              { value: "ARTICLE", label: "Article" },
              { value: "PHOTO", label: "Photo Feature" },
              { value: "VIDEO", label: "Video Story" },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as "ALL" | PublishStatus)}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "PUBLISHED", label: "Published" },
              { value: "DRAFT", label: "Draft" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8c2d3c] px-5 py-3 font-[var(--font-body)] text-sm font-bold text-white shadow-lg transition hover:bg-[#6e222e] active:scale-98 shrink-0"
        >
          <Plus className="size-4" />
          <span>Create Update</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-black/60 font-mono">
        <div>
          Showing <strong>{filteredRows.length}</strong> of <strong>{rows.length}</strong> updates
          {(query || statusFilter !== "ALL" || typeFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("ALL");
                setTypeFilter("ALL");
              }}
              className="ml-2 text-[#8c2d3c] underline hover:text-[#6e222e]"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Updates */}
      {filteredRows.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((row) => (
            <article
              key={row.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm transition hover:shadow-md hover:border-black/20"
            >
              <div>
                {row.featured_image_url ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/5 border-b border-black/10">
                    <img
                      src={uploadUrl(row.featured_image_url)}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="rounded bg-black/75 backdrop-blur px-2.5 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                        {row.content_type}
                      </span>
                      {row.is_featured && (
                        <span className="rounded bg-[#e4ab3a] px-2.5 py-1 font-mono text-[10px] font-bold text-black uppercase tracking-wider">
                          Lead Story
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge value={row.status} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-b border-black/10 bg-black/[0.02] p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-black/10 px-2 py-0.5 font-mono text-[10px] font-bold text-black/70 uppercase">
                        {row.content_type}
                      </span>
                      {row.is_featured && (
                        <span className="rounded bg-[#e4ab3a]/30 text-[#8c2d3c] px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                          Lead
                        </span>
                      )}
                    </div>
                    <StatusBadge value={row.status} />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-black/45 font-mono mb-2">
                    <span>{fmtDate(row.published_at || row.created_at)}</span>
                    <span>•</span>
                    <span className="rounded bg-black/5 px-2 py-0.5 font-bold text-black/60">
                      {row.blocks && row.blocks.length > 0 ? `${row.blocks.length} blocks` : "1 block"}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-black/90 line-clamp-2 leading-tight">
                    {row.title}
                  </h3>
                  <p className="mt-2 font-[var(--font-body)] text-sm leading-6 text-black/60 line-clamp-3">
                    {row.excerpt}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/10 p-4 bg-white/40">
                <div className="flex flex-wrap gap-2">
                  <ActionButton label="Preview" onClick={() => setPreview(row)} variant="outline" />
                  <ActionButton label="Edit" onClick={() => openEditModal(row)} variant="outline" />
                  {row.status !== "PUBLISHED" && (
                    <ActionButton
                      label="Publish"
                      onClick={() => void changeStatus(row, "PUBLISHED")}
                    />
                  )}
                  {row.status === "PUBLISHED" && (
                    <ActionButton
                      label="Archive"
                      onClick={() => void changeStatus(row, "ARCHIVED")}
                      variant="outline"
                    />
                  )}
                </div>
                <button
                  onClick={() => void remove(row)}
                  aria-label={`Delete ${row.title}`}
                  className="grid size-8 place-items-center rounded border border-red-200 text-red-700 hover:bg-red-50 transition"
                  title="Delete update"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          text={rows.length ? "No updates match your search filter" : "No updates have been created yet"}
        />
      )}

      {/* Creation & Editing Popup Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative my-auto w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#191715] p-6 sm:p-8 text-white shadow-2xl border border-white/15"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <p className="label-mono text-[#e4ab3a]">
                  {editing ? "Update Story" : "New Publication"}
                </p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-black">
                  {editing ? "Edit story" : "Create an update"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form key={editing?.id ?? "new"} onSubmit={submit} className="space-y-6">
              <div className="grid gap-4">
                <PublicationInput
                  name="title"
                  label="Title"
                  defaultValue={editing?.title}
                  placeholder="Enter update headline..."
                  minLength={3}
                  maxLength={220}
                  required
                />
                <PublicationInput
                  name="slug"
                  label="Custom slug (optional)"
                  defaultValue={editing?.slug}
                  placeholder="auto-generated-from-title"
                  minLength={3}
                  maxLength={240}
                />
                <PublicationTextarea
                  name="excerpt"
                  label="Short excerpt"
                  defaultValue={editing?.excerpt}
                  placeholder="Brief 1-2 sentence overview for the cards feed..."
                  rows={2}
                  minLength={10}
                  maxLength={1000}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <PublicationSelect
                    name="contentType"
                    label="Content type"
                    defaultValue={editing?.content_type ?? "NEWS"}
                    options={[
                      { value: "NEWS", label: "News" },
                      { value: "PRESS", label: "Press Release" },
                      { value: "ARTICLE", label: "Article" },
                      { value: "PHOTO", label: "Photo Feature" },
                      { value: "VIDEO", label: "Video Story" },
                    ]}
                  />
                  <PublicationSelect
                    name="status"
                    label="Status"
                    defaultValue={editing?.status ?? "DRAFT"}
                    options={[
                      { value: "DRAFT", label: "Draft" },
                      { value: "PUBLISHED", label: "Published (Live immediately)" },
                      { value: "ARCHIVED", label: "Archived" },
                    ]}
                  />
                  <PublicationInput
                    name="videoUrl"
                    label="Video URL (optional)"
                    defaultValue={editing?.video_url}
                    placeholder="https://youtube.com/..."
                    type="url"
                  />
                  <label className="flex items-center gap-3 font-[var(--font-body)] text-sm text-white/75 pt-6">
                    <input
                      name="isFeatured"
                      type="checkbox"
                      defaultChecked={editing?.is_featured}
                      className="size-4 accent-[#e4ab3a]"
                    />{" "}
                    Featured Lead Story
                  </label>
                </div>

                <label className="block">
                  <span className="label-mono text-white/45">Featured Cover Image</span>
                  <input
                    name="featuredImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 w-full text-sm file:mr-3 file:border-0 file:bg-[#8c2d3c] file:px-3 file:py-2 file:text-white file:rounded-lg"
                  />
                </label>
              </div>

              {/* Block Content Builder */}
              <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-[#e4ab3a]" />
                    <span className="font-bold text-sm text-white">Article Content Blocks</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/70">
                      {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addTextBlock}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition"
                      title="Add text paragraph"
                    >
                      <Type className="size-3.5" /> + Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={addImageBlock}
                      className="flex items-center gap-1.5 rounded-lg bg-[#e4ab3a] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#d59c2b] transition"
                      title="Add captioned image"
                    >
                      <ImageIcon className="size-3.5" /> + Image
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3 transition"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#e4ab3a]">
                            #{index + 1}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              block.type === "image"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {block.type === "image" ? "Captioned Image" : "Text Paragraph"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveBlock(index, -1)}
                            className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20 transition"
                            title="Move block up"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === blocks.length - 1}
                            onClick={() => moveBlock(index, 1)}
                            className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20 transition"
                            title="Move block down"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          {blocks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="rounded p-1 text-red-400 hover:bg-red-500/20 hover:text-red-300 ml-1 transition"
                              title="Delete block"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {block.type === "text" ? (
                        <textarea
                          rows={4}
                          value={block.content || ""}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Write your paragraph text here..."
                          className="w-full rounded-lg border border-white/15 bg-black/50 p-3 text-sm text-white outline-none focus:border-[#e4ab3a] font-[var(--font-body)] leading-6 placeholder:text-white/25"
                        />
                      ) : (
                        <div className="space-y-3">
                          {block.url && (
                            <div className="relative aspect-[16/9] max-h-52 overflow-hidden rounded-lg border border-white/15 bg-black/60">
                              <img
                                src={uploadUrl(block.url)}
                                alt={block.caption || "Image block"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block">
                              <span className="label-mono text-white/50 text-[10px] block mb-1">
                                Upload image file
                              </span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleBlockImageFile(block.id, file);
                                }}
                                className="w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:px-2.5 file:py-1.5 file:text-white"
                              />
                            </label>
                            <label className="block">
                              <span className="label-mono text-white/50 text-[10px] block mb-1">
                                Or paste image URL
                              </span>
                              <input
                                type="url"
                                value={block.url?.startsWith("data:") ? "" : block.url || ""}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-[#e4ab3a]"
                              />
                            </label>
                          </div>

                          <label className="block">
                            <span className="label-mono text-white/50 text-[10px] block mb-1">
                              Caption (Optional description)
                            </span>
                            <input
                              type="text"
                              value={block.caption || ""}
                              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                              placeholder="e.g. EMWA members during the national consultation workshop"
                              className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-[#e4ab3a]"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white/70 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-[#8c2d3c] px-6 py-3 font-bold text-white hover:bg-[#a53b4d] disabled:opacity-50 transition shadow-lg"
                >
                  {busy ? "Saving…" : editing ? "Save changes" : "Publish Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Preview Modal */}
      {preview && (
        <ContentPreview
          title={preview.title}
          image={preview.featured_image_url}
          eyebrow={preview.content_type}
          body={preview.content}
          blocks={preview.blocks}
          onClose={() => setPreview(null)}
        />
      )}
    </PagePanel>
  );
}

function EventsPanel({
  rows,
  token,
  reload,
  setRows,
}: {
  rows: AdminEvent[];
  token: string;
  reload: () => Promise<void>;
  setRows: React.Dispatch<React.SetStateAction<AdminEvent[]>>;
}) {
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const demo = token === "frontend-demo-session";
  const localDate = (value?: string) => (value ? new Date(value).toISOString().slice(0, 16) : "");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await optimizeEventImage(data);
      if (demo) {
        const now = new Date().toISOString();
        const next: AdminEvent = {
          id: editing?.id ?? crypto.randomUUID(),
          title: String(data.get("title")),
          slug: String(data.get("slug") || data.get("title"))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          description: String(data.get("description")),
          event_type: String(data.get("eventType")),
          location: String(data.get("location")),
          starts_at: new Date(String(data.get("startsAt"))).toISOString(),
          ends_at: data.get("endsAt")
            ? new Date(String(data.get("endsAt"))).toISOString()
            : undefined,
          registration_url: String(data.get("registrationUrl") || "") || undefined,
          capacity_status: String(data.get("capacityStatus")) as AdminEvent["capacity_status"],
          status: String(data.get("status")) as PublishStatus,
          created_at: editing?.created_at ?? now,
        };
        setRows((current) => [next, ...current.filter((row) => row.id !== next.id)]);
      } else {
        await adminApi(editing ? `/admin/events/${editing.id}` : "/admin/events", token, {
          method: editing ? "PATCH" : "POST",
          body: data,
        });
        await reload();
      }
      form.reset();
      setEditing(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save event");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: AdminEvent) => {
    if (!window.confirm(`Delete “${row.title}”?`)) return;
    if (demo) setRows((current) => current.filter((item) => item.id !== row.id));
    else {
      await adminApi(`/admin/events/${row.id}`, token, { method: "DELETE" });
      await reload();
    }
  };
  const changeStatus = async (row: AdminEvent, status: PublishStatus) => {
    if (demo) {
      setRows((current) =>
        current.map((item) => (item.id === row.id ? { ...item, status } : item)),
      );
      return;
    }
    const data = new FormData();
    data.set("status", status);
    await adminApi(`/admin/events/${row.id}`, token, { method: "PATCH", body: data });
    await reload();
  };

  return (
    <PagePanel
      title="Events"
      subtitle="Create gatherings, registration opportunities, and public calendar entries."
    >
      <div className="grid gap-7 xl:grid-cols-[minmax(320px,.72fr)_minmax(0,1.28fr)]">
        <form
          key={editing?.id ?? "new-event"}
          onSubmit={submit}
          className="h-fit rounded-2xl bg-[#191715] p-6 text-white shadow-xl"
        >
          <p className="label-mono text-[#e4ab3a]">{editing ? "Edit event" : "New event"}</p>
          <h3 className="mt-3 text-3xl font-black">
            {editing ? editing.title : "Add to the calendar"}
          </h3>
          <div className="mt-7 grid gap-4">
            <PublicationInput name="title" label="Title" defaultValue={editing?.title} required />
            <PublicationInput
              name="slug"
              label="Custom slug (optional)"
              defaultValue={editing?.slug}
            />
            <PublicationTextarea
              name="description"
              label="Description"
              defaultValue={editing?.description}
              rows={5}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PublicationInput
                name="eventType"
                label="Event type"
                defaultValue={editing?.event_type}
                required
              />
              <PublicationInput
                name="location"
                label="Location"
                defaultValue={editing?.location}
                required
              />
              <PublicationInput
                name="startsAt"
                label="Starts"
                type="datetime-local"
                defaultValue={localDate(editing?.starts_at)}
                required
              />
              <PublicationInput
                name="endsAt"
                label="Ends (optional)"
                type="datetime-local"
                defaultValue={localDate(editing?.ends_at)}
              />
              <PublicationSelect
                name="capacityStatus"
                label="Capacity"
                defaultValue={editing?.capacity_status ?? "AVAILABLE"}
                options={["AVAILABLE", "AT_CAPACITY", "CANCELLED"]}
              />
              <PublicationSelect
                name="status"
                label="Status"
                defaultValue={editing?.status ?? "DRAFT"}
                options={["DRAFT", "PUBLISHED", "ARCHIVED"]}
              />
            </div>
            <PublicationInput
              name="registrationUrl"
              label="Registration URL (optional)"
              type="url"
              defaultValue={editing?.registration_url}
            />
            <label>
              <span className="label-mono text-white/45">Featured image</span>
              <input
                name="featuredImage"
                type="file"
                accept="image/jpeg,image/png"
                className="mt-2 w-full text-sm file:mr-3 file:border-0 file:bg-[#8c2d3c] file:px-3 file:py-2 file:text-white"
              />
            </label>
          </div>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <div className="mt-6 flex gap-2">
            <button
              disabled={busy}
              className="flex-1 bg-[#8c2d3c] px-4 py-3 font-bold disabled:opacity-50"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create event"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="border border-white/20 px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="space-y-3">
          {rows.length ? (
            rows.map((row) => (
              <article
                key={row.id}
                className="overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] p-5 shadow-sm"
              >
                {row.featured_image_url && (
                  <div className="-mx-5 -mt-5 mb-5 aspect-[16/7] overflow-hidden border-b border-black/10 bg-black/5">
                    <img
                      src={uploadUrl(row.featured_image_url)}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.parentElement?.remove();
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="label-mono text-[#8c2d3c]">{row.event_type}</p>
                    <h3 className="mt-2 text-2xl font-black">{row.title}</h3>
                    <p className="mt-2 font-[var(--font-body)] text-sm text-black/55">
                      {fmtDate(row.starts_at)} · {row.location}
                    </p>
                  </div>
                  <StatusBadge value={row.status} />
                </div>
                <p className="mt-4 font-[var(--font-body)] text-sm leading-6 text-black/55">
                  {row.description}
                </p>
                <div className="mt-5 flex gap-2 border-t border-black/10 pt-4">
                  <ActionButton label="Edit" onClick={() => setEditing(row)} variant="outline" />
                  {row.status !== "PUBLISHED" && (
                    <ActionButton
                      label="Publish"
                      onClick={() => void changeStatus(row, "PUBLISHED")}
                    />
                  )}
                  {row.status === "PUBLISHED" && (
                    <ActionButton
                      label="Archive"
                      onClick={() => void changeStatus(row, "ARCHIVED")}
                      variant="outline"
                    />
                  )}
                  <button
                    onClick={() => void remove(row)}
                    className="ml-auto grid size-9 place-items-center border border-red-200 text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <EmptyState text="No events have been created" />
          )}
        </div>
      </div>
    </PagePanel>
  );
}

function PublicationInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label-mono text-white/45">{label}</span>
      <input
        {...props}
        className="mt-2 w-full border border-white/15 bg-white/5 px-3 py-2.5 font-[var(--font-body)] text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e4ab3a]"
      />
    </label>
  );
}
function PublicationTextarea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="label-mono text-white/45">{label}</span>
      <textarea
        {...props}
        className="mt-2 w-full resize-y border border-white/15 bg-white/5 px-3 py-2.5 font-[var(--font-body)] text-sm leading-6 text-white outline-none focus:border-[#e4ab3a]"
      />
    </label>
  );
}
function PublicationSelect({
  label,
  options,
  ...props
}: {
  label: string;
  options: (string | { value: string; label: string })[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="label-mono text-white/45">{label}</span>
      <select
        {...props}
        className="mt-2 w-full border border-white/15 bg-[#211f1d] px-3 py-2.5 font-[var(--font-body)] text-sm text-white outline-none focus:border-[#e4ab3a]"
      >
        {options.map((option) => {
          const val = typeof option === "string" ? option : option.value;
          const lbl = typeof option === "string" ? option : option.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </label>
  );
}
function ContentPreview({
  title,
  eyebrow,
  body,
  image,
  blocks,
  onClose,
}: {
  title: string;
  eyebrow: string;
  body?: string;
  image?: string;
  blocks?: UpdateBlock[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur overflow-y-auto"
      onMouseDown={onClose}
    >
      <article
        className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#fbf9f4] shadow-2xl my-auto"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {image && (
          <img src={uploadUrl(image)} alt="" className="h-64 w-full object-cover rounded-t-2xl" />
        )}
        <div className="p-7 md:p-10">
          <div className="flex justify-between gap-4">
            <p className="label-mono text-[#8c2d3c]">{eyebrow} · Preview</p>
            <button onClick={onClose} className="text-black/60 hover:text-black">
              <X className="size-5" />
            </button>
          </div>
          <h2 className="mt-5 text-3xl font-black md:text-5xl">{title}</h2>

          <div className="mt-7 space-y-5 font-[var(--font-body)] leading-7 text-black/80">
            {blocks && blocks.length > 0 ? (
              blocks.map((b, idx) => {
                if (b.type === "image") {
                  return (
                    <figure key={b.id || idx} className="my-6 space-y-2">
                      {b.url && (
                        <img
                          src={uploadUrl(b.url)}
                          alt={b.caption || "Image block"}
                          className="w-full rounded-xl object-cover max-h-[480px] shadow border border-black/10"
                        />
                      )}
                      {b.caption && (
                        <figcaption className="text-xs text-black/60 italic font-mono text-center">
                          {b.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }
                return (
                  <p key={b.id || idx} className="whitespace-pre-wrap">
                    {b.content}
                  </p>
                );
              })
            ) : (
              <div className="whitespace-pre-wrap leading-8 text-black/65">{body}</div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function ResourcesPanel({
  rows,
  token,
  reload,
}: {
  rows: Resource[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const data = new FormData(form);
      const file = data.get("file");
      if (!(file instanceof File) || !file.size) throw new Error("Please choose a resource file.");
      await adminApi("/admin/resources", token, { method: "POST", body: data });
      form.reset();
      setSuccess(
        "Resource uploaded successfully. Publish it when it is ready for the public library.",
      );
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const publish = async (row: Resource) => {
    setError("");
    setSuccess("");
    try {
      await adminApi(`/admin/resources/${row.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ isPublished: !row.is_published }),
      });
      setSuccess(
        row.is_published
          ? "Resource removed from the public library."
          : "Resource published successfully.",
      );
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the resource");
    }
  };
  const remove = async (row: Resource) => {
    if (!window.confirm(`Permanently delete "${row.title}" and its uploaded file?`)) return;
    setDeleting(row.id);
    setError("");
    setSuccess("");
    try {
      await adminApi(`/admin/resources/${row.id}`, token, { method: "DELETE" });
      setSuccess("Resource deleted successfully.");
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete the resource");
    } finally {
      setDeleting("");
    }
  };
  return (
    <PagePanel
      title="Resource library"
      subtitle="Upload publications and control what appears on the public website."
    >
      <form
        onSubmit={upload}
        className="mb-8 grid gap-4 rounded-2xl border border-dashed border-[#8c2d3c]/50 bg-[#8c2d3c]/5 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]"
      >
        <LightInput name="title" label="Title" placeholder="Community guide" />
        <LightInput name="description" label="Description" placeholder="Short description" />
        <label className="md:col-span-2">
          <span className="label-mono text-black/50">File</span>
          <input
            name="file"
            required
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="mt-2 block w-full font-[var(--font-body)] text-sm file:mr-4 file:border-0 file:bg-[#191715] file:px-4 file:py-3 file:text-white"
          />
        </label>
        <button
          disabled={uploading}
          className="self-end bg-[#8c2d3c] px-6 py-3.5 font-[var(--font-body)] text-sm font-bold text-white hover:bg-[#6f1f2c]"
        >
          <UploadCloud className="mr-2 inline size-4" />
          {uploading ? "Uploading…" : "Upload"}
        </button>
        {error && <p className="md:col-span-full text-sm text-[#8c2d3c]">{error}</p>}
        {success && <p className="md:col-span-full text-sm text-emerald-700">{success}</p>}
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={row.id} className="border border-black/12 bg-[#fbf9f4] p-5">
            <div className="flex items-start justify-between">
              <div className="grid size-11 place-items-center bg-[#191715] text-white">
                <FileText className="size-5" />
              </div>
              <StatusBadge value={row.is_published ? "APPROVED" : "PENDING"} />
            </div>
            <p className="mt-6 label-mono text-[#8c2d3c]">EMWA resource</p>
            <h3 className="mt-2 text-xl font-black">{row.title}</h3>
            <p className="mt-2 line-clamp-2 font-[var(--font-body)] text-sm text-black/50">
              {row.description}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
              <a
                href={uploadUrl(row.file_url)}
                target="_blank"
                rel="noreferrer"
                className="label-mono text-black/45 hover:text-[#8c2d3c]"
              >
                Open file
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => void publish(row)}
                  className={`px-3 py-2 font-[var(--font-body)] text-sm font-bold ${row.is_published ? "border border-black/20" : "bg-[#8c2d3c] text-white"}`}
                >
                  {row.is_published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  disabled={deleting === row.id}
                  onClick={() => void remove(row)}
                  aria-label={`Delete ${row.title}`}
                  className="inline-flex items-center gap-2 border border-red-700 px-3 py-2 font-[var(--font-body)] text-sm font-bold text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                  {deleting === row.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PagePanel>
  );
}

function MessagesPanel({
  rows,
  token,
  reload,
}: {
  rows: Contact[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<Contact | null>(rows[0] ?? null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | Contact["status"]>("ALL");
  const [dateOrder, setDateOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const visible = useMemo(
    () =>
      rows
        .filter((row) => statusFilter === "ALL" || row.status === statusFilter)
        .sort((a, b) => {
          const difference = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return dateOrder === "NEWEST" ? difference : -difference;
        }),
    [rows, statusFilter, dateOrder],
  );
  useEffect(() => {
    if (!selected || !visible.some((message) => message.id === selected.id)) {
      setSelected(visible[0] ?? null);
    }
  }, [visible, selected]);
  const update = async (id: string, status: Contact["status"]) => {
    setBusy(`${id}-${status}`);
    setError("");
    try {
      await adminApi(`/admin/contact-messages/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSelected((current) => (current ? { ...current, status } : current));
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the message.");
    } finally {
      setBusy("");
    }
  };
  const deleteMessage = async (message: Contact) => {
    if (!window.confirm(`Delete the message from ${message.full_name}? This cannot be undone.`)) return;
    setBusy(`${message.id}-DELETE`);
    setError("");
    try {
      await adminApi(`/admin/contact-messages/${message.id}`, token, { method: "DELETE" });
      setSelected(null);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete the message.");
    } finally {
      setBusy("");
    }
  };
  return (
    <PagePanel
      title="Contact messages"
      subtitle="Read, organize, and archive messages from the public contact form."
    >
      <div className="mb-6 grid gap-3 bg-[#e9e3d9] p-4 sm:grid-cols-2">
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as typeof statusFilter)}
          options={[
            { value: "ALL", label: `All messages (${rows.length})` },
            { value: "NEW", label: `Unread (${rows.filter((row) => row.status === "NEW").length})` },
            { value: "READ", label: `Read (${rows.filter((row) => row.status === "READ").length})` },
            { value: "ARCHIVED", label: `Archived (${rows.filter((row) => row.status === "ARCHIVED").length})` },
          ]}
        />
        <Select
          value={dateOrder}
          onChange={(value) => setDateOrder(value as typeof dateOrder)}
          options={[
            { value: "NEWEST", label: "Newest first" },
            { value: "OLDEST", label: "Oldest first" },
          ]}
        />
      </div>
      {error && <p className="mb-4 text-sm font-semibold text-[#8c2d3c]" role="alert">{error}</p>}
      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm lg:grid-cols-[.85fr_1.15fr]">
        <div className="border-b border-black/10 lg:border-b-0 lg:border-r">
          {visible.length ? (
            visible.map((row) => (
              <button
                key={row.id}
                onClick={() => setSelected(row)}
                className={`block w-full border-b border-black/8 p-5 text-left transition ${selected?.id === row.id ? "bg-[#8c2d3c] text-white" : "hover:bg-black/[.025]"}`}
              >
                <div className="flex justify-between gap-4">
                  <strong className={`font-[var(--font-body)] text-sm ${row.status === "NEW" ? "font-black" : "font-semibold"}`}>
                    {row.status === "NEW" && <span className="mr-2 inline-block size-2 rounded-full bg-[#e5a933]" aria-label="Unread" />}
                    {row.full_name}
                  </strong>
                  <span
                    className={`label-mono ${selected?.id === row.id ? "text-white/55" : "text-black/35"}`}
                  >
                    {fmtDate(row.created_at)}
                  </span>
                </div>
                <p
                  className={`mt-2 truncate font-[var(--font-body)] text-sm ${selected?.id === row.id ? "text-white/65" : "text-black/50"}`}
                >
                  {row.subject}
                </p>
              </button>
            ))
          ) : (
            <EmptyState text="No messages match this filter" />
          )}
        </div>
        {selected ? (
          <article className="p-6 md:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-mono text-[#8c2d3c]">{selected.subject}</p>
                <h3 className="mt-3 text-3xl font-black">{selected.full_name}</h3>
                <a
                  href={`mailto:${selected.email}`}
                  className="mt-2 block font-[var(--font-body)] text-sm text-black/45"
                >
                  {selected.email}
                </a>
                {selected.company_name && (
                  <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-black/60">
                    {selected.company_name}
                  </p>
                )}
              </div>
              <StatusBadge value={selected.status} />
            </div>
            <p className="mt-10 max-w-2xl whitespace-pre-wrap font-[var(--font-body)] leading-7 text-black/70">
              {selected.message}
            </p>
            <div className="mt-10 flex flex-wrap gap-2 border-t border-black/10 pt-6">
              {selected.status === "NEW" ? (
                <ActionButton
                  label="Mark read"
                  busy={busy === `${selected.id}-READ`}
                  onClick={() => void update(selected.id, "READ")}
                />
              ) : (
                <ActionButton
                  label="Mark unread"
                  busy={busy === `${selected.id}-NEW`}
                  onClick={() => void update(selected.id, "NEW")}
                />
              )}
              <ActionButton
                label="Archive"
                busy={busy === `${selected.id}-ARCHIVED`}
                onClick={() => void update(selected.id, "ARCHIVED")}
                variant="outline"
              />
              <button
                type="button"
                disabled={busy === `${selected.id}-DELETE`}
                onClick={() => void deleteMessage(selected)}
                className="inline-flex items-center gap-2 border border-red-700 px-4 py-2 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-[.12em] text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                {busy === `${selected.id}-DELETE` ? "Deleting…" : "Delete message"}
              </button>
            </div>
          </article>
        ) : (
          <EmptyState text="Select a message to read it" />
        )}
      </div>
    </PagePanel>
  );
}

function SubscribersPanel({
  rows,
  token,
  reload,
}: {
  rows: NewsletterSubscriber[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | NewsletterSubscriber["status"]>("ALL");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const visible = rows.filter(
    (row) =>
      (status === "ALL" || row.status === status) &&
      row.email.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const downloadCsv = () => {
    const csv = [
      ["Email", "Status", "Subscribed at", "Unsubscribed at"],
      ...visible.map((row) => [
        row.email,
        row.status,
        row.subscribed_at,
        row.unsubscribed_at ?? "",
      ]),
    ]
      .map((cells) => cells.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "emwa-newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const remove = async (row: NewsletterSubscriber) => {
    if (!window.confirm(`Permanently delete newsletter subscriber ${row.email}?`)) return;
    setBusy(row.id);
    setError("");
    try {
      await adminApi(`/admin/newsletter-subscribers/${row.id}`, token, {
        method: "DELETE",
      });
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete subscriber");
    } finally {
      setBusy("");
    }
  };

  return (
    <PagePanel
      title="Email subscribers"
      subtitle="View the audience subscribed to The Narrative Shift newsletter directly from PostgreSQL."
    >
      <div className="mb-6 grid gap-3 rounded-2xl bg-[#e9e3d9] p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="flex items-center gap-3 rounded-xl bg-[#fbf9f4] px-4">
          <Search className="size-4 text-black/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subscriber email"
            className="w-full bg-transparent py-3 font-[var(--font-body)] text-sm outline-none"
          />
        </label>
        <Select
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "UNSUBSCRIBED", label: "Unsubscribed" },
          ]}
        />
        <button
          type="button"
          onClick={downloadCsv}
          disabled={!visible.length}
          className="border border-black/15 bg-[#fbf9f4] px-5 py-3 label-mono hover:border-[#8c2d3c] hover:text-[#8c2d3c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SubscriberMetric label="All subscribers" value={rows.length} icon={Inbox} />
        <SubscriberMetric
          label="Active"
          value={rows.filter((row) => row.status === "ACTIVE").length}
          icon={Check}
        />
        <SubscriberMetric
          label="Unsubscribed"
          value={rows.filter((row) => row.status === "UNSUBSCRIBED").length}
          icon={Archive}
        />
      </div>
      {error && <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/10 bg-[#fbf9f4] shadow-sm">
        {visible.length ? (
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-black/12 text-left">
                <Th>Email address</Th>
                <Th>Status</Th>
                <Th>Subscribed</Th>
                <Th>Last updated</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-black/8 last:border-0">
                  <Td>
                    <a href={`mailto:${row.email}`} className="font-semibold hover:text-[#8c2d3c]">
                      {row.email}
                    </a>
                  </Td>
                  <Td>
                    <StatusBadge value={row.status} />
                  </Td>
                  <Td>{fmtDate(row.subscribed_at)}</Td>
                  <Td>{fmtDate(row.updated_at)}</Td>
                  <Td>
                    <button
                      type="button"
                      disabled={busy === row.id}
                      onClick={() => void remove(row)}
                      className="inline-flex items-center gap-2 border border-red-700 px-3 py-2 font-[var(--font-body)] text-sm font-bold text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                      {busy === row.id ? "Deleting…" : "Delete"}
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            text={rows.length ? "No subscribers match these filters" : "No email subscribers yet"}
          />
        )}
      </div>
    </PagePanel>
  );
}

function SubscriberMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Inbox;
}) {
  return (
    <article className="flex items-center justify-between rounded-2xl border border-black/10 bg-[#fbf9f4] p-5 shadow-sm">
      <div>
        <p className="label-mono text-black/40">{label}</p>
        <strong className="mt-2 block text-3xl font-black">{value}</strong>
      </div>
      <span className="grid size-11 place-items-center rounded-full bg-[#8c2d3c]/10 text-[#8c2d3c]">
        <Icon className="size-5" />
      </span>
    </article>
  );
}

function PagePanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <header className="relative mb-7 overflow-hidden rounded-[1.65rem] bg-[#1d1a18] px-7 py-8 text-white shadow-2xl shadow-black/10 md:px-9 md:py-9">
        <div className="pointer-events-none absolute -right-12 -top-20 size-60 rounded-full border-[36px] border-[#9d3547]/70" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-24 w-px bg-white/10" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="min-w-0">
            <p className="label-mono text-[#e4ab3a]">Administration workflow</p>
            <h2 className="mt-4 max-w-3xl !text-[2rem] font-black leading-none tracking-[-.035em] md:!text-[2.65rem]">
              {title}
            </h2>
          </div>
          <p className="max-w-md font-[var(--font-body)] text-sm leading-6 text-white/55">
            {subtitle}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}
function FilterBar({
  query,
  setQuery,
  filter,
  setFilter,
}: {
  query: string;
  setQuery: (v: string) => void;
  filter: string;
  setFilter: (v: "ALL" | ApplicationStatus) => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-[#e9e3d9] p-4 sm:flex-row">
      <label className="flex flex-1 items-center gap-3 rounded-xl bg-[#fbf9f4] px-4">
        <Search className="size-4 text-black/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applications"
          className="w-full bg-transparent py-3 font-[var(--font-body)] text-sm outline-none"
        />
      </label>
      <Select
        value={filter}
        onChange={(v) => setFilter(v as "ALL" | ApplicationStatus)}
        options={["ALL", "PENDING", "APPROVED", "REJECTED"].map((x) => ({
          value: x,
          label: x === "ALL" ? "All statuses" : x,
        }))}
      />
    </div>
  );
}
function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 rounded-xl border-0 bg-[#fbf9f4] px-4 py-3 font-[var(--font-body)] text-sm outline-none sm:min-w-52"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
function ActionButton({
  label,
  onClick,
  busy = false,
  variant = "solid",
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  variant?: "solid" | "outline";
}) {
  return (
    <button
      disabled={busy}
      onClick={onClick}
      className={`px-3 py-2 label-mono disabled:opacity-50 ${variant === "solid" ? "bg-[#8c2d3c] text-white hover:bg-[#6f1f2c]" : "border border-black/20 hover:border-[#8c2d3c] hover:text-[#8c2d3c]"}`}
    >
      {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : label}
    </button>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 label-mono text-black/40">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-5 py-4 font-[var(--font-body)] text-sm text-black/65">
      {typeof children === "object" ? children : <span>{children}</span>}
    </td>
  );
}
function DarkInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="label-mono text-white/40">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-white/20 bg-transparent py-3 font-[var(--font-body)] text-sm outline-none focus:border-[#e4ab3a]"
      />
    </label>
  );
}
function LightInput({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) {
  return (
    <label>
      <span className="label-mono text-black/50">{label}</span>
      <input
        name={name}
        required
        placeholder={placeholder}
        className="mt-2 w-full border border-black/15 bg-[#fbf9f4] px-4 py-3 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
      />
    </label>
  );
}

function HeroSlidesPanel({
  rows,
  token,
  reload,
}: {
  rows: HeroSlideItem[];
  token: string;
  reload: () => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<HeroSlideItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const demo = token === "frontend-demo-session";

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    if (!data.get("author")) {
      data.set("author", "EMWA");
    }
    if (data.get("imageUrl") === "") {
      data.delete("imageUrl");
    }
    const isActiveInput = form.querySelector<HTMLInputElement>('#isActiveCheck');
    if (isActiveInput) {
      data.set("isActive", String(isActiveInput.checked));
    }

    try {
      if (!demo) {
        const path = editing ? `/admin/hero-slides/${editing.id}` : "/admin/hero-slides";
        const method = editing ? "PATCH" : "POST";
        await adminApi(path, token, { method, body: data });
      }
      setCreating(false);
      setEditing(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save hero slide");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (slide: HeroSlideItem) => {
    setBusy(true);
    setError("");
    try {
      if (!demo) {
        const data = new FormData();
        data.set("isActive", String(!slide.isActive));
        await adminApi(`/admin/hero-slides/${slide.id}`, token, {
          method: "PATCH",
          body: data,
        });
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle status");
    } finally {
      setBusy(false);
    }
  };

  const removeSlide = async (slide: HeroSlideItem) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    setDeleting(slide.id);
    setError("");
    try {
      if (!demo) {
        await adminApi(`/admin/hero-slides/${slide.id}`, token, { method: "DELETE" });
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete hero slide");
    } finally {
      setDeleting(null);
    }
  };

  const activeForm = creating || editing;

  return (
    <PagePanel
      title="Homepage Hero Slides"
      subtitle="Manage quotes, background photos, and display order for the frontpage HeroSlider."
    >
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="inline-flex items-center gap-2 bg-[#8c2d3c] px-4 py-2.5 font-[var(--font-body)] text-sm font-bold text-white transition hover:bg-[#6e222e]"
        >
          <Plus className="size-4" /> Add new hero slide
        </button>
      </div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {activeForm && (
        <div className="mb-8 rounded-2xl border border-black/10 bg-[#fbf9f4] p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <h3 className="font-display text-xl font-bold">
              {editing ? "Edit Hero Slide" : "Create New Hero Slide"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="text-black/50 hover:text-black"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={submitForm} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label-mono text-black/60">Headline Title (English)</span>
                <input
                  type="text"
                  name="title"
                  defaultValue={editing?.title ?? ""}
                  placeholder="e.g. A legacy of service."
                  className="mt-1.5 w-full border border-black/15 bg-white px-3 py-2.5 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                />
              </label>

              <label className="block">
                <span className="label-mono text-black/60">Headline Title (Amharic)</span>
                <input
                  type="text"
                  name="titleAm"
                  defaultValue={editing?.titleAm ?? ""}
                  placeholder="e.g. የአገልግሎት ውርስ።"
                  className="mt-1.5 w-full border border-black/15 bg-white px-3 py-2.5 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label-mono text-black/60">Person / Tribute Explanation (English)</span>
                <textarea
                  name="description"
                  defaultValue={editing?.description ?? ""}
                  placeholder="e.g. Fitsum Alemayehu, the first president of EMWA, served the association with diligence and competence for which it is forever grateful."
                  className="mt-1.5 w-full border border-black/15 bg-white p-3 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                  rows={2}
                />
              </label>

              <label className="block">
                <span className="label-mono text-black/60">Person / Tribute Explanation (Amharic)</span>
                <textarea
                  name="descriptionAm"
                  defaultValue={editing?.descriptionAm ?? ""}
                  placeholder="e.g. የEMWA የመጀመሪያዋ ፕሬዝዳንት ፍጹም ዓለማየሁ..."
                  className="mt-1.5 w-full border border-black/15 bg-white p-3 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                  rows={2}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label-mono text-black/60">Quote Text (English)</span>
                <textarea
                  name="text"
                  required
                  defaultValue={editing?.text ?? ""}
                  placeholder="e.g. I have many happy memories in Ethiopia..."
                  className="mt-1.5 w-full border border-black/15 bg-white p-3 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                  rows={2}
                />
              </label>

              <label className="block">
                <span className="label-mono text-black/60">Quote Text (Amharic)</span>
                <textarea
                  name="textAm"
                  required
                  defaultValue={editing?.textAm ?? ""}
                  placeholder="e.g. በኢትዮጵያ ውስጥ ብዙ አስደሳች ትዝታዎች አሉኝ..."
                  className="mt-1.5 w-full border border-black/15 bg-white p-3 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                  rows={2}
                />
              </label>
            </div>

            <input type="hidden" name="author" value="EMWA" />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label-mono text-black/60">Role / Position (English)</span>
                <input
                  type="text"
                  name="role"
                  required
                  defaultValue={editing?.role ?? ""}
                  placeholder="e.g. First President of EMWA"
                  className="mt-1.5 w-full border border-black/15 bg-white px-3 py-2.5 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                />
              </label>

              <label className="block">
                <span className="label-mono text-black/60">Role / Position (Amharic)</span>
                <input
                  type="text"
                  name="roleAm"
                  required
                  defaultValue={editing?.roleAm ?? ""}
                  placeholder="e.g. የEMWA የመጀመሪያዋ ፕሬዝዳንት"
                  className="mt-1.5 w-full border border-black/15 bg-white px-3 py-2.5 font-[var(--font-body)] text-sm outline-none focus:border-[#8c2d3c]"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <label className="block">
                <span className="label-mono text-black/60">
                  {editing ? "Replace Background Image (Optional)" : "Upload Background Image"}
                </span>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  required={!editing}
                  className="mt-1.5 w-full border border-black/15 bg-white px-3 py-2 font-[var(--font-body)] text-sm"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveCheck"
                name="isActive"
                value="true"
                defaultChecked={editing?.isActive ?? true}
                className="size-4 accent-[#8c2d3c]"
              />
              <label htmlFor="isActiveCheck" className="text-sm font-medium text-black/80">
                Active slide (visible on public website)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                className="border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="bg-[#8c2d3c] px-5 py-2 text-sm font-bold text-white hover:bg-[#6e222e] disabled:opacity-50"
              >
                {busy ? "Saving..." : editing ? "Update Slide" : "Create Slide"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-[#fbf9f4] p-8 text-center text-black/60">
            No hero slides found. Click &quot;Add new hero slide&quot; to create one.
          </div>
        ) : (
          rows.map((slide) => (
            <article
              key={slide.id}
              className="flex flex-col md:flex-row gap-6 items-start justify-between rounded-xl border border-black/10 bg-[#fbf9f4] p-5 transition hover:shadow-md"
            >
              <div className="w-full md:w-48 aspect-[16/9] overflow-hidden rounded-lg bg-black/10 shrink-0">
                <img
                  src={uploadUrl(slide.imageUrl)}
                  alt={slide.author}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1585637071663-799845ad5212?w=1600&q=80";
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="label-mono text-xs text-[#8c2d3c] bg-[#8c2d3c]/10 px-2 py-0.5 rounded">
                    Order #{slide.displayOrder}
                  </span>
                  <span
                    className={`label-mono text-xs px-2 py-0.5 rounded ${
                      slide.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {slide.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="label-mono text-xs text-black/50">{slide.role}</span>
                </div>

                {slide.title && (
                  <h4 className="font-display text-base font-bold text-[#8c2d3c]">
                    {slide.title}
                  </h4>
                )}

                {slide.description && (
                  <p className="text-sm font-medium text-black/80 leading-relaxed">
                    {slide.description}
                  </p>
                )}

                <blockquote className="font-display text-base font-bold text-black/90 italic">
                  &ldquo;{slide.text}&rdquo;
                </blockquote>
                {slide.textAm && (
                  <p className="text-xs text-black/60 italic">&ldquo;{slide.textAm}&rdquo;</p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => void toggleActive(slide)}
                  disabled={busy}
                  className="p-2 text-black/60 hover:text-black border border-black/10 rounded hover:bg-white"
                  title={slide.isActive ? "Deactivate slide" : "Activate slide"}
                >
                  {slide.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditing(slide);
                  }}
                  className="p-2 text-black/60 hover:text-black border border-black/10 rounded hover:bg-white"
                  title="Edit slide"
                >
                  <Pencil className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void removeSlide(slide)}
                  disabled={deleting === slide.id}
                  className="p-2 text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                  title="Delete slide"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </PagePanel>
  );
}
