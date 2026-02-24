import React from 'react';
import { User, CalendarDays, MessageSquare, Video, BookOpen, Award } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, index }) => {
  return (
    <div 
      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      icon: <User size={24} />,
      title: "Native Instructors",
      description: "Learn from experienced native Japanese speakers who understand the nuances of the language and culture."
    },
    {
      icon: <CalendarDays size={24} />,
      title: "Flexible Scheduling",
      description: "Choose between morning, evening, or weekend classes to fit your busy lifestyle."
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Interactive Learning",
      description: "Practice your skills through conversation, role-playing, and real-world scenarios."
    },
    {
      icon: <Video size={24} />,
      title: "Online & In-Person",
      description: "Join classes in our modern facility or learn remotely through our interactive virtual classroom."
    },
    {
      icon: <BookOpen size={24} />,
      title: "Comprehensive Resources",
      description: "Access digital textbooks, audio recordings, practice exercises, and cultural materials."
    },
    {
      icon: <Award size={24} />,
      title: "JLPT Preparation",
      description: "Specific courses and resources to help you prepare for and pass the JLPT certification exams."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h5 className="text-indigo-600 font-medium mb-2">Why Choose Us</h5>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The URJA Experience</h2>
          <p className="text-lg text-gray-600">
            Our teaching methodology combines traditional techniques with modern approaches to ensure an effective and engaging learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;