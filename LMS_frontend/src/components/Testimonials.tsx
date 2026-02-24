import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  level: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Emily Johnson",
    role: "UX Designer",
    avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600",
    content: "Starting from zero Japanese knowledge, I've progressed to N3 level in just 18 months. The structured curriculum and supportive teachers made all the difference in my learning journey.",
    level: "Intermediate Student"
  },
  {
    id: 2,
    name: "David Chen",
    role: "Software Engineer",
    avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600",
    content: "The advanced business Japanese course prepared me perfectly for my job at a Tokyo tech company. The instructors focused on practical, everyday language that I use in my professional life.",
    level: "Advanced Graduate"
  },
  {
    id: 3,
    name: "Sophia Martinez",
    role: "University Student",
    avatar: "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=600",
    content: "I passed the JLPT N4 exam on my first try after completing the Elementary course. The practice tests and personalized feedback from my teachers were invaluable in my preparation.",
    level: "Elementary Graduate"
  }
];

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h5 className="text-indigo-600 font-medium mb-2">Student Success Stories</h5>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hear From Our Students</h2>
          <p className="text-lg text-gray-600">
            Our students have achieved remarkable success in their Japanese language journey. Here's what they have to say about their experience with us.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative md:flex">
              {/* Left decoration */}
              <div className="absolute top-0 left-0 h-20 w-20">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0C0 44.1828 35.8172 80 80 80V0H0Z" fill="#F9FAFB"/>
                </svg>
              </div>
              
              {/* Testimonial content */}
              <div className="p-8 md:p-12 md:w-2/3">
                <div>
                  <div className="inline-flex items-center space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="text-xl font-medium text-gray-800 mb-8">
                    "{testimonials[activeIndex].content}"
                  </blockquote>
                  
                  <div className="flex items-center">
                    <img 
                      src={testimonials[activeIndex].avatar} 
                      alt={testimonials[activeIndex].name} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{testimonials[activeIndex].name}</div>
                      <div className="text-indigo-600">{testimonials[activeIndex].level}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image */}
              <div className="md:w-1/3 relative">
                <img 
                  src="https://images.pexels.com/photos/7516347/pexels-photo-7516347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Japanese class" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-900 bg-opacity-20"></div>
              </div>

              {/* Navigation dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:left-auto md:right-8 md:bottom-8 md:translate-x-0 flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      activeIndex === index ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;