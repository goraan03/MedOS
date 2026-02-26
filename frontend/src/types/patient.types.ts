export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  allergies?: string;
  notes?: string;
  createdAt: string;
}