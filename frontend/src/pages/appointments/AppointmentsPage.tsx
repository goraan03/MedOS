import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, addWeeks, startOfWeek } from 'date-fns';
import { Plus } from 'lucide-react';
import { appointmentsApi } from '../../api/appointments.api';
import { AppointmentCalendar } from '../../components/appointments/AppointmentCalendar';
import { AppointmentList } from '../../components/appointments/AppointmentList';
import { AppointmentModal } from '../../components/appointments/AppointmentModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export function AppointmentsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const from = weekStart.toISOString();
  const to = addDays(weekStart, 7).toISOString();

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', from, to],
    queryFn: () => appointmentsApi.list({ from, to }),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Appointments"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1.5" /> New appointment
          </Button>
        }
      />

      <AppointmentCalendar
        appointments={appointments}
        weekOffset={weekOffset}
        onWeekChange={setWeekOffset}
      />

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This week</h3>
        <AppointmentList appointments={appointments} />
      </div>

      {showModal && <AppointmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}