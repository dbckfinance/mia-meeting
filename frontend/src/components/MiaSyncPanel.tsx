'use client';

import React, { useMemo, useState } from 'react';
import { Cloud, Cpu, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { MEETING_TEMPLATES, type MeetingTemplateId } from '@/lib/meetingTemplates';
import { launchMiaSupercomputer, syncMeetingToMia } from '@/lib/miaSync';
import { getMiaAccessToken } from '@/lib/miaAuth';

type Props = {
  meetingTitle: string;
  /** Plain transcript text (joined segments) */
  transcriptText: string;
};

export function MiaSyncPanel({ meetingTitle, transcriptText }: Props) {
  const [template, setTemplate] = useState<MeetingTemplateId>('ic_prep');
  const [stayLocal, setStayLocal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [cloudMeetingId, setCloudMeetingId] = useState<string | null>(null);

  const canSync = useMemo(
    () => (transcriptText || '').trim().length >= 20 && !stayLocal,
    [transcriptText, stayLocal]
  );

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = await getMiaAccessToken();
      if (!token) {
        toast.error('Connectez-vous dans Paramètres → Compte M&IA');
        return;
      }
      const { meeting } = await syncMeetingToMia({
        title: meetingTitle,
        transcriptText,
        meetingType: template,
        summaryTemplate: template,
        summarize: true,
      });
      setCloudMeetingId(meeting.id);
      toast.success('Réunion synchronisée avec M&IA');
    } catch (err: any) {
      toast.error(err?.message || 'Échec sync M&IA');
    } finally {
      setSyncing(false);
    }
  };

  const handleSupercomputer = async () => {
    setLaunching(true);
    try {
      let id = cloudMeetingId;
      if (!id) {
        const { meeting } = await syncMeetingToMia({
          title: meetingTitle,
          transcriptText,
          meetingType: template,
          summaryTemplate: template,
          summarize: true,
        });
        id = meeting.id;
        setCloudMeetingId(id);
      }
      await launchMiaSupercomputer(id);
      toast.success('Mission Supercomputer lancée');
    } catch (err: any) {
      toast.error(err?.message || 'Échec Supercomputer');
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="mx-4 mb-3 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-teal-900">M&IA cloud</p>
          <p className="text-xs text-teal-800/70 mt-0.5">
            Transcription locale · sync optionnelle vers résumé M&A / Supercomputer
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={stayLocal}
            onChange={(e) => setStayLocal(e.target.checked)}
          />
          <Shield className="w-3.5 h-3.5" />
          Rester 100 % local
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value as MeetingTemplateId)}
          disabled={stayLocal || syncing}
          className="text-sm border border-teal-200 rounded-lg px-2 py-1.5 bg-white"
        >
          {MEETING_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!canSync || syncing}
          onClick={handleSync}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-40"
        >
          {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
          Envoyer à M&IA
        </button>

        <button
          type="button"
          disabled={!canSync || launching}
          onClick={handleSupercomputer}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-40"
        >
          {launching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
          Lancer Supercomputer
        </button>

        {cloudMeetingId && (
          <span className="text-[11px] text-teal-700/80 truncate">ID cloud : {cloudMeetingId}</span>
        )}
      </div>
    </div>
  );
}
