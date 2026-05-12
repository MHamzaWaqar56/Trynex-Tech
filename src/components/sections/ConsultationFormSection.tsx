'use client';

import { useEffect, useState } from 'react';
import { Calendar, CalendarDays, Clock, MessageSquare, ShieldCheck,  Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePublicServices } from '@/components/shared/usePublicServices';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

const TIME_LABELS: Record<string, string> = {
  '09:00': '9:00 AM', '10:00': '10:00 AM', '11:00': '11:00 AM',
  '12:00': '12:00 PM', '13:00': '1:00 PM', '14:00': '2:00 PM',
  '15:00': '3:00 PM', '16:00': '4:00 PM', '17:00': '5:00 PM',
  '18:00': '6:00 PM',
};

const consultationInfo = [
  { icon: Calendar,     label: 'Session Length', value: '60 minutes free',    },
  { icon: Clock,        label: 'Availability',   value: 'Monday to Friday',   },
  { icon: MessageSquare,label: 'Best For',        value: 'Strategy, scope & planning', },
  { icon: ShieldCheck,  label: 'Response Time',  value: 'Within 24 hours',          },
];


function getMinDateString() {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString().split('T')[0];
}

function getMaxDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

function isWithin24Hours(date: string, time: string): boolean {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const [hours, minutes] = time.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate <= cutoff;
}

export default function  ConsultationFormSection() {
  const { services, loading: servicesLoading, error: servicesError } = usePublicServices();
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [cancelledSlots, setCancelledSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime('');
    setLoadingSlots(true);
    fetch(`/api/consultation/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setBookedSlots(data.bookedSlots || []);
        setCancelledSlots(data.cancelledSlots || []);
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service) { toast.error('Please select a service.'); return; }
    if (!selectedDate) { toast.error('Please select a date.'); return; }
    if (!selectedTime) { toast.error('Please select a time slot.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/consultation/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: selectedDate, time: selectedTime }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success('Consultation booked! We will confirm via email.');
        setForm({ name: '', email: '', phone: '', service: '', message: '' });
        setSelectedDate('');
        setSelectedTime('');
        setBookedSlots([]);
      } else if (res.status === 409) {
        toast.error(data.error || 'This slot is already booked. Please choose another.');
        setSelectedTime('');
        const r = await fetch(`/api/consultation/slots?date=${selectedDate}`);
        const d = await r.json();
        setBookedSlots(d.bookedSlots || []);
        setCancelledSlots(d.cancelledSlots || []);
      } else {
        toast.error(data.error || 'Something went wrong. Please try again.');
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

          {/* Section header — matches contact page pattern */}
          <div className="mb-4">
            <span className="section-badge">
              <CalendarDays className="h-3.5 w-3.5" />
              Book a Session
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Schedule a <span className="gradient-text">Free Call</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Pick a slot that suits you. We&apos;ll come prepared with a plan for your project.
            </p>
          </div>

          {/* Two-column layout — mirrors contact page exactly */}
          <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-10">

            {/* ── Left column: info cards + "what you'll get" ── */}
            <div className="space-y-6">

              {/* Info cards grid (same as contact page contactInfo cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {consultationInfo.map(({ icon: Icon, label, value, }) => (
                  <div
                    key={label}
                    className="glass-card-hover group flex items-start gap-4 p-5"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-900 font-mono mb-0.5">{label}</div>
                      <div className="text-sm text-gray-900 font-medium leading-snug break-words">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* "How it works" card — extra context for the user */}
              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="text-lg font-display font-bold text-gray-900 mb-2">How it works</h3>
                    <ul className="space-y-3 text-sm text-gray-900">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        Pick a date and time that suits you.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        We confirm your booking via email within a few hours.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        On the day, we hop on a 60-minute call—no sales pitch, just strategy.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right column: booking form ── */}
            <div className="space-y-8">

              {/* Form header card — mirrors contact page's "Send Us a Message" header */}
              <div className="glass-card p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-gray-900 min-[320px]:max-[500px]:text-[14px]">Book Your Free Strategy Session</h2>
                      <p className="text-xs text-gray-600 mt-0.5 font-mono min-[320px]:max-[400px]:text-[11px]">Free · 60 minutes · No obligation</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 mt-2">
                    Choose a slot and share a little context. That helps us prepare before the call.
                  </p>
                </div>

                {success ? (
                  /* ── Success state (light theme version) ── */
                  <div className="py-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-900/70 text-sm mb-6">
                      Your consultation has been booked. We&apos;ll send a confirmation email within a few hours.
                    </p>
                    <button onClick={() => setSuccess(false)} className="btn-secondary text-sm">
                      Book Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name + Email */}
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

                    {/* Phone + Service */}
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
                        <label className="block text-sm text-gray-900 mb-2">Service Interested In *</label>
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
                        {servicesError && <p className="mt-2 text-xs text-red-400">{servicesError}</p>}
                        {!servicesLoading && services.length === 0 && !servicesError && (
                          <p className="mt-2 text-xs text-gray-900">No services are available right now.</p>
                        )}
                      </div>
                    </div>

                    {/* Date picker */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-900 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Select Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={getMinDateString()}
                        max={getMaxDateString()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    {/* Time slots */}
                    {selectedDate && (
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-900 mb-3">
                          <Clock className="w-4 h-4 text-primary" />
                          Select Time Slot *
                          {loadingSlots && <Spinner size="sm" />}
                        </label>

                        <div className="grid grid-cols-5 gap-2">
                          {AVAILABLE_TIMES.map((time) => {
                            const isBooked = bookedSlots.includes(time);
                            const isCancelled = cancelledSlots.includes(time);
                            const isTooSoon = isWithin24Hours(selectedDate, time);
                            const isDisabled = isBooked || isCancelled || isTooSoon || loadingSlots;
                            const isSelected = selectedTime === time;

                            return (
                              <button
                                key={time}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => !isDisabled && setSelectedTime(time)}
                                className={`
                                  px-2 py-2.5 rounded-lg text-xs font-mono text-center transition-all duration-150 border
                                  ${isBooked
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                                    : isCancelled
                                      ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through'
                                      : isTooSoon
                                        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                                        : isSelected
                                          ? 'bg-primary border-primary text-white font-bold shadow-btn'
                                          : 'bg-white border-gray-200 text-gray-900 hover:border-primary/40 hover:text-primary cursor-pointer'
                                  }
                                `}
                              >
                                {TIME_LABELS[time]}
                                {isBooked && <div className="text-[9px] mt-0.5 text-gray-400 no-underline">Booked</div>}
                                {isCancelled && <div className="text-[9px] mt-0.5 text-red-400 no-underline">Cancelled</div>}
                                {isTooSoon && !isBooked && !isCancelled && (
                                  <div className="text-[9px] mt-0.5 text-gray-300">Unavailable</div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-900/60">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-primary inline-block" /> Selected
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block" /> Booked
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block" /> Cancelled
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200 opacity-60 inline-block" /> Unavailable
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block" /> Available
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="block text-sm text-gray-900 mb-2">
                        Message <span className="text-gray-900/70">(optional)</span>
                      </label>
                      <textarea
                        name="message" rows={3}
                        value={form.message} onChange={handleChange}
                        placeholder="Tell us briefly what you'd like to discuss..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    {/* Selected slot summary — light theme version */}
                    {selectedDate && selectedTime && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        <p className="text-sm text-primary font-mono">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                          })}
                          {' '}— {TIME_LABELS[selectedTime]}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !selectedDate || !selectedTime}
                      className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" variant="dark" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Book Consultation
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    
    </>
  );
}