import React from 'react';
import jobSeekerServices from '../assets/data/jobSeekerServices';
import { JobSeekerService } from '../types/jobSeekerTypes';

const JobSeekerServices = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Your Career Success Toolkit
          </h2>
          <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
            Professional-grade resources to navigate every stage of your job search
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {jobSeekerServices.map((service: JobSeekerService) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard: React.FC<{ service: JobSeekerService }> = ({ service }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-6">
      <div className={`text-4xl mb-4 text-blue-600 ${service.icon}`} />
      <h3 className="text-xl font-bold mb-3">{service.title}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <ul className="space-y-2 mb-6">
        {service.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={service.cta.link}
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md transition-colors"
      >
        {service.cta.text}
      </a>
    </div>
  </div>
);


export default () => (
  <>
    <JobSeekerServices />
  </>
);