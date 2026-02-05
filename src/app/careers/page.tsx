'use client';

import { useState } from 'react';

export default function CareersPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    location: '',
    ageGroup: '',
    educationLevel: '',
    otherEducation: '',
    position: '',
    experienceLevel: '',
    otherExperience: '',
    resume: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, resume: file }));
    if (errors.resume) {
      setErrors(prev => ({ ...prev, resume: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email Address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.ageGroup) newErrors.ageGroup = 'Age Group is required';
    if (!formData.educationLevel) newErrors.educationLevel = 'Education Level is required';
    if (formData.educationLevel === 'Other' && !formData.otherEducation.trim()) newErrors.otherEducation = 'Please specify your education level';
    if (!formData.position) newErrors.position = 'Internship Position is required';
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience Level is required';
    if (formData.experienceLevel === 'Other' && !formData.otherExperience.trim()) newErrors.otherExperience = 'Please specify your experience level';
    if (!formData.resume) newErrors.resume = 'Resume upload is required';
    else if (formData.resume.size > 10 * 1024 * 1024) newErrors.resume = 'File size must be less than 10 MB';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Prepare form data for API submission
        const formDataToSend = new FormData();
        formDataToSend.append('fullName', formData.fullName.trim());
        formDataToSend.append('email', formData.email.trim());
        formDataToSend.append('contactNumber', formData.contactNumber.trim());
        formDataToSend.append('location', formData.location.trim());
        formDataToSend.append('ageGroup', formData.ageGroup);
        formDataToSend.append('education', formData.educationLevel === 'Other' ? formData.otherEducation : formData.educationLevel);
        formDataToSend.append('internshipPosition', formData.position);
        formDataToSend.append('experience', formData.experienceLevel === 'Other' ? formData.otherExperience : formData.experienceLevel);

        if (formData.resume) {
          formDataToSend.append('resume', formData.resume);
        }

        // Send to backend
        const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080';
        const response = await fetch(`${API_BASE}/job-applications`, {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Server response:', errorData);
          throw new Error(`Failed to submit application: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Application submitted successfully:', result);
        alert('Application submitted successfully!');

        // Reset form
        setFormData({
          fullName: '',
          email: '',
          contactNumber: '',
          location: '',
          ageGroup: '',
          educationLevel: '',
          otherEducation: '',
          position: '',
          experienceLevel: '',
          otherExperience: '',
          resume: null,
        });
      } catch (error) {
        console.error('Error submitting application:', error);
        let errorMessage = 'Failed to submit application. Please try again.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4m0 2v8a2 2 0 002 2h4a2 2 0 002-2V6m0 0V4" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">Join Our Team</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">Embark on a transformative journey with Hygiene Shelf. We're looking for passionate individuals ready to make an impact in healthcare and wellness.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 md:p-12 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Applicant Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Applicant Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="mt-2 text-sm text-red-500 font-medium">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                    placeholder="+91 98765 43210"
                  />
                  {errors.contactNumber && <p className="mt-2 text-sm text-red-500 font-medium">{errors.contactNumber}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                    placeholder="City, State/Country"
                  />
                  {errors.location && <p className="mt-2 text-sm text-red-500 font-medium">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-8 0H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Personal Details</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Age Group *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['< 18', '18 – 28', '29 – 38', '> 38'].map((age) => (
                      <label key={age} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="ageGroup"
                          value={age}
                          checked={formData.ageGroup === age}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="p-3 border-2 border-slate-200 rounded-xl peer-checked:border-teal-400 peer-checked:bg-teal-50 transition-all duration-200 hover:border-teal-300 text-center font-medium text-slate-700 peer-checked:text-teal-700">
                          {age}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.ageGroup && <p className="mt-2 text-sm text-red-500 font-medium">{errors.ageGroup}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="educationLevel" className="block text-sm font-semibold text-slate-700 mb-2">
                      Education Level *
                    </label>
                    <select
                      id="educationLevel"
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800"
                    >
                      <option value="">Select Education Level</option>
                      <option value="10th / 12th">10th / 12th</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post-Graduate">Post-Graduate</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.educationLevel && <p className="mt-2 text-sm text-red-500 font-medium">{errors.educationLevel}</p>}
                  </div>

                  {formData.educationLevel === 'Other' && (
                    <div>
                      <label htmlFor="otherEducation" className="block text-sm font-semibold text-slate-700 mb-2">
                        Please specify
                      </label>
                      <input
                        type="text"
                        id="otherEducation"
                        name="otherEducation"
                        value={formData.otherEducation}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                        placeholder="Specify your education"
                      />
                      {errors.otherEducation && <p className="mt-2 text-sm text-red-500 font-medium">{errors.otherEducation}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Internship Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Internship Details</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="position" className="block text-sm font-semibold text-slate-700 mb-2">
                    Internship Position Applied For *
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800"
                  >
                    <option value="">Select Position</option>
                    <option value="Content Writer / Editor">Content Writer / Editor</option>
                    <option value="Content Strategist">Content Strategist</option>
                    <option value="Website Manager">Website Manager</option>
                    <option value="WhatsApp Community Engagement Associate">WhatsApp Community Engagement Associate</option>
                    <option value="Email Marketing / Lead Generation">Email Marketing / Lead Generation</option>
                    <option value="Brand Partnership / Business Development Executive">Brand Partnership / Business Development Executive</option>
                    <option value="Social Media Manager">Social Media Manager</option>
                  </select>
                  {errors.position && <p className="mt-2 text-sm text-red-500 font-medium">{errors.position}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-semibold text-slate-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800"
                    >
                      <option value="">Select Experience Level</option>
                      <option value="Fresher">Fresher</option>
                      <option value="Student">Student</option>
                      <option value="Experience in similar field">Experience in similar field</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.experienceLevel && <p className="mt-2 text-sm text-red-500 font-medium">{errors.experienceLevel}</p>}
                  </div>

                  {formData.experienceLevel === 'Other' && (
                    <div>
                      <label htmlFor="otherExperience" className="block text-sm font-semibold text-slate-700 mb-2">
                        Please specify
                      </label>
                      <input
                        type="text"
                        id="otherExperience"
                        name="otherExperience"
                        value={formData.otherExperience}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-800 placeholder-slate-400"
                        placeholder="Specify your experience"
                      />
                      {errors.otherExperience && <p className="mt-2 text-sm text-red-500 font-medium">{errors.otherExperience}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Document Upload</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="resume" className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Latest Resume *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="block w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-teal-400 file:to-cyan-400 file:text-white hover:file:from-teal-500 hover:file:to-cyan-500 cursor-pointer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Maximum file size: 10 MB. Supported formats: PDF, DOC, DOCX</p>
                  {errors.resume && <p className="mt-2 text-sm text-red-500 font-medium">{errors.resume}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-teal-200 focus:ring-opacity-50"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Submit Application</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}