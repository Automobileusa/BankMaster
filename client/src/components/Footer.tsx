
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              Diversity
            </a>
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              Disclosures
            </a>
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              Online Privacy
            </a>
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              About Key
            </a>
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              Terms of Use
            </a>
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              Accessibility
            </a>
          </div>

          {/* FDIC Logo */}
          <div className="flex justify-center">
            <img 
              src="https://ibx.key.com/ibxolb/styles/assets/logo/key/fdic-logo-mobile-web.svg" 
              alt="FDIC Member"
              className="h-8"
            />
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-gray-500">
            <p>© 2024 KeyCorp. KeyBank is Member FDIC.</p>
            <p className="mt-1">All Rights Reserved. Equal Housing Lender.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
