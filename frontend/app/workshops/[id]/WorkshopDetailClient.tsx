"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, MessageCircle, Star, User, ArrowLeft } from "lucide-react";
import WorkshopRegistrationModal from "../../components/WorkshopRegistrationModal";

type Workshop = {
  id: number;
  title: string;
  expert_name: string;
  date: string;
  is_open: boolean;
};

export default function WorkshopDetailClient({
  workshop,
  location,
  imageSrc,
  overview,
}: {
  workshop: Workshop;
  location: string;
  imageSrc: string;
  overview: string;
}) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-10">
        
        {/* 1. TOP NAVIGATION */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* 2. PREMIUM HEADER (Title, Expert, Date, Location) */}
        <header className="mt-8 mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-slate-950 leading-tight">
            {workshop.title}
          </h1>
          
          <div className="mt-6 flex flex-wrap items-center gap-6 text-slate-600 font-bold">
            <span className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700">
              <User className="h-4 w-4" /> {workshop.expert_name}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" /> {workshop.date}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" /> {location}
            </span>
          </div>
        </header>

        {/* 3. MAIN HERO SECTION (Badi Image & Overview Side-by-Side) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Large Image with Landing Page Hover Effect */}
          <div className="lg:col-span-7 group overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-2xl">
            <img
              src={imageSrc}
              alt={workshop.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 aspect-video"
            />
          </div>

          {/* Quick Overview Card */}
          <div className="lg:col-span-5 flex flex-col justify-center bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100">
            <p className="text-[10px] font-black tracking-widest uppercase text-blue-600 mb-2">Workshop Overview</p>
            <h2 className="text-3xl font-black text-slate-900 mb-6">Introduction</h2>
            <p className="text-lg leading-relaxed text-slate-700 font-medium">
              {workshop.title} workshop aims to provide expert guidance and support to the community.
            </p>
          </div>
        </section>

        {/* 4. DETAILED CONTENT & SIDEBAR */}
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <h3 className="text-3xl font-black text-slate-900 mb-8">Detailed Description</h3>
            <div className="text-slate-700 text-lg leading-loose whitespace-pre-wrap font-medium prose prose-blue max-w-none">
              {overview}
            </div>

            {/* FEEDBACK & DISCUSSION */}
            <div className="mt-20 space-y-12">
               <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900">Feedback & Rating</h3>
                  <p className="mt-2 text-slate-600 font-semibold">Register for this opportunity to give your feedback and review.</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex text-slate-200">
                       {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 fill-current" />)}
                    </div>
                    <span className="text-slate-400 font-bold ml-2">No reviews yet</span>
                  </div>
               </div>
               
               <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black text-slate-900">Discussions</h3>
                    <MessageCircle className="text-slate-400" />
                  </div>
                  <p className="text-slate-800 font-bold">No post yet! Start a new discussion.</p>
                  <p className="text-slate-500 font-medium mt-1">Please login to start a comment.</p>
               </div>
            </div>
          </div>

          {/* STICKY SIDEBAR (Highlights & Register) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-10 bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200">
              <h3 className="text-2xl font-black mb-6">Key Highlights</h3>
              <ul className="space-y-4 font-bold">
                {["Expert Access", "Health Kit Distribution", "Community Networking", "Nutritional Guidance"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="h-2 w-2 bg-white rounded-full" /> {item}
                  </li>
                ))}
              </ul>
              
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                disabled={!workshop.is_open}
                className={`mt-10 w-full py-5 rounded-2xl text-lg font-black transition-all ${
                  workshop.is_open 
                  ? "bg-white text-blue-700 hover:scale-105" 
                  : "bg-blue-800 text-blue-400 cursor-not-allowed"
                }`}
              >
                {workshop.is_open ? "Register Now" : "Registration Closed"}
              </button>
            </div>
          </aside>
        </section>

        {/* REGISTRATION MODAL */}
        <WorkshopRegistrationModal
          open={isRegisterOpen}
          workshop={workshop}
          onClose={() => setIsRegisterOpen(false)}
        />
      </div>
      <div className="h-20" />
    </main>
  );
}