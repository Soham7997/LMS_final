import React from 'react';
import { Link } from './ui/Link';

const CallToAction: React.FC = () => {
  return (
    <section 
      className="py-20 relative bg-indigo-900 overflow-hidden"
      style={{
        backgroundImage: "url('https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundBlendMode: "overlay"
      }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-pink-500 rounded-full opacity-10"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500 rounded-full opacity-10"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Begin Your Japanese Language Journey Today
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join our community of learners and embark on a rewarding path to Japanese fluency. New classes start monthly.
          </p>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Schedule Your Free Assessment</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Interested Level</label>
                <select 
                  id="level" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select your level</option>
                  <option value="beginner">Beginner (N5)</option>
                  <option value="elementary">Elementary (N4)</option>
                  <option value="intermediate">Intermediate (N3)</option>
                  <option value="advanced">Advanced (N2-N1)</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-3 px-6 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Schedule My Free Assessment
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;