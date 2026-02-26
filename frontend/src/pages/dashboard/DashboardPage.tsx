import { useAuthStore } from "../../store/auth.store";

export function DashboardPage() {
  const { user, clinic, role } = useAuthStore();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h2>
        <p className="text-gray-500 mt-1">{clinic?.name}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Your role" value={role ?? '-'} />
        <StatCard label="Clinic" value={clinic?.name ?? '-'} />
        <StatCard label="Clinic slug" value={clinic?.slug ?? '-'} />
      </div>
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        Milestone 1 complete — auth, RBAC, tenant enforcement working. Next: patients, services, appointments.
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}