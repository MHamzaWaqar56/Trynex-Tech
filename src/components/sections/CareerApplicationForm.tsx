
'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Send, Linkedin, Globe, Clock3, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  vacancySlug: string;
  vacancyTitle: string;
  disabled?: boolean;
  closedMessage?: string;
};

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  linkedin: '',
  portfolioUrl: '',
  yearsOfExperience: '',
  coverLetter: '',
};

// Shared input class — matches contact page style
const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export default function CareerApplicationForm({
  vacancySlug,
  vacancyTitle,
  disabled = false,
  closedMessage,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.coverLetter.trim().length < 10) {
      toast.error('Cover letter must be at least 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('fullName', form.fullName);
      payload.append('email', form.email);
      payload.append('phone', form.phone);
      payload.append('linkedin', form.linkedin);
      payload.append('portfolioUrl', form.portfolioUrl);
      payload.append('yearsOfExperience', form.yearsOfExperience);
      payload.append('coverLetter', form.coverLetter);
      if (cvFile) payload.append('cv', cvFile);

      const res = await fetch(`/api/careers/${vacancySlug}/apply`, {
        method: 'POST',
        body: payload,
      });

      if (res.ok) {
        toast.success('Application submitted! We\'ll be in touch within 3–5 business days.');
        setForm(initialForm);
        setCvFile(null);
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Closed banner */}
      {closedMessage && (
        <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {closedMessage}
        </div>
      )}

      {/* Row 1 — Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-gray-900 mb-2">Full Name *</label>
          <input
            disabled={disabled}
            type="text"
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-900 mb-2">Email Address *</label>
          <input
            disabled={disabled}
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 2 — Phone + Experience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-gray-900 mb-2">Phone Number</label>
          <input
            disabled={disabled}
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-900 mb-2">
            <span className="flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5 text-primary" />
              Years of Experience
            </span>
          </label>
          <input
            disabled={disabled}
            type="text"
            name="yearsOfExperience"
            value={form.yearsOfExperience}
            onChange={handleChange}
            placeholder="e.g. 2 years"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 3 — LinkedIn + Portfolio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-gray-900 mb-2">
            <span className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-primary" />
              LinkedIn Profile <span className="text-gray-900/60">(optional)</span>
            </span>
          </label>
          <input
            disabled={disabled}
            type="url"
            name="linkedin"
            value={form.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourname"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-900 mb-2">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              Portfolio / Website <span className="text-gray-900/60">(optional)</span>
            </span>
          </label>
          <input
            disabled={disabled}
            type="url"
            name="portfolioUrl"
            value={form.portfolioUrl}
            onChange={handleChange}
            placeholder="https://yourportfolio.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* Cover Letter */}
      <div>
        <label className="block text-sm text-gray-900 mb-2">
          Why are you a fit for {vacancyTitle}? *
        </label>
        <textarea
          disabled={disabled}
          name="coverLetter"
          required
          rows={6}
          value={form.coverLetter}
          onChange={handleChange}
          placeholder="Tell us about your experience, why you're excited about this role, and what you'd bring to the team..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* CV Upload */}
      <div>
        <label className="block text-sm text-gray-900 mb-2">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            Upload CV / Resume *
          </span>
        </label>
        <div className="relative w-full">
          <input
            disabled={disabled}
            type="file"
            accept=".pdf,.doc,.docx"
            required
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-900
              file:mr-4 file:rounded-lg file:border-0
              file:bg-primary file:px-4 file:py-2
              file:text-white file:font-semibold file:text-sm
              file:cursor-pointer
              cursor-pointer
              disabled:cursor-not-allowed disabled:opacity-60"
          />
          {cvFile && (
            <p className="mt-2 text-xs text-primary font-mono">
              ✓ {cvFile.name}
            </p>
          )}
        </div>
        <p className="mt-1.5 text-xs text-gray-900/60">Accepted formats: PDF, DOC, DOCX</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || disabled}
        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {disabled ? (
          'Applications Closed'
        ) : loading ? (
          <>
            <Spinner size="sm" variant="dark" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Application
          </>
        )}
      </button>
    </form>
  );
}