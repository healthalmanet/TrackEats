import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#1A1A1A] text-[#EDEDED] font-['Poppins']">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              {/* <img
                src={logo}
                alt="TrackEats Logo"
                className="h-10 w-auto object-contain"
              /> */}
              <span className="text-[#FF7043] font-bold text-xl tracking-wide">TrackEats</span>
            </div>

            <p className="text-[#CCCCCC] leading-relaxed mb-6 max-w-md">
              Smart nutrition tracking for a healthier lifestyle. Monitor, analyze, and optimize your daily nutrition intake.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-[#333] hover:bg-[#FF7043] hover:border-[#FF7043] transition duration-200"
                  aria-label="Social Icon"
                >
                  <Icon className="w-4 h-4 text-[#AAAAAA] hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-[#FF7043] mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['Dashboard', 'Tools', 'Profile', 'Support'].map((label, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-[#CCCCCC] hover:text-[#FFD1B7] transition duration-200 block py-1"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-[#FF7043] mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((label, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-[#CCCCCC] hover:text-[#FFD1B7] transition duration-200 block py-1"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-[#888] mt-16">
          © 2025 <span className="text-[#FF7043] font-medium">TrackEats</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
