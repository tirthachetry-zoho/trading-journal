import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B1220 0%, #111827 50%, #0B1220 100%)',
        }}
      >
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: 96,
            background: 'linear-gradient(135deg, #2563EB 0%, #22C55E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 132,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            }}
          >
            <div style={{ fontSize: 150, marginBottom: 10 }}>TJ</div>
            <div style={{ fontSize: 34, opacity: 0.9, fontWeight: 700 }}>Trading</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
