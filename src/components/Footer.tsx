import { Link } from 'react-router-dom';
import { Mail, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const learnLinks = [
    { label: 'Courses', href: '/courses' },
    { label: 'Tutorials', href: '/tutorials' },
    { label: 'Store', href: '/store' },
    { label: 'Blog', href: '/blog' },
    { label: 'For Professionals', href: '/institutional' },
  ];

  const supportLinks = [
    { label: 'Contact', href: '/contact' },
    { label: 'Resources', href: '/resources' },
    { label: 'Roadmap', href: '/roadmap' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { icon: Mail, href: 'mailto:info@the3rdeyeadvisors.com', label: 'Email' },
    { icon: Mail, href: 'mailto:info@the3rdeyeadvisors.com', label: 'Email' },
    { icon: Instagram, href: 'https://instagram.com/sentineldefi', label: 'Instagram' },
  ];

  return (
    <footer className="relative border-t border-white/8 bg-white/3 backdrop-blur-sm">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 lg:py-12">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 items-start">
          {/* Learn Links */}
          <div>
            <h3 className="font-consciousness font-semibold text-sm text-foreground mb-3 uppercase tracking-wider h-5 flex items-center">
              Learn
            </h3>
            <ul className="space-y-2">
              {learnLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-primary transition-colors font-body min-h-[44px] flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-consciousness font-semibold text-sm text-foreground mb-3 uppercase tracking-wider h-5 flex items-center">
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-primary transition-colors font-body min-h-[44px] flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-consciousness font-semibold text-sm text-foreground mb-3 uppercase tracking-wider h-5 flex items-center">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-primary transition-colors font-body min-h-[44px] flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-consciousness font-semibold text-sm text-foreground mb-3 uppercase tracking-wider h-5 flex items-center">
              Connect
            </h3>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="w-11 h-11 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/50 hover:text-primary hover:border-primary/30 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-4 md:pt-6 border-t border-white/8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-consciousness font-bold text-foreground">Sentinel DeFi</span>
              <span className="text-xs text-white/50 font-consciousness">
                © {currentYear} All Rights Reserved
              </span>
            </div>
            <p className="text-xs text-white/30 font-consciousness text-center md:text-right max-w-md">
              Educational content only. Not financial advice. Always do your own research.
            </p>
          </div>
        </div>
      </div>
      
      {/* Safe area padding for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </footer>
  );
};

export default Footer;