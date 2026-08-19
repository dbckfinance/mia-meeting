/** Templates de résumé M&A pour sync Reikn */

export const MEETING_TEMPLATES = [
  {
    id: 'buyer_call',
    label: 'Buyer / seller call',
  },
  {
    id: 'mgmt_presentation',
    label: 'Management presentation',
  },
  {
    id: 'ic_prep',
    label: 'IC prep / note IC',
  },
  {
    id: 'dd_qa',
    label: 'DD Q&A tracker',
  },
  {
    id: 'actions',
    label: 'Actions & owners',
  },
  {
    id: 'generic',
    label: 'Résumé générique',
  },
] as const;

export type MeetingTemplateId = (typeof MEETING_TEMPLATES)[number]['id'];
