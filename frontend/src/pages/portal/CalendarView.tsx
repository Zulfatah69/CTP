import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const localizer = momentLocalizer(moment);

export default function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchApprovedBookings();
  }, []);

  const fetchApprovedBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      // Filter hanya yang APPROVED untuk ditampilkan di kalender publik
      const approved = data.filter((b: any) => b.state === 'APPROVED' || b.state === 'ACTIVE');
      
      const calendarEvents = approved.map((b: any) => ({
        id: b.id,
        title: `${b.room?.name || 'Ruangan'} - ${b.eventName}`,
        start: new Date(b.dateStart),
        end: new Date(b.dateEnd),
        resource: b.room?.name,
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load events');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kalender Ketersediaan</h1>
        <p className="text-gray-500">Lihat jadwal ruangan yang telah disetujui.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={['month', 'week', 'day']}
              defaultView="month"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
