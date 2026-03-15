import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mongl.ai';
  const locales = ['ko', 'en'];
  const currentDate = new Date();

  // 정적 페이지 목록
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/characters', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/characters/popular', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/leaderboard', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  // 모든 로케일에 대한 URL 생성
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      urls.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  return urls;
}
