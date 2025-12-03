import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://impact.staats.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/sign-out/",
          "/dashboard/settings/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
