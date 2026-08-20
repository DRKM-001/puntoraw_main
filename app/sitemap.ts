import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://puntoraw.org";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/episodes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Season 2
    {
      url: `${baseUrl}/episodes/s2-e4-algo-tiene-que-morir`,
      lastModified: new Date("2026-08-08"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/episodes/s2-e3-conveniencia-destruccion`,
      lastModified: new Date("2026-07-03"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/episodes/s2-e2-piensas-o-confias`,
      lastModified: new Date("2026-06-20"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/episodes/s2-e1-the-walking-dead`,
      lastModified: new Date("2026-05-22"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Season 1
    {
      url: `${baseUrl}/episodes/s1-e4-cambio-de-mentalidad`,
      lastModified: new Date("2025-03-31"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/episodes/s1-e3-nunca-te-sientes-listo`,
      lastModified: new Date("2025-03-04"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/episodes/s1-e2-si-no-avanzas-retrocedes`,
      lastModified: new Date("2024-12-20"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/episodes/s1-e1-arrastras-o-te-arrastran`,
      lastModified: new Date("2022-11-05"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
