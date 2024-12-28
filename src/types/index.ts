export interface ProcessedEmail {
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  website?: string;
  mxProvider?: string;
  otherDmName?: string;
  [key: string]: any;
}

export interface ProcessingStatus {
  currentTask: string;
  progress: number;
  eta: number;
  isComplete: boolean;
}