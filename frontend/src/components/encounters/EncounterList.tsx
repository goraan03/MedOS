import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { type Encounter } from '../../types/encounter.types';
import { Badge } from '../ui/Badge';

type DentalExtraData = {
  tooth?: string | number;
  procedure?: string;
  material?: string;
};

function toDisplay(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

interface Props {
  encounters: Encounter[];
  onAdd?: () => void;
  onAddDental?: () => void;
}

export function EncounterList({ encounters, onAdd, onAddDental }: Props) {
  if (encounters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No encounters yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {encounters.map(e => (
        <div key={e.id} className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={e.moduleKey === 'dental' ? 'blue' : 'gray'}>
                  {e.moduleKey}
                </Badge>
                <span className="text-xs text-gray-400">
                  {format(new Date(e.createdAt), 'dd MMM yyyy')}
                </span>
              </div>
              {e.summary && (
                <p className="font-medium text-gray-900">{e.summary}</p>
              )}
              {e.note && (
                <p className="text-sm text-gray-500 mt-1">{e.note}</p>
              )}
            </div>
            <span className="text-xs text-gray-400">
              Dr. {e.doctor.user.firstName} {e.doctor.user.lastName}
            </span>
          </div>

          {/* Dental extra data */}
          {e.moduleKey === 'dental' && e.extraData && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3 text-xs text-gray-600">
              {(() => {
                const extra = e.extraData as DentalExtraData;
                const tooth = toDisplay(extra.tooth);
                const procedure = toDisplay(extra.procedure);
                const material = toDisplay(extra.material);

                return (
                  <>
                    {tooth && <span>Tooth: <strong>{tooth}</strong></span>}
                    {procedure && <span>Procedure: <strong>{procedure}</strong></span>}
                    {material && <span>Material: <strong>{material}</strong></span>}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
