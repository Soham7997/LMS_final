import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { Link } from './ui/Link';
import Logo from './ui/Logo';
import NotificationBell from './ui/NotificationBell';
import { Notice } from '../types/api';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#home" className={`font-medium ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>Home</Link>
          <div className="relative group">
            <button className={`flex items-center font-medium ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>
              Courses <ChevronDown size={16} className="ml-1" />
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <Link href="#beginner" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900">Beginner (N5)</Link>
              <Link href="#elementary" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900">Elementary (N4)</Link>
              <Link href="#intermediate" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900">Intermediate (N3)</Link>
              <Link href="#advanced" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900">Advanced (N2-N1)</Link>
            </div>
          </div>
          <Link href="#about" className={`font-medium ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>About Us</Link>
          <Link href="#testimonials" className={`font-medium ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>Testimonials</Link>
          <Link href="#contact" className={`font-medium ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>Contact</Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <NotificationBell />
          <button className="flex items-center text-sm font-medium text-gray-600">
            <Globe size={16} className="mr-1" /> EN <ChevronDown size={14} />
          </button>
          <Link
            href="/login"
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isScrolled ? 'text-indigo-600 hover:text-indigo-800' : 'text-white hover:text-indigo-100'
            }`}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-800" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-white absolute w-full left-0 shadow-md transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen opacity-100 visible py-4' : 'max-h-0 opacity-0 invisible overflow-hidden'
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex flex-col space-y-4 pb-4">
            <Link href="#home" className="font-medium text-gray-800">Home</Link>
            <Link href="#beginner" className="font-medium text-gray-800 pl-4">- Beginner (N5)</Link>
            <Link href="#elementary" className="font-medium text-gray-800 pl-4">- Elementary (N4)</Link>
            <Link href="#intermediate" className="font-medium text-gray-800 pl-4">- Intermediate (N3)</Link>
            <Link href="#advanced" className="font-medium text-gray-800 pl-4">- Advanced (N2-N1)</Link>
            <Link href="#about" className="font-medium text-gray-800">About Us</Link>
            <Link href="#testimonials" className="font-medium text-gray-800">Testimonials</Link>
            <Link href="#contact" className="font-medium text-gray-800">Contact</Link>
            
            <div className="pt-2 flex flex-col space-y-2">
              <Link href="/login" className="w-full px-4 py-2 text-center border border-indigo-600 text-indigo-600 rounded-md font-medium">
                Log In
              </Link>
              <Link href="/signup" className="w-full px-4 py-2 text-center bg-red-600 text-white rounded-md font-medium">
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;