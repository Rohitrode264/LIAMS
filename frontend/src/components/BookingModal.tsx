import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Calendar, CheckCircle, ArrowLeft, Loader2, Info, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { addDays, format, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { useCreateBooking } from '../hooks/useBookings';
import { useComponentAvailability } from '../hooks/useInventory';
import type { AvailabilitySlot, Component } from '../types';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    component: Component;
    labId: string;
}

export const BookingModal = ({ isOpen, onClose, component, labId }: BookingModalProps) => {
    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStart, setSelectedStart] = useState<string | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
    const [purpose, setPurpose] = useState('');

    const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

    const { data: availability, isLoading: isLoadingAvailability } = useComponentAvailability(
        isOpen ? component._id : null,
        formattedDate
    );

    const createBookingMutation = useCreateBooking();
    const slots = (availability?.bookedSlots || []) as AvailabilitySlot[];

    const resetSelection = () => {
        setSelectedDate(null);
        setSelectedStart(null);
        setSelectedEnd(null);
        setPurpose('');
    };

    const handleClose = () => {
        resetSelection();
        onClose();
    };

    // Calendar logic
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 14);

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDateLocal = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDateLocal = format(day, 'd');
                const cloneDay = day;
                const isPast = isBefore(day, today);
                const isTooFar = day > maxDate;
                const isDisabled = !isSameMonth(day, monthStart) || isPast || isTooFar;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isIsToday = isSameDay(day, today);

                days.push(
                    <div
                        key={day.toISOString()}
                        onClick={() => !isDisabled && setSelectedDate(cloneDay)}
                        className={`
                            relative flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm font-medium transition-all
                            ${isDisabled ? 'text-[var(--muted)] opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--surface-2)]'}
                            ${isSelected ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] font-bold shadow-md' : 'text-[var(--text)]'}
                            ${isIsToday && !isSelected ? 'text-[var(--primary)] font-bold bg-[var(--primary-muted)]' : ''}
                        `}
                    >
                        <span>{formattedDateLocal}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toISOString()} className="grid grid-cols-7 gap-1 mt-2">
                    {days}
                </div>
            );
            days = [];
        }
        return rows;
    };

    // Time slot generation logic (00:00 to 23:30, 30-min slots)
    const timeSlots = Array.from({ length: 48 }).map((_, i) => {
        const hour = Math.floor(i / 2);
        const min = (i % 2) * 30;
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        const endHour = Math.floor((i + 1) / 2);
        const endMin = ((i + 1) % 2) * 30;
        const endString = endHour === 24 ? "23:59" : `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

        // Check availability
        let isAvailable = true;

        if (selectedDate && slots) {
            const slotStart = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${timeString}:00`);
            const slotEnd = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${endString === '23:59' ? '23:59:59' : endString + ':00'}`);
            // Past slots are disabled if it's today
            if (isSameDay(selectedDate, today) && slotStart <= new Date()) {
                isAvailable = false;
            } else {
                slots.forEach(s => {
                    const bookedStart = new Date(s.start as any);
                    const bookedEnd = new Date(s.end as any);
                    if (slotStart < bookedEnd && slotEnd > bookedStart) {
                        if (s.remaining <= 0) {
                            isAvailable = false;
                        }
                    }
                });
            }
        }

        return { start: timeString, end: endString, isAvailable, remainingUnits: isAvailable ? 1 : 0 };
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedStart || !selectedEnd) return;

        const startIso = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedStart}:00`).toISOString();
        const endIso = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedEnd}:00`).toISOString();

        createBookingMutation.mutate(
            {
                component_id: component._id,
                lab_id: labId,
                start: startIso,
                end: endIso,
                purpose
            },
            { onSuccess: () => handleClose() }
        );
    };

    if (!isOpen) return null;

    const currentStep = !selectedDate ? 1 : (!selectedStart ? 2 : 3);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Darker, more premium backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
                onClick={handleClose}
            >
                {/* Subtle light leak effect */}
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            </div>
            
            {/* Modal Content - Truly Centered and Responsive */}
            <div className="bg-[var(--surface)] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] rounded-[2.5rem] w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-full border border-[var(--border)] relative z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 ease-out">

                {/* Close Button Mobile (top right overlay) */}
                <button
                    onClick={handleClose}
                    className="md:hidden absolute top-4 right-4 z-50 p-2 bg-[var(--surface-2)] rounded-full text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                    <X size={18} />
                </button>

                {/* LEFT COLUMN: Details */}
                <div className="md:w-[35%] bg-[var(--surface-2)] p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-[var(--border)] shrink-0 overflow-y-auto">
                    <div className="hidden md:block mb-8">
                        <button onClick={handleClose} className="p-2 -ml-2 bg-[var(--surface)] rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:shadow-sm transition-all shadow-sm border border-[var(--border)]">
                            <X size={18} />
                        </button>
                    </div>

                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5 opacity-80">Booking Request</p>
                    <h2 className="text-2xl font-black text-[var(--text)] leading-tight mb-4">{component.name}</h2>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <Clock size={16} className="text-[var(--muted)] mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-[var(--text)]">30 Min Sessions</p>
                                <p className="text-xs text-[var(--muted)]">Bookings are made in 30-minute slots.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Activity size={16} className="text-[var(--muted)] mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-[var(--text)]">Single Unit</p>
                                <p className="text-xs text-[var(--muted)]">One component per booking.</p>
                            </div>
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="mt-auto animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[var(--primary)] text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none" />
                            <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Selected Time</h4>
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar size={16} />
                                <span className="font-semibold">{format(selectedDate, 'EEEE, MMMM d')}</span>
                            </div>
                            {selectedStart && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Clock size={16} />
                                    <span className="font-semibold">{selectedStart} - {selectedEnd}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Interactive Selector */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative bg-[var(--surface)]">

                    {/* Step 1: Calendar */}
                    <div className={`transition-all duration-300 ${currentStep !== 1 ? 'hidden' : 'block animate-in fade-in'}`}>
                        <h3 className="text-xl font-bold text-[var(--text)] mb-6">Select a Date</h3>

                        <div className="max-w-md mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
                                    className="p-2 hover:bg-[var(--surface-2)] rounded-full transition-colors disabled:opacity-30"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <h4 className="font-bold text-lg text-[var(--text)]">
                                    {format(currentMonth, 'MMMM yyyy')}
                                </h4>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    disabled={currentMonth > addMonths(today, 1)}
                                    className="p-2 hover:bg-[var(--surface-2)] rounded-full transition-colors disabled:opacity-30"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <div key={d} className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider py-2">{d}</div>
                                ))}
                            </div>
                            {renderCells()}

                            <div className="mt-10 p-4 border border-[var(--border)] rounded-xl bg-[var(--surface-2)] flex items-start gap-3">
                                <Info size={16} className="text-[var(--primary)] shrink-0 mt-0.5" />
                                <p className="text-xs text-[var(--text)] leading-relaxed">
                                    Bookings can be made up to 14 days in advance. Select a date to view available hours based on real-time inventory.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Time Slots */}
                    <div className={`transition-all duration-300 ${currentStep === 2 ? 'block animate-in slide-in-from-right-8' : 'hidden'}`}>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Calendar
                        </button>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[var(--text)]">Select a Time</h3>
                            {isLoadingAvailability && <Loader2 size={16} className="animate-spin text-[var(--muted)]" />}
                        </div>
                        <p className="text-sm text-[var(--muted)] mb-8">
                            Showing availability for <span className="font-semibold text-[var(--text)]">{selectedDate ? format(selectedDate, 'EEEE, MMMM d') : ''}</span>
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {timeSlots.map((slot, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (slot.isAvailable) {
                                            setSelectedStart(slot.start);
                                            setSelectedEnd(slot.end);
                                        }
                                    }}
                                    disabled={!slot.isAvailable || isLoadingAvailability}
                                    className={`
                                        p-4 rounded-xl border-2 text-center transition-all duration-200
                                        ${!slot.isAvailable
                                            ? 'border-transparent bg-[var(--surface-2)] opacity-50 cursor-not-allowed'
                                            : 'border-[var(--primary-muted)] bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md cursor-pointer'}
                                    `}
                                >
                                    <p className={`font-bold text-base mb-1 ${!slot.isAvailable ? 'text-[var(--muted)]' : 'text-[var(--primary)]'}`}>
                                        {slot.start}
                                    </p>
                                    <p className="text-xs font-medium text-[var(--muted)]">
                                        {!slot.isAvailable ? 'Unavailable' : 'Available'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Confirmation */}
                    <div className={`transition-all duration-300 ${currentStep === 3 ? 'block animate-in slide-in-from-right-8' : 'hidden'}`}>
                        <button
                            onClick={() => { setSelectedStart(null); setSelectedEnd(null); }}
                            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Time Slots
                        </button>

                        <h3 className="text-xl font-bold text-[var(--text)] mb-2">Final Details</h3>
                        <p className="text-sm text-[var(--muted)] mb-8">Please provide a brief reason for your booking request.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[var(--text)] mb-2">Purpose of Visit</label>
                                <textarea
                                    className="form-input min-h-[140px] resize-y text-base p-4 bg-[var(--surface-2)] focus:bg-[var(--surface)]"
                                    placeholder="Explain your project, research, or course requirement..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    required
                                    minLength={5}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={createBookingMutation.isPending || !purpose.trim()}
                                className="w-full btn-primary py-4 text-base font-bold shadow-lg shadow-blue-500/20"
                            >
                                {createBookingMutation.isPending ? (
                                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><CheckCircle size={18} /> Confirm Booking</>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
    </div>,
    document.body
);    
};
