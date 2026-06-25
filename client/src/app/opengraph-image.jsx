import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NyayNow — AI Legal Intelligence & Lawyer Marketplace for India'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    position: 'relative',
                }}
            >
                {/* Decorative glow */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '300px',
                    background: 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)',
                    borderRadius: '50%',
                    display: 'flex',
                }} />

                {/* Logo / Brand name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #D4AF37, #B4912F)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        fontWeight: 800,
                        color: '#020617',
                    }}>
                        N
                    </div>
                    <div style={{
                        fontSize: '72px',
                        fontWeight: 800,
                        color: '#D4AF37',
                        letterSpacing: '-2px',
                        display: 'flex',
                    }}>
                        NyayNow
                    </div>
                </div>

                {/* Tagline */}
                <div style={{
                    fontSize: '28px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    maxWidth: '820px',
                    lineHeight: 1.4,
                    display: 'flex',
                }}>
                    AI Legal Intelligence &amp; Lawyer Marketplace for India
                </div>

                {/* Feature pills */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                    {['AI Legal Assistant', 'Verified Lawyers', 'Document Drafting', 'Legal SOS'].map(tag => (
                        <div
                            key={tag}
                            style={{
                                background: 'rgba(212,175,55,0.12)',
                                border: '1px solid rgba(212,175,55,0.35)',
                                borderRadius: '999px',
                                padding: '10px 22px',
                                fontSize: '16px',
                                color: '#D4AF37',
                                display: 'flex',
                            }}
                        >
                            {tag}
                        </div>
                    ))}
                </div>

                {/* Domain */}
                <div style={{
                    position: 'absolute',
                    bottom: '32px',
                    fontSize: '18px',
                    color: '#475569',
                    display: 'flex',
                }}>
                    nyaynow.in
                </div>
            </div>
        ),
        { ...size }
    )
}
