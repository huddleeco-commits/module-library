/**
 * ResponsiveHeader Component
 *
 * Production-ready responsive header with:
 * - Desktop navigation with optional portal dropdown
 * - Mobile hamburger menu with slide-out drawer
 * - Industry-aware portal menu items
 * - Full theme customization
 *
 * @module layout-responsive/ResponsiveHeader
 */

import React, { useState, useRef, useEffect } from 'react';

const ResponsiveHeader = ({
  // Branding
  logo,
  businessName,
  logoHref = '/',

  // Navigation
  navItems = [],

  // Portal/Auth (optional)
  showPortal = false,
  portalLabel = 'My Account',
  portalItems = [],
  userName = '',
  userAvatar = null,
  onLogin,
  onLogout,

  // CTA Button (shown when no portal)
  ctaLabel = 'Contact Us',
  ctaHref = '/contact',
  onCtaClick,

  // Theming
  primaryColor = '#6366f1',
  textColor = '#1a1a2e',
  backgroundColor = '#ffffff',

  // Behavior
  sticky = true,
  transparent = false,

  // Mobile
  mobileBreakpoint = 768
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef(null);

  // Close portal dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (portalRef.current && !portalRef.current.contains(e.target)) {
        setPortalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > mobileBreakpoint) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBreakpoint]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Get user initials for avatar fallback
  const userInitials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <>
      <header className={`rh ${sticky ? 'rh--sticky' : ''} ${transparent ? 'rh--transparent' : ''}`}>
        {/* Brand */}
        <a href={logoHref} className="rh__brand">
          {logo && <span className="rh__logo">{logo}</span>}
          <span className="rh__name">{businessName}</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="rh__nav">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href || '#'}
              className={`rh__nav-link ${item.active ? 'rh__nav-link--active' : ''}`}
              onClick={item.onClick}
            >
              {item.icon && <span className="rh__nav-icon">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="rh__right">
          {showPortal ? (
            <div className="rh__portal" ref={portalRef}>
              <button
                className="rh__portal-trigger"
                onClick={() => setPortalOpen(!portalOpen)}
              >
                <span className="rh__avatar">
                  {userAvatar || userInitials}
                </span>
                <span className="rh__portal-label">{portalLabel}</span>
                <span className={`rh__portal-arrow ${portalOpen ? 'rh__portal-arrow--open' : ''}`}>
                  ▼
                </span>
              </button>

              {portalOpen && (
                <div className="rh__portal-menu">
                  {userName && (
                    <div className="rh__portal-header">
                      <div className="rh__portal-user">{userName}</div>
                      <div className="rh__portal-subtitle">{portalLabel}</div>
                    </div>
                  )}
                  <div className="rh__portal-items">
                    {portalItems.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href || '#'}
                        className="rh__portal-item"
                        onClick={(e) => {
                          if (item.onClick) {
                            e.preventDefault();
                            item.onClick();
                          }
                          setPortalOpen(false);
                        }}
                      >
                        {item.icon && <span className="rh__portal-icon">{item.icon}</span>}
                        <span>{item.label}</span>
                        {item.badge && <span className="rh__portal-badge">{item.badge}</span>}
                      </a>
                    ))}
                  </div>
                  {onLogout && (
                    <div className="rh__portal-footer">
                      <button className="rh__logout" onClick={onLogout}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <a
              href={ctaHref}
              className="rh__cta"
              onClick={onCtaClick}
            >
              {ctaLabel}
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`rh__mobile-btn ${mobileMenuOpen ? 'rh__mobile-btn--open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="rh__hamburger" />
          <span className="rh__hamburger" />
          <span className="rh__hamburger" />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="rh__overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="rh__drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="rh__drawer-header">
              <a href={logoHref} className="rh__brand rh__brand--small">
                {logo && <span className="rh__logo">{logo}</span>}
                <span className="rh__name">{businessName}</span>
              </a>
              <button
                className="rh__close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Main Navigation */}
            <nav className="rh__drawer-section">
              <div className="rh__drawer-label">Menu</div>
              {navItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href || '#'}
                  className={`rh__drawer-link ${item.active ? 'rh__drawer-link--active' : ''}`}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.icon && <span className="rh__drawer-icon">{item.icon}</span>}
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Portal Section (if enabled) */}
            {showPortal && portalItems.length > 0 && (
              <nav className="rh__drawer-section rh__drawer-section--portal">
                <div className="rh__drawer-label">
                  <span>{portalLabel}</span>
                  {userName && <span className="rh__drawer-user">{userName}</span>}
                </div>
                {portalItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href || '#'}
                    className="rh__drawer-link"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon && <span className="rh__drawer-icon">{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.badge && <span className="rh__drawer-badge">{item.badge}</span>}
                  </a>
                ))}
              </nav>
            )}

            {/* Drawer Footer */}
            <div className="rh__drawer-footer">
              {showPortal && onLogout ? (
                <button
                  className="rh__drawer-btn rh__drawer-btn--logout"
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                >
                  Sign Out
                </button>
              ) : onLogin ? (
                <button
                  className="rh__drawer-btn"
                  onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                >
                  Sign In
                </button>
              ) : (
                <a
                  href={ctaHref}
                  className="rh__drawer-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {ctaLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ===== Base Header ===== */
        .rh {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 60px;
          background: ${backgroundColor};
          border-bottom: 1px solid rgba(0,0,0,0.08);
          z-index: 100;
        }

        @media (min-width: ${mobileBreakpoint + 1}px) {
          .rh {
            padding: 0 24px;
            height: 70px;
          }
        }

        .rh--sticky {
          position: sticky;
          top: 0;
        }

        .rh--transparent {
          background: transparent;
          border-bottom: none;
        }

        /* ===== Brand ===== */
        .rh__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
        }

        .rh__logo {
          font-size: 28px;
          line-height: 1;
        }

        .rh__name {
          font-size: 18px;
          font-weight: 700;
          color: ${primaryColor};
          white-space: nowrap;
        }

        .rh__brand--small .rh__name {
          font-size: 16px;
        }

        @media (max-width: 400px) {
          .rh__name {
            font-size: 16px;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        /* ===== Desktop Navigation ===== */
        .rh__nav {
          display: none;
          align-items: center;
          gap: 4px;
        }

        @media (min-width: ${mobileBreakpoint + 1}px) {
          .rh__nav {
            display: flex;
          }
        }

        .rh__nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          color: ${textColor};
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          opacity: 0.75;
          transition: all 0.2s;
        }

        .rh__nav-link:hover {
          opacity: 1;
          background: rgba(0,0,0,0.05);
        }

        .rh__nav-link--active {
          background: ${primaryColor};
          color: white;
          opacity: 1;
        }

        .rh__nav-icon {
          font-size: 16px;
        }

        /* ===== Desktop Right Section ===== */
        .rh__right {
          display: none;
          align-items: center;
          gap: 12px;
        }

        @media (min-width: ${mobileBreakpoint + 1}px) {
          .rh__right {
            display: flex;
          }
        }

        .rh__cta {
          padding: 10px 20px;
          background: ${primaryColor};
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .rh__cta:hover {
          filter: brightness(1.1);
        }

        /* ===== Portal Dropdown ===== */
        .rh__portal {
          position: relative;
        }

        .rh__portal-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 6px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 100px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s;
        }

        .rh__portal-trigger:hover {
          background: #e5e7eb;
        }

        .rh__avatar {
          width: 32px;
          height: 32px;
          background: ${primaryColor};
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }

        .rh__portal-label {
          display: none;
        }

        @media (min-width: 900px) {
          .rh__portal-label {
            display: inline;
          }
        }

        .rh__portal-arrow {
          font-size: 10px;
          color: #6b7280;
          transition: transform 0.2s;
        }

        .rh__portal-arrow--open {
          transform: rotate(180deg);
        }

        .rh__portal-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 240px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 150;
          animation: dropIn 0.2s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rh__portal-header {
          padding: 14px 16px;
          background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
          color: white;
        }

        .rh__portal-user {
          font-size: 15px;
          font-weight: 600;
        }

        .rh__portal-subtitle {
          font-size: 12px;
          opacity: 0.85;
          margin-top: 2px;
        }

        .rh__portal-items {
          padding: 8px 0;
        }

        .rh__portal-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          color: #374151;
          text-decoration: none;
          font-size: 14px;
          transition: background 0.15s;
        }

        .rh__portal-item:hover {
          background: #f9fafb;
        }

        .rh__portal-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .rh__portal-badge {
          margin-left: auto;
          padding: 2px 8px;
          background: #fef3c7;
          color: #92400e;
          font-size: 11px;
          font-weight: 600;
          border-radius: 100px;
        }

        .rh__portal-footer {
          padding: 8px 16px 14px;
          border-top: 1px solid #e5e7eb;
        }

        .rh__logout {
          width: 100%;
          padding: 10px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rh__logout:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* ===== Mobile Menu Button ===== */
        .rh__mobile-btn {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          padding: 8px;
          background: none;
          border: none;
          cursor: pointer;
        }

        @media (min-width: ${mobileBreakpoint + 1}px) {
          .rh__mobile-btn {
            display: none;
          }
        }

        .rh__hamburger {
          display: block;
          width: 22px;
          height: 2px;
          background: ${textColor};
          border-radius: 2px;
          transition: all 0.3s;
        }

        .rh__mobile-btn--open .rh__hamburger:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .rh__mobile-btn--open .rh__hamburger:nth-child(2) {
          opacity: 0;
        }

        .rh__mobile-btn--open .rh__hamburger:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* ===== Mobile Overlay & Drawer ===== */
        .rh__overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 200;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .rh__drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          max-width: 85vw;
          height: 100%;
          background: white;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.25s ease;
          overflow-y: auto;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .rh__drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .rh__close {
          width: 36px;
          height: 36px;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          font-size: 18px;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rh__close:hover {
          background: #e5e7eb;
        }

        /* ===== Drawer Sections ===== */
        .rh__drawer-section {
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .rh__drawer-section--portal {
          background: #f9fafb;
        }

        .rh__drawer-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rh__drawer-user {
          padding: 2px 8px;
          background: ${primaryColor};
          color: white;
          font-size: 10px;
          border-radius: 100px;
          text-transform: none;
          letter-spacing: 0;
        }

        .rh__drawer-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          color: #374151;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: background 0.15s;
        }

        .rh__drawer-link:hover {
          background: rgba(0,0,0,0.05);
        }

        .rh__drawer-link--active {
          background: ${primaryColor}15;
          color: ${primaryColor};
        }

        .rh__drawer-icon {
          font-size: 20px;
          width: 28px;
          text-align: center;
        }

        .rh__drawer-badge {
          margin-left: auto;
          padding: 2px 8px;
          background: #fef3c7;
          color: #92400e;
          font-size: 11px;
          font-weight: 600;
          border-radius: 100px;
        }

        /* ===== Drawer Footer ===== */
        .rh__drawer-footer {
          margin-top: auto;
          padding: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .rh__drawer-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: ${primaryColor};
          color: white;
          text-align: center;
          text-decoration: none;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rh__drawer-btn:hover {
          filter: brightness(1.1);
        }

        .rh__drawer-btn--logout {
          background: #f3f4f6;
          color: #6b7280;
        }

        .rh__drawer-btn--logout:hover {
          background: #fee2e2;
          color: #dc2626;
        }
      `}</style>
    </>
  );
};

export default ResponsiveHeader;
