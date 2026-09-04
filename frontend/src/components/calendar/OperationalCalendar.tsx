import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, type View, type ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
// @ts-ignore
import 'moment/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { StatusTag } from '@/components/ui/StatusTag';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Users,
  Info,
  Filter,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

moment.locale('id');
const localizer = momentLocalizer(moment);

export interface CalendarEventItem {
  id: string;
  title: string;
  eventName: string;
  roomName: string;
  buildingName?: string;
  start: Date;
  end: Date;
  state?: string;
  participantCount?: number;
  applicantName?: string;
  applicantCategory?: string;
}

interface OperationalCalendarProps {
  events: CalendarEventItem[];
  buildings?: Array<{ id: string; name: string; rooms?: Array<{ id: string; name: string }> }>;
  showFilters?: boolean;
  height?: number | string;
  className?: string;
}

// Custom Event Component inside calendar cells
const CustomEventComponent: React.FC<{ event: CalendarEventItem; title: string }> = ({ event }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden text-left p-1 leading-snug">
      <div className="flex items-center gap-1 font-bold text-[11px] truncate">
        <span className="truncate">{event.roomName || 'Ruangan'}</span>
      </div>
      <div className="text-[10.5px] truncate font-medium text-neutral-800">
        {event.eventName}
      </div>
      {event.start && event.end && (
        <div className="text-[9.5px] text-neutral-600 font-mono mt-0.5 flex items-center gap-1 truncate">
          <Clock className="w-2.5 h-2.5 shrink-0" />
          <span>
            {format(new Date(event.start), 'HH:mm')} – {format(new Date(event.end), 'HH:mm')}
          </span>
        </div>
      )}
    </div>
  );
};

export function OperationalCalendar({
  events,
  buildings = [],
  showFilters = true,
  height = 680,
  className,
}: OperationalCalendarProps) {
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

  // Filters
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Available rooms for filter
  const availableRooms = useMemo(() => {
    if (!selectedBuilding) {
      return buildings.flatMap((b) => b.rooms || []);
    }
    const b = buildings.find((x) => x.id === selectedBuilding);
    return b?.rooms || [];
  }, [selectedBuilding, buildings]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedBuilding) {
        const b = buildings.find((x) => x.id === selectedBuilding);
        if (b && ev.buildingName && ev.buildingName !== b.name) return false;
      }
      if (selectedRoom) {
        if (ev.roomName && !ev.roomName.toLowerCase().includes(selectedRoom.toLowerCase())) {
          return false;
        }
      }
      if (selectedStatus) {
        if (ev.state && ev.state !== selectedStatus) return false;
      }
      return true;
    });
  }, [events, selectedBuilding, selectedRoom, selectedStatus, buildings]);

  // Event styling based on state
  const eventPropGetter = (event: CalendarEventItem) => {
    let bg = '#F0FDF4'; // emerald-50
    let border = '#059669'; // emerald-600
    let color = '#064E3B'; // emerald-950

    if (event.state === 'APPROVED' || event.state === 'ACTIVE') {
      bg = '#ECFDF5';
      border = '#10B981';
      color = '#064E3B';
    } else if (event.state === 'WAITING_PAYMENT') {
      bg = '#FFFBEB';
      border = '#F59E0B';
      color = '#78350F';
    } else if (event.state === 'COMPLETED') {
      bg = '#F3F4F6';
      border = '#6B7280';
      color = '#1F2937';
    } else {
      bg = '#EFF6FF';
      border = '#2563EB';
      color = '#1E3A8A';
    }

    return {
      style: {
        backgroundColor: bg,
        borderLeft: `4px solid ${border}`,
        borderTop: '1px solid #E5E7EB',
        borderRight: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
        color: color,
        borderRadius: '4px',
        padding: '0',
        cursor: 'pointer',
      },
    };
  };

  // Custom Toolbar Component
  const CustomToolbar: React.FC<ToolbarProps<CalendarEventItem, object>> = (toolbar) => {
    const goToToday = () => toolbar.onNavigate('TODAY');
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');

    const viewOptions: Array<{ key: View; label: string }> = [
      { key: 'month', label: 'Bulan' },
      { key: 'week', label: 'Minggu' },
      { key: 'day', label: 'Hari' },
      { key: 'agenda', label: 'Agenda' },
    ];

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border-b border-neutral-200">
        {/* Navigation & Label */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs h-9 px-3 font-semibold text-neutral-800"
          >
            Hari Ini
          </Button>
          <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={goToBack}
              className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-700 focus:ring-2 focus:ring-yellow-400"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-5 bg-neutral-200" />
            <button
              type="button"
              onClick={goToNext}
              className="h-9 w-9 flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-700 focus:ring-2 focus:ring-yellow-400"
              aria-label="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-neutral-950 ml-2 capitalize">
            {toolbar.label}
          </h3>
        </div>

        {/* View Switcher: Month / Week / Day / Agenda */}
        <div className="inline-flex rounded-lg border border-neutral-300 p-0.5 bg-neutral-100 shrink-0">
          {viewOptions.map((opt) => {
            const isActive = toolbar.view === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  toolbar.onView(opt.key);
                  setCurrentView(opt.key);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  isActive
                    ? 'bg-primary-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden ${className || ''}`}>
      {/* Optional Filters Bar */}
      {showFilters && (
        <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-neutral-700 mr-1">
            <Filter className="w-3.5 h-3.5 text-primary-700" />
            <span>Filter:</span>
          </div>

          {buildings.length > 0 && (
            <select
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedRoom('');
              }}
              className="h-9 px-2.5 rounded-md border border-neutral-300 bg-white text-xs text-neutral-800 font-medium focus:border-neutral-950 focus:ring-1 focus:ring-yellow-400"
            >
              <option value="">Semua Gedung</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {availableRooms.length > 0 && (
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="h-9 px-2.5 rounded-md border border-neutral-300 bg-white text-xs text-neutral-800 font-medium focus:border-neutral-950 focus:ring-1 focus:ring-yellow-400"
            >
              <option value="">Semua Ruangan</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-2.5 rounded-md border border-neutral-300 bg-white text-xs text-neutral-800 font-medium focus:border-neutral-950 focus:ring-1 focus:ring-yellow-400"
          >
            <option value="">Semua Status</option>
            <option value="APPROVED">Disetujui & Terjadwal</option>
            <option value="ACTIVE">Aktif (Sedang Berjalan)</option>
            <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
            <option value="COMPLETED">Selesai Digunakan</option>
          </select>

          {(selectedBuilding || selectedRoom || selectedStatus) && (
            <button
              type="button"
              onClick={() => {
                setSelectedBuilding('');
                setSelectedRoom('');
                setSelectedStatus('');
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-800 underline ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}

      {/* Calendar Area */}
      <div style={{ height }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day', 'agenda']}
          view={currentView}
          date={currentDate}
          onView={(newView) => setCurrentView(newView)}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onSelectEvent={(event) => setSelectedEvent(event)}
          eventPropGetter={eventPropGetter}
          min={new Date(1972, 0, 1, 7, 0, 0)}
          max={new Date(1972, 0, 1, 22, 0, 0)}
          step={30}
          timeslots={2}
          components={{
            toolbar: CustomToolbar,
            event: CustomEventComponent,
          }}
          messages={{
            today: 'Hari Ini',
            previous: 'Sebelumnya',
            next: 'Berikutnya',
            month: 'Bulan',
            week: 'Minggu',
            day: 'Hari',
            agenda: 'Agenda',
            date: 'Tanggal',
            time: 'Waktu',
            event: 'Kegiatan',
            noEventsInRange: 'Tidak ada agenda kegiatan terdaftar pada rentang waktu ini.',
          }}
        />
      </div>

      {/* Legend & Operation Times Bar */}
      <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-neutral-800">Keterangan:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-neutral-700 font-medium">Disetujui & Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-neutral-700 font-medium">Menunggu Pembayaran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 ring-2 ring-neutral-200" />
            <span className="text-neutral-700 font-medium">Selesai Digunakan</span>
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 font-medium">
          Jam operasional fasilitas: 07:00 – 22:00 WIB
        </div>
      </div>

      {/* Event Detail Modal Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="max-w-md p-6 bg-white rounded-lg border border-neutral-200 shadow-lg">
            <DialogHeader className="pb-3 border-b border-neutral-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <DialogTitle className="text-lg font-bold text-neutral-950 leading-tight">
                    {selectedEvent.eventName || selectedEvent.title}
                  </DialogTitle>
                  <p className="text-xs text-neutral-500 mt-1">Rincian Jadwal Pemanfaatan Fasilitas</p>
                </div>
                {selectedEvent.state && <StatusTag status={selectedEvent.state} size="sm" />}
              </div>
            </DialogHeader>

            <div className="space-y-3 pt-3 text-xs text-neutral-700 divide-y divide-neutral-100">
              <div className="flex items-start gap-2.5 pt-2">
                <Building2 className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block">Ruangan & Gedung</span>
                  <span>
                    {selectedEvent.roomName}
                    {selectedEvent.buildingName && ` — ${selectedEvent.buildingName}`}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2">
                <Clock className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block">Waktu Pelaksanaan</span>
                  <span>
                    {format(new Date(selectedEvent.start), 'EEEE, d MMMM yyyy', { locale: idLocale })}
                    <br />
                    Pukul {format(new Date(selectedEvent.start), 'HH:mm')} –{' '}
                    {format(new Date(selectedEvent.end), 'HH:mm')} WIB
                  </span>
                </div>
              </div>

              {selectedEvent.participantCount && (
                <div className="flex items-start gap-2.5 pt-2">
                  <Users className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Perkiraan Peserta</span>
                    <span>{selectedEvent.participantCount} orang</span>
                  </div>
                </div>
              )}

              {selectedEvent.applicantName && (
                <div className="flex items-start gap-2.5 pt-2">
                  <Info className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Penyelenggara / Pemohon</span>
                    <span>{selectedEvent.applicantName}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="text-xs h-9 px-4 font-semibold text-neutral-800"
              >
                Tutup Rincian
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
