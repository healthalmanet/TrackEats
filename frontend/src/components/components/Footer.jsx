import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { CiForkAndKnife } from "react-icons/ci";
import logo from "../../assets/logo.png"

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
  <img
    src={logo}
    alt="TrackEats Logo"
    className="h-10 w-auto object-contain"
  />
</div>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
              Smart nutrition tracking for a healthier lifestyle. Monitor, analyze, and optimize your daily nutrition intake.
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-green-500 hover:border-gray-300 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-gray-600" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-green-500 hover:border-gray-300 transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-gray-600" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-green-500 hover:border-gray-300 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-green-600 transition-colors duration-200 block py-1"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-green-600 transition-colors duration-200 block py-1"
                >
                  Tools
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-green-600 transition-colors duration-200 block py-1"
                >
                  Profile
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-green-600 transition-colors duration-200 block py-1"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-green-600 transition-colors duration-200 block py-1"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-green-600 transition-colors duration-200 block py-1"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-green-600 transition-colors duration-200 block py-1"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

           
          </div>
               

        </div>
      </div>
        <p className="text-center text-gray-500 text-sm">
              © 2025 TrackEats. All rights reserved.
            </p>
        
    </footer>
  );
};

export default Footer;