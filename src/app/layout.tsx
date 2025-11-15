import { Providers } from './providers';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '몽글챗 - AI 캐릭터 챗봇 서비스',
  description: '나만의 AI 캐릭터를 만들고 대화해보세요!',
  metadataBase: new URL('https://mongl.ai'),
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