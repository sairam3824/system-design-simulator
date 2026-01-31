"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Globe, Linkedin, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* View Only Banner */}
      {showBanner && (
        <div className="fixed top-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[800px] z-50 animate-in slide-in-from-top-20 fade-in duration-700">
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-xl p-6 shadow-2xl border border-white/10 relative text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-yellow-400/50">
              VIEW ONLY
            </div>

            <p className="text-white text-lg md:text-xl font-medium leading-relaxed pt-2">
              This is a view-only demo of the System Design Simulator.
              Interactive features are currently disabled.
            </p>
            <p className="text-white/90 mt-2">
              For full access or inquiries, please contact at
            </p>
            <a
              href="mailto:sairam.maruri@gmail.com"
              className="inline-block mt-2 text-white font-bold text-lg hover:underline decoration-white/50 underline-offset-4"
            >
              sairam.maruri@gmail.com
            </a>
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-background to-blue-900/10 pointer-events-none" />

      {/* Header */}
      <header className="relative container mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          System Design Simulator
        </h1>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left Column: Project Built By Card */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
            <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-lg bg-black/40 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Project Built By</h3>
                  <p className="text-muted-foreground">Developed by Sairam Maruri. Let&apos;s connect!</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-300">
                  <User className="w-5 h-5 text-cyan-500 shrink-0" />
                  <span>MARURI SAI RAMA LINGA REDDY</span>
                </div>

                <a href="mailto:sairam.maruri@gmail.com" className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors group">
                  <Mail className="w-5 h-5 text-cyan-500 shrink-0 group-hover:text-cyan-400" />
                  <span>sairam.maruri@gmail.com</span>
                </a>

                <div className="flex items-center gap-4 text-gray-300">
                  <Phone className="w-5 h-5 text-cyan-500 shrink-0" />
                  <span>+91 78938 65644</span>
                </div>

                <a href="https://saiii.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors group">
                  <Globe className="w-5 h-5 text-cyan-500 shrink-0 group-hover:text-cyan-400" />
                  <span>Portfolio - saiii.in</span>
                </a>

                <a href="https://linkedin.com/in/sairam-maruri/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors group">
                  <Linkedin className="w-5 h-5 text-cyan-500 shrink-0 group-hover:text-cyan-400" />
                  <span>linkedin.com/in/sairam-maruri/</span>
                </a>

                <a href="https://github.com/sairam3824" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors group">
                  <Github className="w-5 h-5 text-cyan-500 shrink-0 group-hover:text-cyan-400" />
                  <span>github.com/sairam3824</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Text */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Interview Practice
            </div>

            <h2 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Ace Your <span className="text-primary">FAANG</span> System Design Interview
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Practice with an AI-powered interviewer that evaluates your tradeoffs,
              not just your answers. Get real-time feedback on scalability,
              architecture decisions, and communication.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                <Link href="/register">Start Practicing Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary/30 hover:bg-primary/10">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Questioning</h3>
            <p className="text-muted-foreground">
              AI interviewer asks probing questions about scale, availability, and consistency - just like a real FAANG interview.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">FAANG-Style Scoring</h3>
            <p className="text-muted-foreground">
              Get scored on 6 industry-standard dimensions: Requirements, Design, Scalability, Tradeoffs, Detail, and Communication.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Resume Analysis</h3>
            <p className="text-muted-foreground">
              Upload your resume and get AI-powered analysis of your skills and personalized interview topic recommendations.
            </p>
          </div>
        </div>

        {/* Topics Section */}
        <div className="mt-32 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Classic FAANG Problems</h3>
          <p className="text-muted-foreground mb-8">Practice the most common system design interview questions</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Design Twitter", "Design Uber", "Design Netflix", "Design WhatsApp", "Design Instagram", "Design YouTube"].map((topic) => (
              <span key={topic} className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary hover:bg-primary/20 transition-colors cursor-default">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Simple Pricing</h3>
            <p className="text-muted-foreground">Choose the plan that fits your preparation needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card rounded-xl p-8 border border-border hover:border-primary/50 transition-colors flex flex-col relative">
              <h4 className="text-xl font-semibold text-foreground mb-2">Free</h4>
              <div className="text-4xl font-bold text-foreground mb-6">$0<span className="text-base font-normal text-muted-foreground">/mo</span></div>

              <ul className="space-y-4 mb-8 flex-1 text-left">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  1 Interview free / month
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic Feedback
                </li>
              </ul>

              <Button variant="outline" className="w-full pointer-events-none opacity-50">
                Current Plan
              </Button>
            </div>

            {/* Plus Tier */}
            <div className="bg-card rounded-xl p-8 border-2 border-primary/20 hover:border-primary transition-colors flex flex-col relative transform scale-110 shadow-2xl z-10">
              <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Plus</h4>
              <div className="text-4xl font-bold text-primary mb-6">$19<span className="text-base font-normal text-muted-foreground">/mo</span></div>

              <ul className="space-y-4 mb-8 flex-1 text-left">
                <li className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  15 Interviews / month
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Detailed Feedback
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority Support
                </li>
              </ul>

              <Button className="w-full cursor-not-allowed opacity-90">
                Choose Plus
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="bg-card rounded-xl p-8 border border-border hover:border-primary/50 transition-colors flex flex-col relative">
              <h4 className="text-xl font-semibold text-foreground mb-2">Pro</h4>
              <div className="text-4xl font-bold text-foreground mb-6">$39<span className="text-base font-normal text-muted-foreground">/mo</span></div>

              <ul className="space-y-4 mb-8 flex-1 text-left">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  20 Interviews / month
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Resume Analysis
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mock Interview Recordings
                </li>
              </ul>

              <Button variant="outline" className="w-full cursor-not-allowed opacity-80">
                Choose Pro
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {/* Stats Section */}
        <div className="mt-32 grid md:grid-cols-4 gap-8">
          {[
            { value: "500+", label: "Practice Sessions" },
            { value: "95%", label: "Pass Rate Improvement" },
            { value: "6", label: "Scoring Dimensions" },
            { value: "24/7", label: "AI Availability" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="relative container mx-auto px-6 py-12 border-t border-border mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground">
            Built for engineers who want to master system design interviews.
          </p>
          <div className="flex items-center gap-2 text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm">Powered by AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
