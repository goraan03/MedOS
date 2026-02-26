import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { patientsApi } from '../../api/patients.api';
import { PatientModal } from '../../components/patients/PatientModal';
import { PatientTable } from '../../components/patients/PatientTable';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export function PatientsPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', search],
    queryFn: () => patientsApi.list(search || undefined),
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} total`}
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1.5" /> New patient
          </Button>
        }
      />

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <PatientTable patients={patients} />
      )}

      {showModal && <PatientModal onClose={() => setShowModal(false)} />}
    </div>
  );
}