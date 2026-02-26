export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  description?: string;
  moduleKey?: string;
  isActive: boolean;
}