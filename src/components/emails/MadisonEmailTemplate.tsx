import React from 'react';

interface MadisonEmailProps {
  headline?: string;
  bodyContent?: React.ReactNode;
  buttonText?: string;
  buttonUrl?: string;
  footerLinks?: boolean;
}

export const MadisonEmailTemplate: React.FC<MadisonEmailProps> = ({
  headline = "Welcome to Madison",
  bodyContent,
  buttonText = "Confirm Email Address",
  buttonUrl = "#",
  footerLinks = true,
}) => {
  // Brand Colors
  const colors = {
    background: '#F5F1E8', // Vellum
    card: '#FFFCF5',       // Parchment
    text: '#1A1816',       // Ink
    subtext: '#2F2A26',    // Charcoal
    accent: '#B8956A',     // Brass
    border: '#E5DFD1',     // Stone
  };

  return (
    <div style={{ backgroundColor: colors.background, padding: '40px 0', fontFamily: "'Lato', sans-serif" }}>
      <table align="center" border={0} cellPadding={0} cellSpacing={0} width="100%" style={{ maxWidth: '600px', backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '4px' }}>
        {/* HEADER */}
        <tr>
          <td align="center" style={{ padding: '40px 0 30px 0', borderBottom: `1px solid ${colors.border}` }}>
            <h2 style={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontSize: '26px', 
              fontWeight: 600, 
              letterSpacing: '2px', 
              color: colors.text, 
              margin: 0, 
              textTransform: 'uppercase' 
            }}>
              Madison Studio
            </h2>
          </td>
        </tr>

        {/* BODY */}
        <tr>
          <td style={{ padding: '40px 50px' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.text, fontSize: '32px', marginBottom: '24px', textAlign: 'center' }}>
              {headline}
            </h1>
            
            <div style={{ fontSize: '16px', color: colors.subtext, lineHeight: '1.6', textAlign: 'center', marginBottom: '30px' }}>
              {bodyContent || (
                <>
                  <p>Thank you for joining Madison Studio. We are delighted to help you define your brand's voice with precision and elegance.</p>
                  <p>Please confirm your email address to begin your journey.</p>
                </>
              )}
            </div>

            {buttonUrl && (
              <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
                <tr>
                  <td align="center">
                    <a 
                      href={buttonUrl} 
                      style={{ 
                        backgroundColor: colors.accent, 
                        color: '#FFFFFF', 
                        padding: '14px 32px', 
                        borderRadius: '2px', 
                        fontWeight: 700, 
                        letterSpacing: '0.5px', 
                        textTransform: 'uppercase', 
                        fontSize: '13px', 
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      {buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            )}
          </td>
        </tr>

        {/* FOOTER */}
        <tr>
          <td style={{ backgroundColor: '#F9F7F2', padding: '30px 40px', borderTop: `1px solid ${colors.border}` }}>
            <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
              <tr>
                <td align="center" style={{ paddingBottom: '20px' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: colors.text, marginBottom: '10px', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                    Madison Studio
                  </p>
                  <p style={{ fontSize: '12px', color: '#888888', lineHeight: '1.6', margin: 0 }}>
                    31080 Union City Blvd. Suite 211<br />
                    Union City, CA 94587
                  </p>
                </td>
              </tr>
              {footerLinks && (
                <tr>
                  <td align="center">
                    <p style={{ fontSize: '12px', color: colors.accent, margin: 0 }}>
                      <a href="https://madisonstudio.io/help" style={{ color: colors.accent, textDecoration: 'none', margin: '0 10px' }}>Help Center</a> • 
                      <a href="https://madisonstudio.io/privacy" style={{ color: colors.accent, textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</a> • 
                      <a href="https://madisonstudio.io/terms" style={{ color: colors.accent, textDecoration: 'none', margin: '0 10px' }}>Terms of Service</a>
                    </p>
                  </td>
                </tr>
              )}
            </table>
          </td>
        </tr>
      </table>
      
      {/* COPYRIGHT */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: "'Lato', sans-serif", margin: 0 }}>
          &copy; 2025 Madison Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MadisonEmailTemplate;

