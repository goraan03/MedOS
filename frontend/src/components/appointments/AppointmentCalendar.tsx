import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '@/types/appointment.types';
import type { AppointmentStatus } from '@/types/common.types';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  ARRIVED: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-gray-100 text-gray-600',
  NO_SHOW: 'bg-red-100 text-red-700',
  CANCELED: 'bg-red-50 text-red-400',
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

interface Props {
  appointments: Appointment[];
  weekOffset: number;
  onWeekChange: (offset: number) => void;
}

export function AppointmentCalendar({ appointments, weekOffset, onWeekChange }: Props) {
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getForDay = (day: Date) =>
    appointments.filter(a => new Date(a.startAt).toDateString() === day.toDateString());

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button onClick={() => onWeekChange(weekOffset - 1)} className="p-2 hover:bg-gray-50 rounded-l-lg">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => onWeekChange(0)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Today
          </button>
          <button onClick={() => onWeekChange(weekOffset + 1)} className="p-2 hover:bg-gray-50 rounded-r-lg">
            <ChevronRight size={16} />
          </button>
        </div>
        <span className="text-sm text-gray-500">
          {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
        </span>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="py-3 px-3 text-xs text-gray-400" />
          {weekDays.map(day => (
            <div
              key={day.toISOString()}
              className={`py-3 text-center border-l border-gray-100 ${day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''}`}
            >
              <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
              <p className={`text-sm font-semibold mt-0.5 ${day.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        <div className="max-h-[560px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[56px]">
              <div className="px-3 py-2 text-xs text-gray-400">{hour}:00</div>
              {weekDays.map(day => {
                const appts = getForDay(day).filter(a => new Date(a.startAt).getHours() === hour);
                return (
                  <div key={day.toISOString()} className="border-l border-gray-100 p-1 space-y-1">
                    {appts.map(a => (
                      <div key={a.id} className={`text-xs rounded p-1.5 ${STATUS_COLORS[a.status]}`}>
                        <p className="font-medium truncate">{a.patient.firstName} {a.patient.lastName}</p>
                        <p className="truncate opacity-75">{a.service?.name ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}