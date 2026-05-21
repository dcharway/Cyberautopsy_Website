import type { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    "/",
    "/cmmc-level-2",
    "/services",
    "/process",
    "/industries",
    "/resources",
    "/about",
    "/contact"
  ];
  return paths.map((p) => ({
    url: `${SITE.domain}${p}`,
    lastModified: now,
    changeFrequency: p === "/resources" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.8
  }));
}
