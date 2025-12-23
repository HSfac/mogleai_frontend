import { Providers } from './providers';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '몽글챗 - AI 캐릭터 챗봇 서비스',
  description: '나만의 AI 캐릭터를 만들고 대화해보세요!',
  metadataBase: new URL('https://mongl.ai'),
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
    title: '몽글챗 - AI 캐릭터 챗봇 서비스',
    description: '나만의 AI 캐릭터를 만들고 대화해보세요!',
    url: 'https://mongl.ai',
    siteName: '몽글챗',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '몽글챗 - AI 캐릭터 챗봇 서비스',
    description: '나만의 AI 캐릭터를 만들고 대화해보세요!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 