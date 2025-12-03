import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://impact.staats.dev";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Module pages (these are the main content pages)
  const modules = [
    "urban-heat",
    "air-quality",
    "coastal-plastic",
    "ocean-plastic",
    "port-emissions",
    "biodiversity",
    "restoration",
  ];

  const modulePages: MetadataRoute.Sitemap = modules.map((moduleId) => ({
    url: `${baseUrl}/dashboard/modules/${moduleId}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...modulePages];
}
