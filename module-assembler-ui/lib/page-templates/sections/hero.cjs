/**
 * Hero Section Variants
 *
 * Each variant uses the SAME data but renders differently.
 * AI Visual Freedom can customize these or create new variants.
 */

/**
 * Centered Hero - Patient Focused
 * Large centered text, warm and welcoming
 */
function heroCentered(data, colors) {
  return `
function HeroSection() {
  return (
    <section style={{
      minHeight: '90vh',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 20px',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '800px', color: 'white' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '10px 20px',
          borderRadius: '50px',
          marginBottom: '32px'
        }}>
          <Award size={20} />
          <span style={{ fontWeight: '500' }}>Trusted Healthcare Provider</span>
        </div>

        <h1 style={{
          fontSize: '60px',
          fontWeight: '700',
          lineHeight: 1.1,
          marginBottom: '24px'
        }}>
          ${data.headline || 'Your Health, Our Priority'}
        </h1>

        <p style={{
          fontSize: '22px',
          opacity: 0.9,
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          ${data.subheadline || 'Compassionate care for you and your family'}
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/appointments" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '18px 36px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <Calendar size={22} />
            ${data.cta || 'Book Appointment'}
          </Link>

          <Link to="/patient-portal" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            <User size={22} />
            ${data.secondaryCta || 'Patient Portal'}
          </Link>
        </div>
      </div>
    </section>
  );
}`;
}

/**
 * Split Hero - Medical Professional
 * Text on left, image/graphic on right
 */
function heroSplit(data, colors, business) {
  return `
function HeroSection() {
  return (
    <section style={{
      minHeight: '80vh',
      backgroundColor: '${colors.background}',
      display: 'flex',
      alignItems: 'center',
      padding: '80px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'center'
      }}>
        {/* Left: Content */}
        <div>
          <div style={{
            display: 'inline-block',
            backgroundColor: '${colors.primary}15',
            color: '${colors.primary}',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            ${business?.industry || 'Healthcare'}
          </div>

          <h1 style={{
            fontSize: '52px',
            fontWeight: '700',
            lineHeight: 1.15,
            marginBottom: '24px',
            color: '${colors.text}'
          }}>
            ${data.headline || 'Expert Medical Care'}
          </h1>

          <p style={{
            fontSize: '18px',
            color: '${colors.text}',
            opacity: 0.7,
            marginBottom: '32px',
            lineHeight: 1.7
          }}>
            ${data.subheadline || 'Trusted by thousands of patients'}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <Link to="/appointments" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '${colors.primary}',
              color: 'white',
              padding: '16px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              <Calendar size={20} />
              ${data.cta || 'Schedule Visit'}
            </Link>
            <a href="tel:${business?.phone || '5551234567'}" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: '${colors.text}',
              padding: '16px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              border: '2px solid rgba(0,0,0,0.1)'
            }}>
              <Phone size={20} />
              Call Us
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '${colors.primary}' }}>20+</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Years Experience</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '${colors.primary}' }}>50k+</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Patients Served</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '${colors.primary}' }}>4.9</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Patient Rating</div>
            </div>
          </div>
        </div>

        {/* Right: Image/Graphic */}
        <div style={{
          height: '500px',
          backgroundColor: '${colors.primary}10',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#059669" />
              <span style={{ fontWeight: '600' }}>Board Certified</span>
            </div>
          </div>
          <Stethoscope size={120} color="${colors.primary}" style={{ opacity: 0.2 }} />
        </div>
      </div>
    </section>
  );
}`;
}

/**
 * Minimal Hero - Clinical Dashboard
 * Compact, efficient, quick access focused
 */
function heroMinimal(data, colors, business) {
  return `
function HeroSection() {
  return (
    <section style={{
      backgroundColor: '${colors.primary}',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            ${data.headline || 'Welcome to ' + (business?.name || 'Our Practice')}
          </h1>
          <p style={{ opacity: 0.9 }}>${data.subheadline || 'Access your health information'}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/patient-portal" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <User size={18} />
            Patient Portal
          </Link>
          <Link to="/appointments" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Calendar size={18} />
            Book Now
          </Link>
        </div>
      </div>
    </section>
  );
}`;
}

/**
 * Get hero variant by layout style
 */
function getHeroVariant(layoutStyle) {
  const variants = {
    'centered': heroCentered,
    'split': heroSplit,
    'minimal': heroMinimal
  };
  return variants[layoutStyle] || heroCentered;
}

module.exports = {
  heroCentered,
  heroSplit,
  heroMinimal,
  getHeroVariant
};
