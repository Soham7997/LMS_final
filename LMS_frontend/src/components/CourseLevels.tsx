import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from './ui/Link';
import { levelData } from '../data/levelData';

interface CourseLevelCardProps {
  level: {
    id: string;
    title: string;
    jlptLevel: string;
    description: string;
    features: string[];
    image: string;
    color: string;
  };
  index: number;
}

const CourseLevelCard: React.FC<CourseLevelCardProps> = ({ level, index }) => {
  return (
    <div 
      id={level.id}
      className="relative group transition-all duration-300 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <div 
        className="h-48 bg-cover bg-center" 
        style={{ backgroundImage: `url(${level.image})` }}
      >
        <div className={`absolute inset-0 ${level.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      </div>
      <div className="p-6">
        <div className={`inline-flex items-center py-1 px-3 rounded-full text-sm font-medium ${level.color} bg-opacity-10 mb-4`}>
          {level.jlptLevel}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{level.title}</h3>
        <p className="text-gray-600 mb-4">{level.description}</p>
        <ul className="space-y-2 mb-6">
          {level.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <span className={`flex-shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full ${level.color} bg-opacity-20 text-sm mr-2 mt-0.5`}>
                ✓
              </span>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Link 
          href="#enroll" 
          className={`inline-flex items-center font-medium ${level.color.replace('bg-', 'text-')}`}
        >
          Learn more <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

const CourseLevels: React.FC = () => {
  return (
    <section id="levels" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h5 className="text-indigo-600 font-medium mb-2">Our Structured Learning Path</h5>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Four Levels to Japanese Mastery</h2>
          <p className="text-lg text-gray-600">
            Our carefully designed curriculum takes you through progressive levels, each building on the previous one to develop your Japanese language proficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {levelData.map((level, index) => (
            <CourseLevelCard key={level.id} level={level} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseLevels;