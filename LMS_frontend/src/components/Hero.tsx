import React from 'react';
import { Link } from './ui/Link';

const Hero: React.FC = () => {
  return (
    <section 
      id="home" 
      className="relative h-screen bg-cover bg-center pt-24" 
      style={{
        backgroundImage: "url('https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-indigo-900 bg-opacity-60"></div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <h5 className="text-pink-200 font-medium mb-2 transform translate-y-6 opacity-0 animate-slideUp">
            The Path to Japanese Fluency Starts Here
          </h5>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 transform translate-y-6 opacity-0 animate-slideUp animation-delay-100">
            Master Japanese at <span className="text-pink-200">URJA</span>
          </h1>
          <p className="text-xl text-white mb-8 max-w-xl transform translate-y-6 opacity-0 animate-slideUp animation-delay-200">
            Learn Japanese from native speakers with our structured 4-level curriculum designed to take you from beginner to fluent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 transform translate-y-6 opacity-0 animate-slideUp animation-delay-300">
            <Link 
              href="#levels" 
              className="px-8 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors text-center"
            >
              Explore Our Courses
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 border-2 border-white text-white rounded-md font-medium hover:bg-white hover:text-indigo-900 transition-colors text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative wave */}
      {/* <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,186.7C960,213,1056,235,1152,224C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div> */}
    </section>
  );
};

export default Hero;