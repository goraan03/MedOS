import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { patientsApi } from '../../api/patients.api';
import { encountersApi } from '../../api/encounters.api';
import { paymentsApi } from '../../api/payments.api';
import { EncounterList } from '../../components/encounters/EncounterList';
import { EncounterModal } from '../../components/encounters/EncounterModal';
import { DentalEncounterModal } from '../../components/encounters/DentalEncounterModal';
import { PaymentList } from '../../components/payments/PaymentList';
import { PaymentModal } from '../../components/payments/PaymentModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';

type Tab = 'encounters' | 'dental' | 'payments';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('encounters');
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showDentalModal, setShowDentalModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { hasModule } = useAuthStore();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.get(id!),
    enabled: !!id,
  });

  const { data: encounters = [] } = useQuery({
    queryKey: ['encounters', { patientId: id }],
    queryFn: () => encountersApi.list({ patientId: id }),
    enabled: !!id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', { patientId: id }],
    queryFn: () => paymentsApi.list({ patientId: id }),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>;
  if (!patient) return <div className="p-8 text-gray-400 text-sm">Patient not found</div>;

  const generalEncounters = encounters.filter(e => e.moduleKey !== 'dental');
  const dentalEncounters = encounters.filter(e => e.moduleKey === 'dental');

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'encounters', label: 'Encounters', count: generalEncounters.length },
    ...(hasModule('dental') ? [{ key: 'dental' as Tab, label: 'Dental', count: dentalEncounters.length }] : []),
    { key: 'payments', label: 'Payments', count: payments.length },
  ];

  return (
    <div className="p-8">
      {/* Back */}
      <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to patients
      </button>

      {/* Patient info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {patient.phone && <span>{patient.phone}</span>}
              {patient.email && <span>{patient.email}</span>}
              {patient.dateOfBirth && (
                <span>DOB: {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}</span>
              )}
              {patient.gender && <Badge variant="gray">{patient.gender}</Badge>}
            </div>
          </div>
        </div>
        {patient.allergies && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs font-medium text-red-700 mb-0.5">Allergies</p>
            <p className="text-sm text-red-600">{patient.allergies}</p>
          </div>
        )}
        {patient.notes && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Notes</p>
            <p className="text-sm text-gray-600">{patient.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'encounters' && (
            <Button onClick={() => setShowEncounterModal(true)}>
              <Plus size={16} className="mr-1.5" /> New encounter
            </Button>
          )}
          {activeTab === 'dental' && (
            <Button onClick={() => setShowDentalModal(true)}>
              <Plus size={16} className="mr-1.5" /> New dental encounter
            </Button>
          )}
          {activeTab === 'payments' && (
            <Button onClick={() => setShowPaymentModal(true)}>
              <Plus size={16} className="mr-1.5" /> New payment
            </Button>
          )}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'encounters' && <EncounterList encounters={generalEncounters} />}
      {activeTab === 'dental' && <EncounterList encounters={dentalEncounters} />}
      {activeTab === 'payments' && <PaymentList payments={payments} />}

      {/* Modals */}
      {showEncounterModal && (
        <EncounterModal patientId={id!} onClose={() => setShowEncounterModal(false)} />
      )}
      {showDentalModal && (
        <DentalEncounterModal patientId={id!} onClose={() => setShowDentalModal(false)} />
      )}
      {showPaymentModal && (
        <PaymentModal patientId={id} onClose={() => setShowPaymentModal(false)} />
      )}
    </div>
  );
}