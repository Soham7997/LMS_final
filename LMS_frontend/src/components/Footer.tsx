import React from 'react';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from './ui/Link';
import Logo from './ui/Logo';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Info */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-600 mb-6">
              Providing quality Japanese language education since 2010. Our mission is to bring Japanese language and culture to students worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="#home" className="text-gray-600 hover:text-indigo-600 transition-colors">Home</Link></li>
              <li><Link href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors">About Us</Link></li>
              <li><Link href="#levels" className="text-gray-600 hover:text-indigo-600 transition-colors">Courses</Link></li>
              <li><Link href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition-colors">Testimonials</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</Link></li>
              <li><Link href="#contact" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Courses */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Our Courses</h4>
            <ul className="space-y-2">
              <li><Link href="#beginner" className="text-gray-600 hover:text-indigo-600 transition-colors">Beginner (N5)</Link></li>
              <li><Link href="#elementary" className="text-gray-600 hover:text-indigo-600 transition-colors">Elementary (N4)</Link></li>
              <li><Link href="#intermediate" className="text-gray-600 hover:text-indigo-600 transition-colors">Intermediate (N3)</Link></li>
              <li><Link href="#advanced" className="text-gray-600 hover:text-indigo-600 transition-colors">Advanced (N2)</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Business Japanese</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">JLPT Preparation</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex">
                <MapPin className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                {/* <span className="text-gray-600">123 Language Street, Tokyo, Japan 100-0001</span> */}
              </li>
              <li className="flex">
                <Phone className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                <span className="text-gray-600">+81 3-1234-5678</span>
              </li>
              <li className="flex">
                <Mail className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                <span className="text-gray-600">info@urja.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-200 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} URJA Japanese Learning & Consulting. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-600 text-sm hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-600 text-sm hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-gray-600 text-sm hover:text-indigo-600 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;