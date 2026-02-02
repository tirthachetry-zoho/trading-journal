import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B1220',
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 42,
            background: 'linear-gradient(135deg, #2563EB 0%, #22C55E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: -1,
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            }}
          >
            TJ
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
