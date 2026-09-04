import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { OperationalCalendar, type CalendarEventItem } from '@/components/calendar/OperationalCalendar';
import { Info, CalendarDays } from 'lucide-react';

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);

  useEffect(() => {
    fetchApprovedBookings();
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const { data } = await api.get('/master/buildings');
      setBuildings(data);
    } catch (e) {
      console.error('Failed to load buildings');
    }
  };

  const fetchApprovedBookings = async () => {
    try {
      const { data } = await api.get('/bookings/public-calendar');
      const calendarEvents: CalendarEventItem[] = data.map((b: any) => ({
        id: b.id,
        title: `${b.room?.name || 'Ruangan'} - ${b.eventName}`,
        eventName: b.eventName,
        roomName: b.room?.name || 'Ruangan',
        buildingName: b.room?.building?.name || '',
        start: new Date(b.dateStart),
        end: new Date(b.dateEnd),
        state: b.state,
        participantCount: b.participantCount,
        applicantName: b.user?.fullName || b.user?.email || 'Pemohon Terdaftar',
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load events');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">
            Kalender Jadwal Pemakaian Ruangan
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Pantau jadwal kegiatan terkonfirmasi di lingkungan UPTD Cimahi Techno Park dan Gedung BITC.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Info className="w-3.5 h-3.5 text-primary-700 shrink-0" />
          <span>Klik kegiatan untuk melihat rincian ruangan & jam</span>
        </div>
      </div>

      <OperationalCalendar
        events={events}
        buildings={buildings}
        showFilters={true}
        height={640}
      />
    </div>
  );
}
