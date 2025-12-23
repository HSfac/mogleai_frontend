import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '몽글챗 - AI 캐릭터 챗봇 서비스';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Cloud character */}
        <div
          style={{
            width: 200,
            height: 200,
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              fontSize: 100,
              display: 'flex',
            }}
          >
            ☁️
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex',
          }}
        >
          몽글챗
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.9)',
            display: 'flex',
          }}
        >
          나만의 AI 캐릭터를 만들고 대화해보세요!
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
