
'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { WHATSAPP_NUMBER } from '@/lib/data';
import { usePublicServices } from '@/components/shared/usePublicServices';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';




const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@trynex.com', href: 'mailto:hello@trynex.com' },
  { icon: Phone, label: 'WhatsApp', value: WHATSAPP_NUMBER, href: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}` },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Chichawatni, Punjab, Pakistan',
    href: 'https://www.google.com/maps?q=Chichawatni%2C%20Punjab%2C%20Pakistan&output=embed',
  },
  { icon: Clock, label: 'Working Hours', value: 'Mon–Fri, 9am–6pm PKT', href: '#' },
];

export default function ContactFormSection() {
  const { services, loading: servicesLoading, error: servicesError } = usePublicServices();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', service: '', budget: '', deadline: '', message: '',
  });
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.message.trim().length < 10) {
  toast.error('Message must contain at least 10 characters.');
  return;
}
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Message sent! We\'ll respond within 24 hours.');
        setForm({ name: '', email: '', phone: '', company: '', service: '', budget: '', deadline: '', message: '' });
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>

      <section className="py-12 bg-white">
        <div className="container-custom">
            <div className="mb-4">
              <span className="section-badge">
                <Mail className="h-3.5 w-3.5" />
                Contact Center
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
             <h2 className="section-title">
              Start a <span className="gradient-text">Conversation</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Tell us what you are building, need help with, or problem you are solving—we&apos;ll route it.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-10">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="glass-card-hover group flex items-start gap-4 p-5"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-900 font-mono mb-0.5">{label}</div>
                      <div className="text-sm text-gray-900 font-medium leading-snug break-words">{value}</div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="glass-card overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4">
                  <div>
                    <div className="text-xs text-gray-900 font-mono mb-1">Office Map</div>
                    <h3 className="text-lg font-display font-bold text-gray-900 min-[320px]:max-[500px]:text-[16px]">Chichawatni, Pakistan</h3>
                  </div>
                  <a
                    href="https://www.google.com/maps?q=Chichawatni%2C%20Punjab%2C%20Pakistan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Open Maps
                  </a>
                </div>
                <div className="h-64 border-t border-slate-100 bg-white">
                  <iframe
                    title="Trynex Tech location map"
                    src="https://www.google.com/maps?q=Chichawatni%2C%20Punjab%2C%20Pakistan&output=embed"
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                 
                  <div>
                    <h3 className="text-lg font-display font-bold text-gray-900 mb-2">What happens next?</h3>
                    <ul className="space-y-3 text-sm text-gray-900">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        We review your request within business hours.
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        You get a reply within 24 hours.
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        If relevant, we turn it into a quote or discovery call.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-8 min-[320px]:max-[500px]:p-6">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-gray-900">Send Us a Message</h2>
                  <p className="text-sm text-gray-900 mt-2">
                    Add budget or deadline if you want this inquiry treated as a quote request.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
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
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
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
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
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
                      {servicesError && <p className="mt-2 text-xs text-red-500">{servicesError}</p>}
                      {!servicesLoading && services.length === 0 && !servicesError && (
                        <p className="mt-2 text-xs text-gray-900">No services are available right now.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Company / Brand Name <span className="text-gray-900/70">(optional)</span></label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">Budget / Price Range <span className="text-gray-900/70">(optional)</span></label>
                      <input
                        type="text"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="e.g. PKR 150k - 250k"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-900 mb-2">Deadline <span className="text-gray-900/70">(optional)</span></label>
                    <input
                      type="text"
                      name="deadline"
                      value={form.deadline}
                      onChange={handleChange}
                      placeholder="e.g. 2 weeks"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-900 mb-2">Your Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, goals, and timeline..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" variant="dark" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

    </>
  );
}