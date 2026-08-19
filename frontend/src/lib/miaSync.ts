/**
 * Sync local meeting transcript → Reikn cloud APIs.
 */

import { MIA_API_URL } from './miaConfig';
import { getMiaAccessToken } from './miaAuth';
import type { MeetingTemplateId } from './meetingTemplates';
import { getAutoSyncEnabled, getCloudMeetingId, setCloudMeetingId } from './miaSyncPrefs';

export type MiaMeetingSession = {
  id: string;
  title?: string;
  summary_md?: string;
  status?: string;
  eve_run_id?: string;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getMiaAccessToken();
  if (!token) throw new Error('Connectez-vous à Reikn dans Paramètres → Compte Reikn');
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
    throw new Error(body.error || `Reikn API ${res.status}`);
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
  /** Local SQLite meeting id — used to avoid duplicate cloud POSTs */
  localMeetingId?: string;
};

/**
 * Push a finished local transcript to Reikn and optionally run M&A summarize.
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

  if (input.localMeetingId) {
    await setCloudMeetingId(input.localMeetingId, meeting.id);
  }
  return { meeting };
}

export type AutoSyncMeetingInput = {
  localMeetingId: string;
  title: string;
  transcriptText: string;
  meetingType?: MeetingTemplateId;
};

/**
 * Fire-and-forget cloud push after a local save. No-ops if logged out,
 * auto-sync is off, the transcript is too short, or this meeting was already sent.
 */
export async function autoSyncMeetingAfterSave(input: AutoSyncMeetingInput): Promise<{
  skipped?: string;
  meeting?: MiaMeetingSession;
}> {
  const enabled = await getAutoSyncEnabled();
  if (!enabled) return { skipped: 'disabled' };
  if ((input.transcriptText || '').trim().length < 20) return { skipped: 'too_short' };
  const token = await getMiaAccessToken();
  if (!token) return { skipped: 'logged_out' };
  const existing = await getCloudMeetingId(input.localMeetingId);
  if (existing) return { skipped: 'already_synced', meeting: { id: existing } };
  const { meeting } = await syncMeetingToMia({
    title: input.title,
    transcriptText: input.transcriptText,
    meetingType: input.meetingType,
    summaryTemplate: input.meetingType,
    summarize: true,
    localMeetingId: input.localMeetingId,
  });
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
