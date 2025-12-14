// Resend segment for all contact form submissions
export const PROSPECTS_SEGMENT_ID = 'f6ddc874-00c1-4c47-92e2-7e9547aac617';

// Resend topic IDs for each interest category
export const TOPICS = {
  'classes': 'fd37479a-b6a5-412b-b1f9-b4a9160b4112',
  'connect-member': 'dd0f1f01-3bd4-49c6-bd76-69e6ac4e5363',
  'email-updates': 'ab61455c-faad-4557-a8e7-902c1bd6d9bb',
} as const;

export type InterestKey = keyof typeof TOPICS;
