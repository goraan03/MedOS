export type EncounterVisibility = 'STAFF_ONLY' | 'PATIENT_VISIBLE';

export interface Encounter {
  id: string;
  moduleKey: string;
  summary?: string;
  note?: string;
  visibility: EncounterVisibility;
  extraData: Record<string, unknown>;
  createdAt: string;
  doctor: { id: string; user: { firstName: string; lastName: string } };
  patient: { id: string; firstName: string; lastName: string };
  appointment?: { id: string; startAt: string };
}