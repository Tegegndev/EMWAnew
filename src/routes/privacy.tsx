import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — EMWA" },
      { name: "description", content: "How the Ethiopian Media Women Association collects, uses, and protects personal information." },
      { property: "og:title", content: "Privacy Policy — EMWA" },
      { property: "og:description", content: "EMWA's privacy policy and data handling practices." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  { h: "1. Introduction", b: "This Privacy Policy describes how the Ethiopian Media Women Association (\"EMWA\", \"we\", \"our\") collects, uses, and safeguards personal information provided through our website, membership programs, and events. This page is maintained by EMWA and describes our current practices." },
  { h: "2. Information We Collect", b: "We collect information you voluntarily provide when you apply for membership, register for events, subscribe to newsletters, contact us, or apply to be listed in the Experts Directory. This includes name, email address, phone number, professional affiliation, region, and (for directory listings) publicly-oriented professional biography and photo." },
  { h: "3. How We Use Information", b: "We use personal information to process membership applications, deliver programs and events, publish and maintain the Experts Directory, send newsletters and important service communications, and comply with legal obligations. We do not sell personal information." },
  { h: "4. Legal Basis", b: "Where applicable, we process personal information on the basis of your consent, our legitimate interests in operating a professional association, and compliance with Ethiopian law." },
  { h: "5. Sharing", b: "We share personal information only with program partners strictly to deliver services you have opted into, with service providers under contractual confidentiality, and where required by law. Experts Directory profiles are public by design." },
  { h: "6. Retention", b: "We retain membership and program records for the duration of your active engagement plus a reasonable archival period. Newsletter subscriber data is retained until you unsubscribe." },
  { h: "7. Your Rights", b: "You may request access, correction, or deletion of your personal information by contacting contact@ethmwa.org. Directory listings can be delisted on request." },
  { h: "8. Security", b: "We apply administrative, technical, and physical safeguards appropriate to the sensitivity of the information we hold. No system is perfectly secure and we cannot guarantee absolute security." },
  { h: "9. Cookies", b: "Our website uses minimal cookies for functional purposes and privacy-friendly analytics. You can control cookies through your browser settings." },
  { h: "10. Changes", b: "We may update this policy from time to time. Material changes will be communicated via the website and, where appropriate, direct email." },
  { h: "11. Contact", b: "Questions about this policy may be sent to contact@ethmwa.org or EMWA, Addis Ababa, Arada Sub-city, near Rad Mekonenne Bridge." },
];

function Privacy() {
  return (
    <PageShell>
      <PageHero eyebrow="Legal · Last updated 01 November 2026" title="Privacy Policy" />
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <p className="text-muted-foreground italic">
            This page is maintained by EMWA to describe our current data
            practices. It is not a certification or independent audit.
          </p>
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
