import React, { useState } from 'react';
import { Send, Mail, MapPin, CheckCircle, AlertCircle, Loader2, Sparkles, Github, Linkedin, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitContactForm } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error on user edit
    if (status.type === 'error') {
      setStatus({ type: null, message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    // Client-side quick validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setLoading(false);
      setStatus({ type: 'error', message: 'Please enter a valid name (at least 2 characters).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setLoading(false);
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setLoading(false);
      setStatus({ type: 'error', message: 'Please write a message of at least 10 characters.' });
      return;
    }

    try {
      const response = await submitContactForm(formData);
      setLoading(false);
      setStatus({
        type: 'success',
        message: response.message || 'Thank you! Your message has been sent directly to Ayush.',
      });

      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Trigger celebratory confetti animation!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#06b6d4', '#8b5cf6', '#ffffff'],
      });
    } catch (err) {
      setLoading(false);
      let errMsg = 'Failed to send message. Please try again or reach out directly via email.';
      if (err.errors) {
        const firstKey = Object.keys(err.errors)[0];
        errMsg = `${firstKey}: ${err.errors[firstKey][0]}`;
      } else if (err.message) {
        errMsg = err.message;
      }
      setStatus({ type: 'error', message: errMsg });
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-3 text-xs font-mono text-accent-cyan uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Initiate Collaboration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            LET&apos;S BUILD <span className="text-gradient-cyan">SOMETHING AMAZING.</span>
          </h2>
          <p className="max-w-xl text-slate-400 text-sm mt-3 font-light">
            Whether you have an ambitious cloud engineering project, a creative 3D web experience, or an engineering role, I&apos;d love to connect.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full mt-4" />
        </div>

        {/* Contact Grid: Details on Left, Interactive Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Left Column: Direct Contact Cards */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-lg font-display font-bold text-white">Direct Channels</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Feel free to email me directly or explore my open-source code and professional profile.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href="mailto:ayushgora@example.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-slate-200 transition-colors"
                  data-swarm="gather"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-cyan shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Email</span>
                    <span className="text-xs font-mono text-white truncate block">ayushgora@example.com</span>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-slate-200">
                  <div className="w-9 h-9 rounded-lg bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Location</span>
                    <span className="text-xs text-white">Phagwara, Punjab, India (GNA University)</span>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-4 border-t border-white/10">
                <span className="block text-[11px] font-mono text-slate-400 mb-3 uppercase tracking-wider">Social Presence</span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass-card text-slate-300 hover:text-white hover:border-accent-blue transition-all"
                    aria-label="GitHub Profile"
                    data-swarm="gather"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass-card text-slate-300 hover:text-white hover:border-accent-cyan transition-all"
                    aria-label="LinkedIn Profile"
                    data-swarm="gather"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Response Notice */}
            <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/20 text-xs font-mono text-slate-300 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Standard response window: within 24 hours.</span>
            </div>
          </div>

          {/* Right Column: DRF Connected Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 text-left">
              <h3 className="text-xl font-display font-bold text-white mb-6">Send a Message</h3>

              {/* Status Banner */}
              {status.type === 'success' && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              {status.type === 'error' && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-cyan transition-colors font-sans"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. sarah@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-cyan transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. DevOps Role / Project Collaboration"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-cyan transition-colors font-sans"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project, team, or opportunity..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent-cyan transition-colors font-sans resize-none"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-accent-blue via-accent-indigo to-accent-cyan text-white text-xs font-mono uppercase tracking-widest font-semibold hover:shadow-glow hover:opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-swarm="gather"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-accent-cyan" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-accent-cyan" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

