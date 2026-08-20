import { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const GALLERY_IMAGES = [
  { src: "/gallary/photo_2026-08-09_11-37-34.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-37-44.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-37-50.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-40-50.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-40-54.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-40-58.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-02.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-06.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-11.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-15.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-18.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-23.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-29.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-35.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-40.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-44.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-48.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-53.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-41-58.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-42-03.jpg", alt: "EMWA event" },
  { src: "/gallary/photo_2026-08-09_11-42-08.jpg", alt: "EMWA event" },
];

// Assign span patterns for a beautiful masonry rhythm
const SPAN_PATTERNS: Array<"tall" | "wide" | "normal"> = [
  "tall", "normal", "wide", "normal", "normal",
  "wide", "normal", "tall", "normal", "normal",
  "normal", "tall", "wide", "normal", "normal",
  "tall", "normal", "wide", "normal", "normal",
  "normal",
];

function GalleryLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: typeof GALLERY_IMAGES;
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const [animDir, setAnimDir] = useState<"next" | "prev" | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: "next" | "prev") => {
      setAnimDir(dir);
      setTimeout(() => {
        setCurrent((c) =>
          dir === "next"
            ? (c + 1) % images.length
            : (c - 1 + images.length) % images.length,
        );
        setAnimDir(null);
      }, 180);
    },
    [images.length],
  );

  // Auto scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const activeThumb = thumbsRef.current.children[current] as HTMLElement | undefined;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [current]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) go("next"); // Swiped left -> next
    if (distance < -40) go("prev"); // Swiped right -> prev
  };

  return (
    <div
      className="gallery-lightbox-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="gallery-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Gallery lightbox"
      >
        {/* Top Header Bar */}
        <div className="gallery-lightbox-header">
          <span className="gallery-lightbox-counter" aria-live="polite">
            {current + 1} / {images.length}
          </span>

          <button
            className="gallery-lightbox-close"
            onClick={onClose}
            aria-label="Close gallery"
            type="button"
          >
            <X />
          </button>
        </div>

        {/* Image Display Area with Touch Swipe */}
        <div
          className={`gallery-lightbox-img-wrap${animDir ? ` gallery-lightbox-img-wrap--${animDir}` : ""}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            key={current}
            src={images[current].src}
            alt={images[current].alt}
            className="gallery-lightbox-img"
          />

          {/* Prev */}
          <button
            className="gallery-lightbox-nav gallery-lightbox-nav--prev"
            onClick={() => go("prev")}
            aria-label="Previous image"
            type="button"
          >
            <ChevronLeft />
          </button>

          {/* Next */}
          <button
            className="gallery-lightbox-nav gallery-lightbox-nav--next"
            onClick={() => go("next")}
            aria-label="Next image"
            type="button"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Thumbnails Strip */}
        <div className="gallery-lightbox-thumbs" ref={thumbsRef} role="list">
          {images.map((img, i) => (
            <button
              key={img.src}
              role="listitem"
              type="button"
              className={`gallery-lightbox-thumb${i === current ? " is-active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === current}
            >
              <img src={img.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryItem({
  image,
  index,
  span,
  onClick,
}: {
  image: (typeof GALLERY_IMAGES)[number];
  index: number;
  span: "tall" | "wide" | "normal";
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), (index % 7) * 70);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <button
      ref={ref}
      type="button"
      className={`gallery-item gallery-item--${span}${visible ? " is-visible" : ""}`}
      onClick={onClick}
      aria-label={`Open image ${index + 1} in lightbox`}
      style={{ "--gallery-item-delay": `${(index % 7) * 70}ms` } as React.CSSProperties}
    >
      <img src={image.src} alt={image.alt} loading="lazy" />
      <span className="gallery-item-overlay" aria-hidden="true">
        <ZoomIn />
      </span>
      <span className="gallery-item-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
    </button>
  );
}

export function CompanyGallery() {
  const { t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <section className="company-gallery-section" aria-labelledby="gallery-heading">
        {/* Decorative background lines */}
        <span className="gallery-bg-rule gallery-bg-rule--1" aria-hidden="true" />
        <span className="gallery-bg-rule gallery-bg-rule--2" aria-hidden="true" />

        <header className="company-gallery-header">
          <div className="company-gallery-header-left">
            <span className="gallery-eyebrow">
              <Images aria-hidden="true" />
              {t("Our Gallery", "ፎቶ አልበም")}
            </span>
            <h2 id="gallery-heading">
              {t("Moments that define", "የEMWAን ጉዞ")}{" "}
              <span>{t("EMWA's journey.", "የሚናገሩ ቅጽበቶች።")}</span>
            </h2>
          </div>
          <p className="company-gallery-header-desc">
            {t(
              "A visual record of our events, trainings, advocacy campaigns, and the incredible women who power our mission.",
              "የዝግጅቶቻችን፣ ስልጠናዎቻችን፣ የሰልፍ ዘመቻዎቻችን እና ተልዕኮዋችንን የሚደግፉ ድንቅ ሴቶች ምስላዊ መዝገብ።",
            )}
          </p>
        </header>

        <div className="company-gallery-grid" role="list">
          {GALLERY_IMAGES.map((img, i) => (
            <GalleryItem
              key={img.src}
              image={img}
              index={i}
              span={SPAN_PATTERNS[i] ?? "normal"}
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>


      </section>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={GALLERY_IMAGES}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
