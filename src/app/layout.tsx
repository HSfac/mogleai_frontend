import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: '몽글AI - AI 캐릭터 챗봇 서비스',
  description: '나만의 AI 캐릭터를 만들고 대화해보세요!',
  metadataBase: new URL('https://mongl.ai'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: '몽글AI - AI 캐릭터 챗봇 서비스',
    description: '나만의 AI 캐릭터를 만들고 대화해보세요!',
    url: 'https://mongl.ai',
    siteName: '몽글AI',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '몽글AI - AI 캐릭터 챗봇 서비스',
    description: '나만의 AI 캐릭터를 만들고 대화해보세요!',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '몽글AI',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
