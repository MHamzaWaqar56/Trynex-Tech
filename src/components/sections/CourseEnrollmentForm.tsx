'use client';

import { useState } from 'react';
import { Send, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface Props {
  courseId: string;
  courseTitle: string;
}

export default function CourseEnrollmentForm({ courseId, courseTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '',
    education: '', experience: '', message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...form }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success('Enrollment request sent! We\'ll contact you shortly.');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card p-8 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Request Received!</h3>
          <p className="text-sm text-gray-900 leading-relaxed">
            Thank you for your interest in <span className="font-semibold text-primary">{courseTitle}</span>.
            Our team will contact you within 24 hours to discuss next steps.
          </p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', city: '', education: '', experience: '', message: '' }); }}
          className="text-sm text-primary font-semibold hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 min-[320px]:max-[500px]:p-6" id="enroll-form">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-gray-900">Enroll in This Course</h2>
        <p className="text-sm text-gray-900 mt-2">
          Fill out the form below and our team will get back to you within 24 hours.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-900 mb-2">Full Name *</label>
            <input
              type="text" name="name" required
              value={form.name} onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-900 mb-2">Email Address *</label>
            <input
              type="email" name="email" required
              value={form.email} onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-900 mb-2">Phone Number</label>
            <input
              type="tel" name="phone"
              value={form.phone} onChange={handleChange}
              placeholder="+92 300 1234567"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-900 mb-2">City</label>
            <input
              type="text" name="city"
              value={form.city} onChange={handleChange}
              placeholder="e.g. Lahore, Karachi"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-900 mb-2">Education Level <span className="text-gray-900/70">(optional)</span></label>
            <select
              name="education"
              value={form.education} onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">Select education</option>
              <option value="Matric">Matric</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Bachelor's">Bachelor&apos;s</option>
              <option value="Master's">Master&apos;s</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-900 mb-2">Experience Level <span className="text-gray-900/70">(optional)</span></label>
            <select
              name="experience"
              value={form.experience} onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">Select experience</option>
              <option value="No experience">No experience</option>
              <option value="0–1 years">0–1 years</option>
              <option value="1–3 years">1–3 years</option>
              <option value="3+ years">3+ years</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-900 mb-2">Why do you want to join? <span className="text-gray-900/70">(optional)</span></label>
          <textarea
            name="message" rows={5}
            value={form.message} onChange={handleChange}
            placeholder="Tell us about your goals and what you hope to learn..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Spinner size="sm" variant="dark" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Enrollment Request</>
          )}
        </button>
      </form>

    </div>
  );
}
