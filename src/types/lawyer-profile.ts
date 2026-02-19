// Lawyer Profile Types

import type { ConsultationType } from './booking';

export interface LawyerProfile {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  bio?: string;
  experience?: number;
  consultationTypes?: ConsultationType[];
}

export interface LawyerListItem {
  id: string;
  name: string;
  specialty?: string;
  experience?: number;
  consultationTypes?: ConsultationType[];
}
