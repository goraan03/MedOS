import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Stethoscope } from 'lucide-react';
import { servicesApi } from '../../api/services.api';
import { ServiceModal } from '../../components/services/ServiceModal';
import { ServiceCard } from '../../components/services/ServiceCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export function ServicesPage() {
  const [showModal, setShowModal] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.list,
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Services"
        subtitle={`${services.length} active services`}
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1.5" /> New service
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Stethoscope size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No services yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}

      {showModal && <ServiceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}