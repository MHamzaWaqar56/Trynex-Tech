
'use client';

import { useState } from 'react';
import { Send, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePublicServices } from '@/components/shared/usePublicServices';
import { Spinner } from '@/components/ui/spinner';

const initialForm = {
  name: '',
  email: '',
  company: '',
  service: '',
  budget: '',
  deadline: '',
  message: '',
};

// Matches contact page input style exactly
const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors';

export default function CustomPricingForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { services, loading: servicesLoading, error: servicesError } = usePublicServices();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.message.trim().length < 10) {
      toast.error('Project description must be at least 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pricing/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Custom pricing request sent. We\'ll respond within 24 hours.');
        setForm(initialForm);
      } else {
        toast.error('Could not submit request. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Custom Pricing Request</h2>
        </div>
        <p className="text-sm text-gray-900">
          Add your budget and deadline if you want this treated as a quote request. We&apos;ll get back to you within 24 hours.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Row 1 — Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-900 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-900 mb-2">Email Address *</label>
            <input
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

        {/* Row 2 — Company + Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-900 mb-2">
              Company / Brand <span className="text-gray-900/60">(optional)</span>
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Your company name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-900 mb-2">Service Required *</label>
            <Select
              value={form.service}
              onValueChange={(value) => setForm({ ...form, service: value })}
              disabled={servicesLoading}
            >
              <SelectTrigger className="w-full !h-[50px] px-4 py-3 bg-white border border-[#00d4ff] rounded-lg text-gray-900 focus:outline-none focus:border-primary/50 transition-colors">
                <SelectValue placeholder={servicesLoading ? 'Loading services...' : 'Select a service'} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.slug} value={service.title}>{service.title}</SelectItem>
                ))}
                <SelectItem value="Other">Other / Not Sure</SelectItem>
              </SelectContent>
            </Select>
            {servicesError && <p className="mt-1.5 text-xs text-red-400">{servicesError}</p>}
          </div>
        </div>

        {/* Row 3 — Budget + Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-900 mb-2">
              Budget / Price Range <span className="text-gray-900/60">(optional)</span>
            </label>
            <input
              type="text"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. PKR 150k – 250k"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-900 mb-2">
              Deadline <span className="text-gray-900/60">(optional)</span>
            </label>
            <input
              type="text"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              placeholder="e.g. 3 weeks, end of May"
              className={inputClass}
            />
          </div>
        </div>

        {/* Project description */}
        <div>
          <label className="block text-sm text-gray-900 mb-2">Project Description *</label>
          <textarea
            name="message"
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your project — what you're building, key features needed, and any technical requirements..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner size="sm" variant="dark" />
              Sending Request...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Pricing Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}