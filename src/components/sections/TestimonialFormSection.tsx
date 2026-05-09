


'use client';

import { useState } from 'react';
import { Mail, Send, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import PageHero from '@/components/sections/PageHero';
import { usePublicServices } from '@/components/shared/usePublicServices';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

export default function TestimonialFormSection() {
  const { services, loading: servicesLoading, error: servicesError } = usePublicServices();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', service: '', budget: '', deadline: '', message: '',
  });
  const [testimonialLoading, setTestimonialLoading] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    company: '',
    role: '',
    rating: '5',
    review: '',
    service: ''
  });


  const handleTestimonialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTestimonialForm({ ...testimonialForm, [e.target.name]: e.target.value });
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testimonialForm.review.trim().length < 10) {
  toast.error('Review must contain at least 10 characters.');
  return;
}

    setTestimonialLoading(true);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testimonialForm,
          rating: Number(testimonialForm.rating),
          service: testimonialForm.service || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Thanks! Your testimonial was submitted.');
        setTestimonialForm({ name: '', company: '', role: '', rating: '5', review: '', service: '' });
      } else {
        toast.error('Could not submit testimonial. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setTestimonialLoading(false);
    }
  };

  return (
    <>
    
{/* Testimonial Section */}
  <section className="py-12 bg-white">
        <div className="container-custom">
            <div className="mb-4">
              <span className="section-badge">
                <Star className="h-3.5 w-3.5 inline mr-1" /> Testimonials
              </span>
            </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <h2 className="section-title">
              Share Your <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
                We&apos;d love your feedback on working with us—it helps us improve and show our value to others.
            </p>
        </div>

              

              <div className="glass-card p-8 lg:p-10 min-[320px]:max-[500px]:p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Leave a Testimonial</h2>
                    <p className="text-sm text-gray-900">Share your experience with us—your testimonial helps highlight the value and impact we deliver.</p>
                  </div>
                  <Star className="w-5 h-5 text-primary mt-1" />
                </div>

                <form className="space-y-5" onSubmit={handleTestimonialSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={testimonialForm.name}
                        onChange={handleTestimonialChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Company *</label>
                      <input
                        type="text"
                        name="company"
                        required
                        value={testimonialForm.company}
                        onChange={handleTestimonialChange}
                        placeholder="Company name"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Role / Title</label>
                      <input
                        type="text"
                        name="role"
                        value={testimonialForm.role}
                        onChange={handleTestimonialChange}
                        placeholder="CEO, Manager, Founder..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Service Used</label>
                      <Select 
                        value={testimonialForm.service}
                        onValueChange={(value) => setTestimonialForm({ ...testimonialForm, service: value })}
                      >
                        <SelectTrigger className="w-full !h-[50px] px-4 py-3 bg-white border border-[#00d4ff] rounded-lg text-gray-900 focus:outline-none focus:border-primary/50 transition-colors">
                          <SelectValue placeholder={servicesLoading ? 'Loading...' : 'Select service'} />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.slug} value={service.title}>{service.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Rating *</label>
                      <Select
                        value={testimonialForm.rating}
                        onValueChange={(value) => setTestimonialForm({ ...testimonialForm, rating: value })}
                      >
                        <SelectTrigger className="w-full !h-[50px] px-4 py-3 bg-white border border-[#00d4ff] rounded-lg text-gray-900 focus:outline-none focus:border-primary/50 transition-colors">
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="3">3 - Average</SelectItem>
                          <SelectItem value="2">2 - Fair</SelectItem>
                          <SelectItem value="1">1 - Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-900 mb-2">Your Review *</label>
                    <textarea
                      name="review"
                      required
                      rows={5}
                      value={testimonialForm.review}
                      onChange={handleTestimonialChange}
                      placeholder="Tell us how we helped your business..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={testimonialLoading}
                    className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {testimonialLoading ? (
                      <>
                        <Spinner size="sm" variant="dark" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Testimonial
                      </>
                    )}
                  </button>
                </form>
              </div>
            
        </div>
      </section>



    </>
  );
}