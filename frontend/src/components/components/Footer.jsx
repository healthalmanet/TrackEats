import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    // Footer now uses the theme's main background and body text color
    <footer className="bg-main text-body font-['Poppins']">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              {/* Logo now uses the primary theme color */}
              <span className="text-primary font-bold text-xl tracking-wide">TrackEats</span>
            </div>

            <p className="text-body leading-relaxed mb-6 max-w-md">
              Smart nutrition tracking for a healthier lifestyle. Monitor, analyze, and optimize your daily nutrition intake.
            </p>

            {/* Social Media Links with theme colors */}
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  // Border and hover effects now use theme variables
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-custom hover:bg-primary hover:border-primary transition duration-200"
                  aria-label="Social Icon"
                >
                  {/* Icon color uses body text and changes to light text on hover */}
                  <Icon className="w-4 h-4 text-body/70 group-hover:text-light" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            {/* Heading uses primary theme color */}
            <h4 className="text-lg font-semibold text-primary mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['Dashboard', 'Tools', 'Profile', 'Support'].map((label, i) => (
                <li key={i}>
                  <a
                    href="#"
                    // Link hover effect uses primary theme color
                    className="text-body hover:text-primary transition duration-200 block py-1"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            {/* Heading uses primary theme color */}
            <h4 className="text-lg font-semibold text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((label, i) => (
                <li key={i}>
                  <a
                    href="#"
                    // Link hover effect uses primary theme color
                    className="text-body hover:text-primary transition duration-200 block py-1"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Note with theme colors */}
        <p className="text-center text-sm text-body/70 mt-16">
          © 2025 <span className="text-primary font-medium">TrackEats</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;