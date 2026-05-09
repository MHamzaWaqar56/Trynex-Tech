'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePublicServices } from '@/components/shared/usePublicServices';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '../ui/spinner';

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

// Next 24 hours ke baad wala cutoff time — same date select karne per
function getCutoffTime(): string | null {
  const now = new Date();
  const minDate = getMinDateString();
  const selectedMinDate = minDate;
  return selectedMinDate;
}

// Kya ye slot next 24 hours ke andar hai?
function isWithin24Hours(date: string, time: string): boolean {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const [hours, minutes] = time.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate <= cutoff;
}

export default function ConsultationBookingForm() {
  const { services, loading: servicesLoading, error: servicesError } = usePublicServices();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', message: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [cancelledSlots, setCancelledSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime(''); // reset time on date change
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
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
        // Slot taken — refresh slots
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

  if (success) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">Booking Confirmed!</h3>
        <p className="text-dark-muted text-sm mb-6">
          Your consultation has been booked. We will send you a confirmation email within few hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="btn-secondary text-sm"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-white">Book a Consultation</h2>
          <p className="text-dark-muted text-xs mt-0.5">Free 30-minute strategy session</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-dark-muted mb-2">Full Name *</label>
            <input
              type="text" name="name" required
              value={form.name} onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-2">Email Address *</label>
            <input
              type="email" name="email" required
              value={form.email} onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Phone + Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-dark-muted mb-2">Phone Number</label>
            <input
              type="tel" name="phone"
              value={form.phone} onChange={handleChange}
              placeholder="+92 300 1234567"
              className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-muted mb-2">Service Interested In *</label>
            <Select
              value={form.service}
              onValueChange={(value) => setForm({ ...form, service: value })}
              disabled={servicesLoading}
            >
              <SelectTrigger className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors">
                <SelectValue placeholder={servicesLoading ? 'Loading services...' : 'Select a service'} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.slug} value={service.title}>{service.title}</SelectItem>
                ))}
                <SelectItem value="Other">Other / Not Sure</SelectItem>
              </SelectContent>
            </Select>
            {servicesError && (
              <p className="mt-2 text-xs text-red-300">{servicesError}</p>
            )}
            {!servicesLoading && services.length === 0 && !servicesError && (
              <p className="mt-2 text-xs text-dark-muted">No services are available right now.</p>
            )}
          </div>
        </div>

        {/* Date picker */}
        <div>
          <label className="flex items-center gap-2 text-sm text-dark-muted mb-2">
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
            className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
          />
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div>
            <label className="flex items-center gap-2 text-sm text-dark-muted mb-3">
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
        ? 'bg-dark-border/30 border-dark-border text-dark-muted/40 cursor-not-allowed line-through'
        : isCancelled
          ? 'bg-red-400/5 border-red-400/20 text-red-400/40 cursor-not-allowed line-through'
        : isTooSoon
          ? 'bg-dark-border/20 border-dark-border text-dark-muted/30 cursor-not-allowed opacity-40'
        : isSelected
          ? 'bg-primary border-primary text-dark font-bold'
          : 'bg-dark border-dark-border text-dark-muted hover:border-primary/40 hover:text-white cursor-pointer'
      }
    `}
  >
    {TIME_LABELS[time]}
    {isBooked && (
      <div className="text-[9px] mt-0.5 text-dark-muted/50 no-underline">Booked</div>
    )}
    {isCancelled && (
      <div className="text-[9px] mt-0.5 text-red-400/40 no-underline">Cancelled</div>
    )}
    {isTooSoon && !isBooked && !isCancelled && (
      <div className="text-[9px] mt-0.5 text-dark-muted/30">Unavailable</div>
    )}
  </button>
)
})}
            </div>

            {/* Legend */}
             
             <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-dark-muted">
  <span className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded bg-primary inline-block" /> Selected
  </span>
  <span className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded bg-dark-border/30 border border-dark-border inline-block" /> Booked
  </span>
  <span className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded bg-red-400/10 border border-red-400/20 inline-block" /> Cancelled
  </span>
  <span className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded border border-dark-border opacity-40 inline-block" /> Unavailable
  </span>
  <span className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded border border-dark-border inline-block" /> Available
  </span>
</div>

          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm text-dark-muted mb-2">Message (optional)</label>
          <textarea
            name="message" rows={3}
            value={form.message} onChange={handleChange}
            placeholder="Tell us briefly what you'd like to discuss..."
            className="w-full px-4 py-3 bg-dark border border-dark-border rounded-lg text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>

        {/* Selected summary */}
        {selectedDate && selectedTime && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-primary font-mono">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' '}&mdash; {TIME_LABELS[selectedTime]}
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
               <Spinner size="sm" variant="white" />
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
    </div>
  );
}
