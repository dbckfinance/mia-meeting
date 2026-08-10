/**
 * Sync local meeting transcript → M&IA cloud APIs.
 */

import { MIA_API_URL } from './miaConfig';
import { getMiaAccessToken } from './miaAuth';
import type { MeetingTemplateId } from './meetingTemplates';

export type MiaMeetingSession = {
  id: string;
  title?: string;
  summary_md?: string;
  status?: string;
  eve_run_id?: string;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getMiaAccessToken();
  if (!token) throw new Error('Connectez-vous à M&IA dans Paramètres → Compte M&IA');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${MIA_API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `M&IA API ${res.status}`);
  }
  return body as T;
}

export type SyncMeetingInput = {
  title: string;
  transcriptText: string;
  meetingType?: MeetingTemplateId;
  summaryTemplate?: MeetingTemplateId;
  /** When false, only creates the cloud session without summarize */
  summarize?: boolean;
};

/**
 * Push a finished local transcript to M&IA and optionally run M&A summarize.
 */
export async function syncMeetingToMia(input: SyncMeetingInput): Promise<{
  meeting: MiaMeetingSession;
}> {
  const transcript = (input.transcriptText || '').trim();
  if (transcript.length < 20) {
    throw new Error('Transcript trop court pour synchroniser');
  }

  const template = input.summaryTemplate || input.meetingType || 'ic_prep';

  const created = await api<{ meeting: MiaMeetingSession }>('/api/meetings', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title || `Réunion ${new Date().toLocaleString('fr-FR')}`,
      source: 'tauri_local',
      meeting_type: template,
      summary_template: template,
      transcript_text: transcript,
      language: 'fr',
    }),
  });

  let meeting = created.meeting;

  if (input.summarize !== false) {
    const summarized = await api<{ meeting: MiaMeetingSession }>(
      `/api/meetings/summarize?id=${meeting.id}`,
      {
        method: 'POST',
        body: JSON.stringify({ template }),
      }
    );
    meeting = summarized.meeting;
  }

  return { meeting };
}

export async function launchMiaSupercomputer(meetingId: string): Promise<{
  runId?: string;
  sessionId?: string;
  engine?: string;
}> {
  return api(`/api/meetings/to-supercomputer?id=${meetingId}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
