import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { AppointmentStatus } from '@/types/common.types';
import type { Appointment } from '@/types/appointment.types';

const STATUS_BADGE: Record<AppointmentStatus, 'blue' | 'green' | 'yellow' | 'gray' | 'red'> = {
  SCHEDULED: 'blue',
  CONFIRMED: 'green',
  ARRIVED: 'yellow',
  DONE: 'gray',
  NO_SHOW: 'red',
  CANCELED: 'red',
};

interface Props {
  appointments: Appointment[];
}

export function AppointmentList({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Calendar size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No appointments this week</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map(a => (
        <div key={a.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center min-w-[52px]">
              <p className="text-xs text-gray-500">{format(new Date(a.startAt), 'EEE')}</p>
              <p className="text-sm font-bold text-gray-900">{format(new Date(a.startAt), 'd MMM')}</p>
              <p className="text-xs text-gray-500">{format(new Date(a.startAt), 'HH:mm')}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">{a.patient.firstName} {a.patient.lastName}</p>
              <p className="text-sm text-gray-500">
                {a.service?.name ?? 'No service'} · Dr. {a.doctor.user.firstName} {a.doctor.user.lastName}
              </p>
            </div>
          </div>
          <Badge variant={STATUS_BADGE[a.status]}>{a.status}</Badge>
        </div>
      ))}
    </div>
  );
}