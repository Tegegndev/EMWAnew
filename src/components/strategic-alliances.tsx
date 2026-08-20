import { EMWA_PARTNERS, type EmwaPartner } from "@/lib/partners";

function PartnerLogo({ partner }: { partner: EmwaPartner }) {
  return (
    <div className="alliance-card">
      <div className="alliance-logo-container">
        <img
          src={partner.logo}
          alt={`${partner.name} logo`}
          loading="lazy"
          className={`alliance-logo ${partner.logoClass ?? ""}`}
        />
      </div>
      <span className="alliance-name">{partner.name}</span>
    </div>
  );
}

export default function StrategicAlliances() {
  const triplePartners = [...EMWA_PARTNERS, ...EMWA_PARTNERS, ...EMWA_PARTNERS];

  return (
    <section className="alliance-section" id="partners" aria-labelledby="alliances-title">
      <div className="alliance-container">
        <header className="alliance-header">
          <p className="alliance-eyebrow" id="alliances-title">Strategic Alliances</p>
          <div className="alliance-divider" aria-hidden="true" />
        </header>

        <div className="alliance-marquee-viewport">
          <div className="alliance-marquee-track">
            {triplePartners.map((partner, index) => (
              <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
