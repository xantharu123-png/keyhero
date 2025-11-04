// @ts-nocheck
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://keyhero.ch";
  return [
    { url: base + "/", changeFrequency: "daily", priority: 0.9 },
    { url: base + "/deals", changeFrequency: "hourly", priority: 0.8 },
    { url: base + "/shops", changeFrequency: "weekly", priority: 0.6 },
    { url: base + "/impressum", changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/datenschutz", changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/kontakt", changeFrequency: "yearly", priority: 0.3 },
  ];
}
