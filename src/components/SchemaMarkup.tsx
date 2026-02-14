'use client';

import { useEffect } from 'react';

export default function SchemaMarkup() {
  useEffect(() => {
    // Organization schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Hygiene Shelf',
      alternateName: 'Dr. Bushra Mirza Health & Hygiene',
      url: 'https://hygieneshelf.in',
      logo: 'https://hygieneshelf.in/Images/thelogohytitle.png',
      sameAs: [
        'https://www.facebook.com/hygieneshelf',
        'https://www.instagram.com/hygieneshelf',
        'https://twitter.com/drbushramirza'
      ],
      description: 'Expert health and hygiene advice from Dr. Bushra Mirza. Discover essential tips for oral care, kids hygiene, mental wellness, and family health practices.'
    };

    // HealthProfessional schema
    const healthProfessionalSchema = {
      '@context': 'https://schema.org',
      '@type': 'HealthProfessional',
      '@id': 'https://hygieneshelf.in/#healthprofessional',
      name: 'Dr. Bushra Mirza',
      jobTitle: 'Pediatric Dentist and Health Expert',
      worksFor: {
        '@type': 'Organization',
        name: 'Hygiene Shelf'
      },
      areaServed: 'India',
      availableLanguage: ['English', 'Hindi'],
      description: 'Pediatric Dentist and Health Expert specializing in oral care, kids hygiene, and family health practices',
      image: 'https://hygieneshelf.in/Images/dr-bushra-hr-1.jpeg',
      url: 'https://hygieneshelf.in',
      sameAs: [
        'https://www.facebook.com/hygieneshelf',
        'https://www.instagram.com/hygieneshelf',
        'https://twitter.com/drbushramirza'
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '50'
      }
    };

    // LocalBusiness schema
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      name: 'Hygiene Shelf',
      image: 'https://hygieneshelf.in/Images/thelogohytitle.png',
      '@id': 'https://hygieneshelf.in/',
      url: 'https://hygieneshelf.in',
      telephone: '+91 952 904 5550',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Consultation available online',
        addressLocality: 'India',
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 28.6139,
        longitude: 77.2090
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        opens: '09:00',
        closes: '18:00',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      sameAs: [
        'https://www.facebook.com/hygieneshelf',
        'https://www.instagram.com/hygieneshelf',
        'https://twitter.com/drbushramirza'
      ],
      description: 'Expert health and hygiene guidance from Dr. Bushra Mirza. Evidence-based articles on oral care, kids hygiene, mental wellness, and family health practices.'
    };

    // Add schemas to the page
    const schemas = [organizationSchema, healthProfessionalSchema, localBusinessSchema];
    
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      // Clean up scripts when component unmounts
      const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
      ldJsonScripts.forEach(script => {
        if (script.innerHTML.includes('hygieneshelf.in') || script.innerHTML.includes('Dr. Bushra Mirza')) {
          document.head.removeChild(script);
        }
      });
    };
  }, []);

  return null;
}