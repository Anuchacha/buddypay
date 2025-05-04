import { Participant } from '../schema';
import { Timestamp } from 'firebase/firestore';

export interface ParticipantGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  participants: Participant[];
}

export type ParticipantGroupWithoutId = Omit<ParticipantGroup, 'id'>; 