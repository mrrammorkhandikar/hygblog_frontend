'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Award, Heart, Users, Twitter, Linkedin, Facebook, Instagram, Youtube, Globe, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Author {
id: string;
username: string;
blog_name?: string;
email?: string;
authers_image?: string;
description?: string;
title?: string;
socialmedia?: any[];
}

interface Team {
id: string;
name: string;
title?: string;
description?: string;
socialmedia?: any[];
image?: string;
}

export default function AboutPage() {
const [authors, setAuthors] = useState<Author[]>([]);
const [teams, setTeams] = useState<Team[]>([]);
const [loading, setLoading] = useState(true);

// Fetch authors and teams data
useEffect(() => {
const fetchData = async () => {
try {
const [authorsResponse, teamsResponse] = await Promise.all([
fetch('/api/authors'),
fetch('/api/teams')
]);

if (authorsResponse.ok) {
const authorsData = await authorsResponse.json();
setAuthors(authorsData);
}

if (teamsResponse.ok) {
const teamsData = await teamsResponse.json();
setTeams(teamsData);
}
} catch (error) {
console.error('Error fetching data:', error);
} finally {
setLoading(false);
}
};

fetchData();
}, []);

// Framer motion variants
const fadeInUp = {
hidden: { opacity: 0, y: 30 },
visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
};

const stagger = {
hidden: {},
visible: { transition: { staggerChildren: 0.12 } },
};

return (
<div className="min-h-screen bg-gradient-to-b from-[#f7fdff] via-[#eefdfa] to-[#f3fbff] text-slate-800 antialiased">
{/* ---------- Hero Section ---------- */}
<header className="relative overflow-hidden">
<div
className="absolute inset-0 pointer-events-none"
aria-hidden
style={{
background:
'radial-gradient(closest-side, rgba(14,165,233,0.06), transparent 40%), radial-gradient(closest-side, rgba(15,118,110,0.04), transparent 30%)',
}}
/>
<div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28">
<div className="text-center">
<motion.h1
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 1 }}
className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
style={{ fontFamily: `"Playfair Display", serif` }}
>
<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#0ea5a3] to-[#0f766e]">
Meet Dr. Bushra Mirza
</span>
</motion.h1>

<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.3, duration: 1 }}
className="mt-6 text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed"
style={{ fontFamily: `"Inter", sans-serif` }}
>
A dedicated physician and hygiene advocate committed to empowering families with
practical, evidence-based health guidance. Through HygineShelf, Dr. Bushra shares
her expertise to help build healthier, happier lives.
</motion.p>

<motion.div
className="mt-8 flex flex-wrap justify-center gap-4"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.6, duration: 0.7 }}
>
<Button
                onClick={() => (window.location.href = '/blogs')}
                className="bg-[#0f766e] hover:bg-[#0d5e59] text-white inline-flex items-center justify-center rounded-full px-[31px] py-[19px] text-[15px] border border-[#c6f6e6] transition shadow-sm"
              >
                Explore Insights
              </Button>

              <Button
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center rounded-full px-[31px] py-[19px] text-[15px] border border-[#c6f6e6] text-[#0f766e] bg-white/60 hover:bg-white transition shadow-sm"
              >
                Get in Touch
              </Button>
</motion.div>
</div>
</div>

{/* Decorative gradient divider */}
<div className="h-20 -mt-6 pointer-events-none">
<svg viewBox="0 0 1440 120" className="w-full block" preserveAspectRatio="none">
<defs>
<linearGradient id="g1" x1="0" x2="1">
<stop offset="0%" stopColor="#ecfeff" />
<stop offset="100%" stopColor="#ffffff" />
</linearGradient>
</defs>
<path
d="M0,40 C240,100 480,0 720,40 C960,80 1200,20 1440,60 L1440 120 L0 120 Z"
fill="url(#g1)"
opacity="0.95"
/>
</svg>
</div>
</header>

{/* ---------- About Section ---------- */}
<section className="relative bg-white -mt-8 pt-16 pb-20">
<div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
<motion.div
variants={stagger}
initial="hidden"
whileInView="visible"
viewport={{ once: true, amount: 0.2 }}
className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
>
{/* Photo */}
<motion.div variants={fadeInUp} className="flex justify-center md:justify-start">
<motion.img
src="/Images/DrBushraMirza.jpeg"
alt="Dr. Bushra Mirza"
className="w-72 md:w-96 rounded-3xl shadow-2xl border-4 border-[#ecfeff]"
animate={{ y: [0, -6, 0] }}
transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
/>
</motion.div>

{/* About text */}
<motion.div variants={fadeInUp} className="prose prose-slate max-w-none">
<h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl md:text-4xl text-[#0f766e] font-bold mb-6">
Physician, Educator, and Hygiene Advocate
</h2>

<p className="text-lg text-slate-700 mt-3">
Dr. Bushra Mirza brings together years of clinical experience with a passion for
public health education. Her medical background, combined with her dedication to
community wellness, drives her mission to make health information accessible and actionable.
</p>

<p className="text-slate-700 mt-4">
Through HygineShelf, she bridges the gap between medical expertise and everyday life,
offering practical advice on hygiene, infection prevention, nutrition, and mental wellbeing.
Her approach focuses on sustainable habits that families can easily incorporate into their routines.
</p>

<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="bg-[#f0fdfa] border border-[#e6fffa] p-4 rounded-lg shadow-sm">
<h4 className="text-[#0f766e] font-semibold">Medical Expertise</h4>
<p className="text-sm text-slate-600 mt-1">Clinical practice in healthcare</p>
</div>

<div className="bg-[#eff6ff] border border-[#e6f2ff] p-4 rounded-lg shadow-sm">
<h4 className="text-[#0f766e] font-semibold">Public Health Focus</h4>
<p className="text-sm text-slate-600 mt-1">Community education & outreach</p>
</div>

<div className="bg-[#fef7ff] border border-[#fdf4ff] p-4 rounded-lg shadow-sm">
<h4 className="text-[#0f766e] font-semibold">Data Management</h4>
<p className="text-sm text-slate-600 mt-1">Healthcare data analysis & management</p>
</div>

</div>
</motion.div>
</motion.div>
</div>
</section>

{/* ---------- Values Section ---------- */}
<section className="py-20 bg-gradient-to-b from-[#f7fffd] to-white">
<div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
<motion.div
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
className="text-center mb-12"
>
<h3 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
Core Values
</h3>
<p className="text-lg text-slate-600 max-w-2xl mx-auto">
The principles that guide Dr. Bushra's work and the foundation of HygineShelf
</p>
</motion.div>

<motion.div
variants={stagger}
initial="hidden"
whileInView="visible"
viewport={{ once: true, amount: 0.2 }}
className="grid grid-cols-1 md:grid-cols-3 gap-8"
>
<motion.div
variants={fadeInUp}
className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
>
<div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-6">
<Award className="w-8 h-8 text-[#0f766e]" />
</div>
<h4 className="text-xl font-semibold text-[#0f766e] mb-4">Evidence-Based</h4>
<p className="text-slate-600">
All advice is grounded in scientific research and clinical experience,
ensuring reliable and trustworthy guidance.
</p>
</motion.div>

<motion.div
variants={fadeInUp}
className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
>
<div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-6">
<Heart className="w-8 h-8 text-[#0f766e]" />
</div>
<h4 className="text-xl font-semibold text-[#0f766e] mb-4">Compassionate</h4>
<p className="text-slate-600">
Understanding that health challenges affect real people,
with empathy and support at the heart of every interaction.
</p>
</motion.div>

<motion.div
variants={fadeInUp}
className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
>
<div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-6">
<Users className="w-8 h-8 text-[#0f766e]" />
</div>
<h4 className="text-xl font-semibold text-[#0f766e] mb-4">Accessible</h4>
<p className="text-slate-600">
Making complex health information simple, practical, and available
to everyone, regardless of background or expertise.
</p>
</motion.div>
</motion.div>
</div>
</section>



{/* ---------- Authors Section ---------- */}
{authors.length > 0 && (
<section className="py-20 bg-white">
<div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
<motion.div
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
className="text-center mb-12"
>
<h3 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
Our Authors
</h3>
<p className="text-lg text-slate-600 max-w-2xl mx-auto">
Meet the expert contributors who share their knowledge and insights on HygineShelf
</p>
</motion.div>

<motion.div
variants={stagger}
initial="hidden"
whileInView="visible"
viewport={{ once: true, amount: 0.2 }}
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
>
{loading ? (
// Skeleton loading
Array.from({ length: 3 }).map((_, index) => (
<Card key={index} className="overflow-hidden">
<CardContent className="p-6">
<div className="flex flex-col items-center space-y-4">
<Skeleton className="w-24 h-24 rounded-full" />
<Skeleton className="h-6 w-32" />
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<div className="flex gap-3">
<Skeleton className="w-8 h-8 rounded-full" />
<Skeleton className="w-8 h-8 rounded-full" />
</div>
</div>
</CardContent>
</Card>
))
) : (
authors.map((author, index) => (
<motion.div
key={author.id}
variants={fadeInUp}
whileHover={{ y: -6 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
<Card className="overflow-hidden shadow-lg border border-gray-100 group">
<CardContent className="p-0 relative">
{/* IMAGE */}
<div className="w-full h-[400px] overflow-hidden relative">
{author.authers_image ? (
<img
src={author.authers_image}
alt={author.username}
className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
/>
) : (
<div className="w-full h-full bg-gradient-to-br from-[#06b6d4] to-[#0f766e] flex items-center justify-center text-white text-4xl font-bold">
{author.username.charAt(0).toUpperCase()}
</div>
)}

{/* OVERLAY */}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
</div>

{/* DETAILS - Positioned at bottom of image */}
<div className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
<div className="flex justify-between items-start">
{/* Left side - Name, Title, Description */}
<div className="flex-1">
{/* NAME */}
<h3 className="text-xl font-bold mb-2 drop-shadow-lg">
{author.username}
</h3>

{/* TITLE */}
{author.title && (
<p className="text-sm font-semibold tracking-wide mb-3 opacity-90">
{author.title}
</p>
)}

{/* DESCRIPTION */}
{author.description && (
<p className="text-sm leading-relaxed opacity-90 line-clamp-3">
{author.description}
</p>
)}
</div>

{/* Right side - Social Icons */}
{author.socialmedia && author.socialmedia.length > 0 && (
<div className="flex flex-col gap-2 ml-4">
{author.socialmedia.map((social, idx) => (
<a
key={idx}
href={social.url}
target="_blank"
rel="noopener noreferrer"
className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white hover:text-[#0f766e] hover:scale-110"
>
{social.platform === "Instagram" && <Instagram size={16} />}
{social.platform === "Linkedin" && <Linkedin size={16} />}
{social.platform === "Twitter" && <Twitter size={16} />}
{social.platform === "Facebook" && <Facebook size={16} />}
{social.platform === "Youtube" && <Youtube size={16} />}
{social.platform === "Website" && <Globe size={16} />}
{!["Instagram","Linkedin","Twitter","Facebook","Youtube","Website"].includes(social.platform) && <Globe size={16} />}
</a>
))}
</div>
)}
</div>
</div>
</CardContent>
</Card>
</motion.div>
))
)}
</motion.div>
</div>
</section>
)}

{/* ---------- Teams Section ---------- */}
{teams.length > 0 && (
<section className="py-20 bg-gradient-to-b from-[#f7fffd] to-white">
<div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
<motion.div
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
className="text-center mb-12"
>
<h3 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
Our Team
</h3>
<p className="text-lg text-slate-600 max-w-2xl mx-auto">
The dedicated professionals working behind the scenes to bring you quality health content
</p>
</motion.div>

<motion.div
variants={stagger}
initial="hidden"
whileInView="visible"
viewport={{ once: true, amount: 0.2 }}
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
>
{loading ? (
// Skeleton loading
Array.from({ length: 3 }).map((_, index) => (
<Card key={index} className="overflow-hidden">
<CardContent className="p-6">
<div className="flex flex-col items-center space-y-4">
<Skeleton className="w-24 h-24 rounded-full" />
<Skeleton className="h-6 w-32" />
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<div className="flex gap-3">
<Skeleton className="w-8 h-8 rounded-full" />
<Skeleton className="w-8 h-8 rounded-full" />
</div>
</div>
</CardContent>
</Card>
))
) : (
teams.map((team, index) => (
<motion.div
key={team.id}
variants={fadeInUp}
whileHover={{ y: -6 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
<Card className="overflow-hidden shadow-lg border border-gray-100 group">
<CardContent className="p-0 relative">
{/* IMAGE */}
<div className="w-full h-[400px] overflow-hidden relative">
{team.image ? (
<img
src={team.image}
alt={team.name}
className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
/>
) : (
<div className="w-full h-full bg-gradient-to-br from-[#06b6d4] to-[#0f766e] flex items-center justify-center text-white text-4xl font-bold">
{team.name.charAt(0).toUpperCase()}
</div>
)}

{/* OVERLAY */}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
</div>

{/* DETAILS - Positioned at bottom of image */}
<div className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
<div className="flex justify-between items-start">
{/* Left side - Name, Title, Description */}
<div className="flex-1">
{/* NAME */}
<h3 className="text-xl font-bold mb-2 drop-shadow-lg">
{team.name}
</h3>

{/* TITLE */}
{team.title && (
<p className="text-sm font-semibold tracking-wide mb-3 opacity-90">
{team.title}
</p>
)}

{/* DESCRIPTION */}
{team.description && (
<p className="text-sm leading-relaxed opacity-90 line-clamp-3">
{team.description}
</p>
)}
</div>

{/* Right side - Social Icons */}
{team.socialmedia && team.socialmedia.length > 0 && (
<div className="flex flex-col gap-2 ml-4">
{team.socialmedia.map((social, idx) => (
<a
key={idx}
href={social.url}
target="_blank"
rel="noopener noreferrer"
className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white hover:text-[#0f766e] hover:scale-110"
>
{social.platform === "Instagram" && <Instagram size={16} />}
{social.platform === "Linkedin" && <Linkedin size={16} />}
{social.platform === "Twitter" && <Twitter size={16} />}
{social.platform === "Facebook" && <Facebook size={16} />}
{social.platform === "Youtube" && <Youtube size={16} />}
{social.platform === "Website" && <Globe size={16} />}
{!["Instagram","Linkedin","Twitter","Facebook","Youtube","Website"].includes(social.platform) && <Globe size={16} />}
</a>
))}
</div>
)}
</div>
</div>
</CardContent>
</Card>
</motion.div>
))
)}
</motion.div>
</div>
</section>
)}


{/* ---------- Our Projects Section ---------- */}
<section className="py-20 bg-white">
<div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
<motion.div
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
className="text-center mb-12"
>
<h3 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
Our Projects
</h3>
<p className="text-lg text-slate-600 max-w-2xl mx-auto">
Discover the initiatives and platforms that bring Dr. Bushra's vision to life
</p>
</motion.div>

<motion.div
variants={stagger}
initial="hidden"
whileInView="visible"
viewport={{ once: true, amount: 0.2 }}
className="grid grid-cols-1 md:grid-cols-3 gap-8"
>
<motion.div
variants={fadeInUp}
className="bg-gradient-to-br from-[#f0fdfa] to-[#e6fffa] p-8 rounded-2xl shadow-lg border border-slate-100 text-center group hover:shadow-xl transition-all duration-300"
>
<div className="w-16 h-16 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
<Globe className="w-8 h-8 text-white" />
</div>
<h4 className="text-xl font-semibold text-[#0f766e] mb-4">Guru Akanksha</h4>
<p className="text-slate-600 mb-6">
A dedicated NGO focused on education, healthcare and empowerment initiatives,
working to create positive change in communities.
</p>
<a
href="https://guruakanksha.org/"
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 bg-[#0f766e] text-white px-6 py-2 rounded-full hover:bg-[#0d5e59] transition-colors"
>
<ExternalLink size={16} />
Visit Website
</a>
</motion.div>

<motion.div
variants={fadeInUp}
className="bg-gradient-to-br from-[#eff6ff] to-[#e6f2ff] p-8 rounded-2xl shadow-lg border border-slate-100 text-center group hover:shadow-xl transition-all duration-300"
>
<div className="w-16 h-16 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
<Users className="w-8 h-8 text-white" />
</div>
<h4 className="text-xl font-semibold text-[#0f766e] mb-4">Dr. Bushra</h4>
<p className="text-slate-600 mb-6">
Manages author activities, NGO operations, and various initiatives
focused on healthcare, education, and community development.
</p>
<a
href="https://drbushra.in/"
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 bg-[#0f766e] text-white px-6 py-2 rounded-full hover:bg-[#0d5e59] transition-colors"
>
<ExternalLink size={16} />
Visit Website
</a>
</motion.div>

<motion.div
variants={fadeInUp}
className="bg-gradient-to-br from-[#fef7ff] to-[#fdf4ff] p-8 rounded-2xl shadow-lg border border-slate-100 text-center group hover:shadow-xl transition-all duration-300"
>
<div className="w-16 h-16 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
<Heart className="w-8 h-8 text-white" />
</div>
<h4 className="text-xl font-semibold text-[#0f766e] mb-4">Hygiene Shelf</h4>
<p className="text-slate-600 mb-6">
Your trusted source for health and hygiene information,
practical wellness tips, and expert guidance from Dr. Bushra.
</p>
<a
href="https://hygieneshelf.in/"
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 bg-[#0f766e] text-white px-6 py-2 rounded-full hover:bg-[#0d5e59] transition-colors"
>
<ExternalLink size={16} />
Visit Website
</a>
</motion.div>
</motion.div>
</div>
</section>

    {/* ---------- Contact Section ---------- */}
      <section id="contact" className="py-20 bg-gradient-to-b from-[#f0fdfa] to-[#f8fcff] ">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                Connect with Dr. Bushra
              </h3>
              <p className="text-slate-700">
                Have questions about health topics, want to collaborate, or need personalized guidance?
                Dr. Bushra would love to hear from you.
              </p>

              <div className="space-y-4 text-slate-700">
                <div className="flex items-center gap-3">
                  <Mail className="text-[#0f766e]" />
                  <a href="mailto:drbushra@hygieneshelf.in" className="text-slate-700 hover:text-[#0f766e] transition">
                    drbushra@hygieneshelf.in
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-[#0f766e]" />
                  <span>+91 952 904 5550</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white px-6 py-8 rounded-2xl shadow-lg"
            >
              <h4 className="text-xl font-semibold text-[#0f766e] mb-6">Send a Message</h4>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent"
                  />
                </div>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <Button className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2">
                    Send Message
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
{/* ---------- Extra Styles ---------- */}
<style jsx global>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@400;600;700;900&display=swap');

body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

img { image-rendering: auto; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

a, button { -webkit-tap-highlight-color: rgba(0,0,0,0); }

textarea { font-family: inherit; }

html { scroll-behavior: smooth; }
`}</style>
</div>
);
}
