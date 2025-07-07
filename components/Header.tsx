'use client';

import { Car, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white card-shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-xl">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ZE Zones</h1>
              <p className="text-sm text-gray-600">Nederland</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#map" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Kaart
            </a>
            <a href="#zones" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Zones
            </a>
            <a href="#check" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Voertuig Check
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Over
            </a>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-colors">
              Controleer Mijn Voertuig
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <a
                href="#map"
                className="text-gray-700 hover:text-primary-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kaart
              </a>
              <a
                href="#zones"
                className="text-gray-700 hover:text-primary-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Zones
              </a>
              <a
                href="#check"
                className="text-gray-700 hover:text-primary-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Voertuig Check
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-primary-600 font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Over
              </a>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left mt-3">
                Controleer Mijn Voertuig
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 