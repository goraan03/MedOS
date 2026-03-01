import { useNavigate } from 'react-router-dom';
import { type Patient } from '../../types/patient.types';
import { User } from 'lucide-react';

interface Props {
  patients: Patient[];
}

export function PatientTable({ patients }: Props) {
  const navigate = useNavigate();

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <User size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No patients yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Name', 'Phone', 'Email', 'Date of birth'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {patients.map(p => (
            <tr
              key={p.id}
              onClick={() => navigate(`/patients/${p.id}`)}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="px-5 py-3 text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</td>
              <td className="px-5 py-3 text-sm text-gray-500">{p.phone ?? '-'}</td>
              <td className="px-5 py-3 text-sm text-gray-500">{p.email ?? '-'}</td>
              <td className="px-5 py-3 text-sm text-gray-500">
                {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}