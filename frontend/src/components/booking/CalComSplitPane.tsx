import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, Building2, Check, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday } from 'date-fns';
import { id } from 'date-fns/locale';

interface RoomData {
  id: string;
  name: string;
  floor?: number;
  capacity?: number;
  description?: string;
  isAvailable?: boolean;
  building?: { name: string };
  tariffs?: Array<{ price: number; unit: string; legalBasis?: string }>;
  facilities?: Array<{ name: string }>;
}

interface CalComSplitPaneProps {
  room: RoomData;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  selectedSlot: { start: string; end: string } | null;
  onSlotSelect: (slot: { start: string; end: string }) => void;
  onConfirm: () => void;
}

const DEFAULT_HOURLY_SLOTS = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
];

export function CalComSplitPane({
  room,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotSelect,
  onConfirm,
}: CalComSplitPaneProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());
  const [activeSlotTemp, setActiveSlotTemp] = useState<{ start: string; end: string } | null>(
    selectedSlot
  );

  const today = startOfToday();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Leading empty days to align with day of week (Monday start)
  // Day of week: 0 is Sun, 1 is Mon
  const firstDayIndex = (monthStart.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const blanks = Array.from({ length: firstDayIndex });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    if (!isBefore(subMonths(currentMonth, 1), startOfMonth(today))) {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const handleDateClick = (day: Date) => {
    if (isBefore(day, today)) return;
    onDateChange(day);
    setActiveSlotTemp(null);
  };

  const handleSlotClick = (slot: { start: string; end: string }) => {
    if (activeSlotTemp?.start === slot.start) {
      // Second click or confirm
      onSlotSelect(slot);
      onConfirm();
    } else {
      setActiveSlotTemp(slot);
    }
  };

  const isPrevDisabled = isBefore(subMonths(currentMonth, 1), startOfMonth(today));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
        
        {/* PANE 1: Facility Info Panel (Left column - 4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 space-y-4 bg-neutral-50/60">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-accent-600 bg-accent-50 px-2 py-0.5 rounded border border-accent-100">
              <Building2 className="w-3 h-3" />
              {room.building?.name || 'UPTD CTP'}
            </span>
            <h3 className="text-xl font-bold text-neutral-900 mt-2">{room.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Lantai {room.floor || 1} &bull; Fasilitas Resmi Pemerintah
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-neutral-200 text-xs text-neutral-700">
            {room.capacity && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Kapasitas maksimal <b>{room.capacity} orang</b></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>Jam Operasional: <b>08:00 - 17:00 WIB</b></span>
            </div>
            {room.tariffs && room.tariffs.length > 0 && (
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-500 block">Tarif Retribusi Resmi:</span>
                  <span className="text-sm font-bold text-neutral-900">
                    Rp {Number(room.tariffs[0].price).toLocaleString('id-ID')} / {room.tariffs[0].unit}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border border-neutral-200 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-700" />
              Ketentuan Pemakaian:
            </p>
            <p className="text-neutral-600 leading-relaxed text-[11px]">
              Wajib mengunggah Surat Permohonan resmi instansi. Persetujuan jadwal mengacu pada disposisi pimpinan dan verifikasi berkas.
            </p>
          </div>
        </div>

        {/* PANE 2: Interactive Date Picker Calendar (Middle column - 5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-neutral-900 text-base">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </h4>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={prevMonth}
                disabled={isPrevDisabled}
                className="h-8 w-8 text-neutral-700 disabled:opacity-30"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 text-neutral-700"
                aria-label="Bulan selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers (Mon - Sun) */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-neutral-500 border-b border-neutral-100 pb-2">
            <span>SEN</span>
            <span>SEL</span>
            <span>RAB</span>
            <span>KAM</span>
            <span>JUM</span>
            <span className="text-red-500">SAB</span>
            <span className="text-red-500">MIN</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="h-9 w-9" />
            ))}

            {daysInMonth.map((day) => {
              const past = isBefore(day, today);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const current = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={past}
                  className={`relative h-9 w-9 mx-auto rounded-lg text-sm font-medium flex flex-col items-center justify-center transition-colors focus:ring-2 focus:ring-yellow-400
                    ${past ? 'text-neutral-300 cursor-not-allowed' : ''}
                    ${!past && !selected ? 'text-neutral-900 hover:bg-primary-50 cursor-pointer' : ''}
                    ${selected ? 'bg-primary-900 text-white font-bold shadow-xs' : ''}
                    ${current && !selected ? 'border border-primary-500 font-bold' : ''}
                  `}
                >
                  <span>{format(day, 'd')}</span>
                  {!past && (
                    <span
                      className={`h-1 w-1 rounded-full mt-0.5 ${
                        selected ? 'bg-white' : 'bg-primary-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary-600 inline-block" />
              Tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-300 inline-block" />
              Lewat / Tutup
            </span>
          </div>
        </div>

        {/* PANE 3: Time Slot Selector (Right column - 3 cols) */}
        <div className="lg:col-span-3 p-5 sm:p-6 space-y-3 bg-neutral-50/40">
          <div className="border-b border-neutral-200 pb-2">
            <h4 className="font-bold text-sm text-neutral-900">
              {selectedDate
                ? format(selectedDate, 'EEEE, d MMM', { locale: id })
                : 'Pilih Tanggal'}
            </h4>
            <p className="text-[11px] text-neutral-500">Waktu Indonesia Barat (WIB)</p>
          </div>

          {!selectedDate ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Silakan pilih tanggal di kalender terlebih dahulu untuk melihat ketersediaan jam.
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {DEFAULT_HOURLY_SLOTS.map((slot) => {
                const isSelected =
                  activeSlotTemp?.start === slot.start && activeSlotTemp?.end === slot.end;

                return (
                  <div key={slot.start} className="transition-all">
                    {isSelected ? (
                      /* Cal.com two-step confirmation button */
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="h-10 px-2 rounded-lg bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center">
                          {slot.start} - {slot.end}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            onSlotSelect(slot);
                            onConfirm();
                          }}
                          className="h-10 bg-primary-700 hover:bg-primary-900 text-white text-xs font-bold px-2 flex items-center justify-center gap-1"
                        >
                          <span>Pilih</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white hover:border-primary-500 hover:bg-primary-50/50 text-neutral-900 text-xs font-semibold flex items-center justify-center transition-colors focus:ring-2 focus:ring-yellow-400"
                      >
                        {slot.start} - {slot.end} WIB
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Full day option */}
              <div className="pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    const fullSlot = { start: '08:00', end: '17:00' };
                    onSlotSelect(fullSlot);
                    onConfirm();
                  }}
                  className="w-full p-2.5 rounded-lg border border-dashed border-primary-400 bg-primary-50 hover:bg-primary-100 text-primary-900 text-xs font-bold text-center transition-colors focus:ring-2 focus:ring-yellow-400 flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-primary-700" />
                  <span>Satu Hari Penuh (08:00 - 17:00 WIB)</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
