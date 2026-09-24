import { ActorType } from '../constants';

// Who caused a status change; written onto the audit event.
export interface Actor {
  type: ActorType;
  name: string;
}
