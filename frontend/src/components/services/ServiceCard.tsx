import type { Service } from '@/types/service.types';
import { Badge } from '../ui/Badge';

interface Props {
  service: Service;
}

export function ServiceCard({ service }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{service.name}</h3>
        {service.moduleKey && <Badge variant="blue">{service.moduleKey}</Badge>}
      </div>
      {service.description && (
        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
      )}
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
        <span>{service.durationMin} min</span>
        <span className="font-medium text-gray-900">{Number(service.price).toFixed(2)} RSD</span>
      </div>
    </div>
  );
}