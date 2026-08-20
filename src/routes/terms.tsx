import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — EMWA" },
      { name: "description", content: "Terms and conditions for using the EMWA website, membership, and services." },
      { property: "og:title", content: "Terms & Conditions — EMWA" },
      { property: "og:description", content: "Terms of use for the Ethiopian Media Women Association website and services." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Terms,
});

const SECTIONS = [
  { h: "1. Acceptance", b: "By accessing this website or participating in EMWA programs, you agree to these Terms & Conditions. If you do not agree, please discontinue use." },
  { h: "2. Membership", b: "Membership is offered to individuals and organizations meeting the eligibility criteria published on the Membership page. EMWA reserves the right to accept, defer, or terminate memberships for stated reasons, including conduct incompatible with the association's mission." },
  { h: "3. Use of the Website", b: "You agree to use this website lawfully and not to interfere with its operation, misrepresent your identity, or use content without permission." },
  { h: "4. Content & Intellectual Property", b: "All content, including text, images, logos, and downloadable resources, is the property of EMWA or its licensors and is protected by applicable copyright and trademark law. Personal, non-commercial use is permitted with attribution." },
  { h: "5. Experts Directory", b: "Listed experts warrant that biographical information they provide is accurate. EMWA verifies affiliations at listing but does not endorse individual professional services. Users of the directory contact experts at their own discretion." },
  { h: "6. Third-Party Links", b: "Links to third-party websites are provided for convenience. EMWA is not responsible for the content, policies, or practices of external sites." },
  { h: "7. Disclaimer", b: "The website and its content are provided 'as is' without warranties of any kind. EMWA does not warrant that the site will be uninterrupted, error-free, or free of harmful components." },
  { h: "8. Limitation of Liability", b: "To the maximum extent permitted by law, EMWA is not liable for indirect, incidental, or consequential damages arising from use of the site, services, or any content downloaded." },
  { h: "9. Governing Law", b: "These Terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes shall be resolved in the courts of Addis Ababa." },
  { h: "10. Changes", b: "EMWA may revise these Terms at any time. Continued use of the website after changes constitutes acceptance of the revised Terms." },
  { h: "11. Contact", b: "For questions about these Terms, contact contact@ethmwa.org." },
];

function Terms() {
  return (
    <PageShell>
      <PageHero eyebrow="Legal · Last updated 01 November 2026" title="Terms & Conditions" />
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          {SECTIONS.map(s => (
            <div key={s.h}>
              <h2 className="font-display text-3xl mb-3">{s.h}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
