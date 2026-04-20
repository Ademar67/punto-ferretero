import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon({
  params,
}: {
  params: { size?: string }
}) {
  const iconSize = Number(params?.size || 512)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#dc2626',
          color: '#ffffff',
          fontSize: iconSize * 0.36,
          fontWeight: 800,
          fontFamily: 'Arial, sans-serif',
          borderRadius: 96,
        }}
      >
        PF
      </div>
    ),
    {
      width: iconSize,
      height: iconSize,
    }
  )
}