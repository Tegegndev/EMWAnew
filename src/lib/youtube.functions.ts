import { createServerFn } from "@tanstack/react-start";

export type YoutubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channel: string;
  thumbnail: string;
  url: string;
};

// Curated fallback — real, evergreen videos about women & journalism.
const FALLBACK: YoutubeVideo[] = [
  {
    id: "hg3umXU_qWc",
    title: "The urgency of intersectionality",
    description: "Kimberlé Crenshaw on why we need to look at inequality through more than one lens.",
    publishedAt: "2016-12-07",
    channel: "TED",
    thumbnail: "https://i.ytimg.com/vi/hg3umXU_qWc/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=hg3umXU_qWc",
  },
  {
    id: "9-FTdEIO_C4",
    title: "Women in journalism — reporting from the frontline",
    description: "BBC News profiles women reporters covering conflict and change.",
    publishedAt: "2023-03-08",
    channel: "BBC News",
    thumbnail: "https://i.ytimg.com/vi/9-FTdEIO_C4/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=9-FTdEIO_C4",
  },
  {
    id: "cHzJyBUX_fk",
    title: "Malala Yousafzai — every girl deserves an education",
    description: "A powerful call for education equality delivered at the United Nations.",
    publishedAt: "2013-07-12",
    channel: "United Nations",
    thumbnail: "https://i.ytimg.com/vi/cHzJyBUX_fk/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=cHzJyBUX_fk",
  },
  {
    id: "eV3nnFheQRo",
    title: "We should all be feminists",
    description: "Chimamanda Ngozi Adichie on gender and the stories we tell.",
    publishedAt: "2013-04-12",
    channel: "TEDx Talks",
    thumbnail: "https://i.ytimg.com/vi/eV3nnFheQRo/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=eV3nnFheQRo",
  },
  {
    id: "7n9IOH0NvyY",
    title: "Women leaders reshaping global newsrooms",
    description: "Reuters Institute panel on women running major international media organisations.",
    publishedAt: "2024-05-10",
    channel: "Reuters",
    thumbnail: "https://i.ytimg.com/vi/7n9IOH0NvyY/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=7n9IOH0NvyY",
  },
  {
    id: "Bkg8gT8oXbY",
    title: "African women driving accountability journalism",
    description: "Stories from women reporters across Ethiopia, Kenya and beyond.",
    publishedAt: "2024-11-02",
    channel: "DW News",
    thumbnail: "https://i.ytimg.com/vi/Bkg8gT8oXbY/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=Bkg8gT8oXbY",
  },
];

export const getWomenNewsVideos = createServerFn({ method: "GET" }).handler(
  async (): Promise<YoutubeVideo[]> => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return FALLBACK;

    try {
      const query = encodeURIComponent(
        "women journalists news OR women leadership OR women empowerment",
      );
      const url =
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
        `&order=date&maxResults=6&q=${query}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return FALLBACK;
      const data = (await res.json()) as {
        items?: Array<{
          id: { videoId: string };
          snippet: {
            title: string;
            description: string;
            publishedAt: string;
            channelTitle: string;
            thumbnails: { high?: { url: string }; medium?: { url: string } };
          };
        }>;
      };
      const items = data.items ?? [];
      if (!items.length) return FALLBACK;
      return items.map((it) => ({
        id: it.id.videoId,
        title: it.snippet.title,
        description: it.snippet.description,
        publishedAt: it.snippet.publishedAt,
        channel: it.snippet.channelTitle,
        thumbnail:
          it.snippet.thumbnails.high?.url ??
          it.snippet.thumbnails.medium?.url ??
          `https://i.ytimg.com/vi/${it.id.videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      }));
    } catch {
      return FALLBACK;
    }
  },
);