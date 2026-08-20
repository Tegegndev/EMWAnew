export type EmwaPartner = {
  name: string;
  focus: string;
  logo: string;
  logoClass?: string;
};

export const EMWA_PARTNERS: EmwaPartner[] = [
  {
    name: "Civil Rights Defenders",
    focus: "Human rights and civic space",
    logo: "/partnership/photo_2026-07-26_10-50-34.jpg",
  },
  {
    name: "Fojo Media Institute",
    focus: "Linnaeus University",
    logo: "/partnership/photo_2026-07-26_10-50-57.jpg",
  },
  {
    name: "Network of Ethiopian Women's Associations",
    focus: "NEWA",
    logo: "/partnership/photo_2026-07-26_10-51-06.jpg",
    logoClass: "is-newa",
  },
  {
    name: "UNESCO IPDC",
    focus: "International Programme for the Development of Communication",
    logo: "/partnership/photo_2026-07-26_10-51-12.jpg",
  },
  {
    name: "BBC Media Action",
    focus: "Media development and social impact",
    logo: "/partnership/bbc_media_action.jpg",
  },
  {
    name: "Grassroot Soccer",
    focus: "Adolescent health through sport",
    logo: "/partnership/grassroot_soccer.jpg",
  },
];
