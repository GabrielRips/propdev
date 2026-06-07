import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../data/contacts-data';

// ─── Types ────────────────────────────────────────────────────────────────────

type PhoneState = 'dialing' | 'connected' | 'transcribing' | 'summarized';

interface TranscriptLine {
  speaker: string;
  text: string;
}

interface CallSummary {
  durationLabel: string;
  transcript: TranscriptLine[];
  summary: string;
  reminders: string[];
  followUps: string[];
}

// ─── Mock call summary generator ─────────────────────────────────────────────

function generateCallSummary(contact: Contact): CallSummary {
  const firstName = contact.name.split(' ')[0];
  const role = (contact.role ?? '').toLowerCase();
  const org = contact.organisation.toLowerCase();

  if (role.includes('planning') || org.includes('council')) {
    return {
      durationLabel: '4 min 32 sec',
      transcript: [
        { speaker: 'You', text: `Hi ${firstName}, thanks for taking my call. I wanted to check on the status of our planning permit application.` },
        { speaker: firstName, text: "I've reviewed your submission. There are a couple of minor issues with the shadow diagrams that need to be addressed before we can progress." },
        { speaker: 'You', text: "Understood. Can you send the specific requirements in writing so our architect can revise them?" },
        { speaker: firstName, text: "Of course. I'll email you the referral requirements by end of week. Once revised drawings are submitted we're looking at a 4-week assessment window." },
        { speaker: 'You', text: "And regarding the neighbourhood notification period — has that concluded?" },
        { speaker: firstName, text: "Yes, it closed last Friday. We received two objections which will need to be addressed in your response to grounds." },
      ],
      summary: `${firstName} confirmed the planning permit application is under assessment. Shadow diagram revisions are required and will be detailed via email by end of week. Two objections were received during the notification period and must be addressed. A 4-week assessment window applies once revised drawings are submitted.`,
      reminders: [
        `Await written referral requirements from ${firstName} (due end of week)`,
        'Pass shadow diagram requirements to architect for revision',
        'Prepare response to the two objections received during notification',
      ],
      followUps: [
        'Submit revised shadow diagrams once architect updates are complete',
        `Call ${firstName} in 5 weeks to check assessment progress`,
        'Brief legal team on objection responses required',
      ],
    };
  }

  if (role.includes('architect') || role.includes('design') || role.includes('survey')) {
    return {
      durationLabel: '6 min 14 sec',
      transcript: [
        { speaker: 'You', text: `${firstName}, I wanted to touch base on the revised facade design — have you had a chance to review the council feedback?` },
        { speaker: firstName, text: "Yes, went through it this morning. The setback requirements are the main issue — we need to pull the upper levels back 600mm on the north elevation." },
        { speaker: 'You', text: "How will that affect the overall GFA?" },
        { speaker: firstName, text: "We'll lose roughly 18 sqm across the two upper floors. I can partially compensate by reconfiguring the internal layouts." },
        { speaker: 'You', text: "What's the timeline to get revised drawings to council?" },
        { speaker: firstName, text: "If you approve the approach today, I can have amended drawings ready in 10 business days." },
      ],
      summary: `${firstName} has reviewed council feedback on the facade design. A 600mm setback on the north elevation upper levels is required, resulting in approximately 18 sqm of GFA loss. Internal layout reconfiguration may partially offset this. Revised drawings can be ready in 10 business days pending approval of the approach.`,
      reminders: [
        `Approve the revised approach with ${firstName} to start the 10-business-day drawing clock`,
        'Assess financial impact of ~18 sqm GFA loss on project feasibility',
      ],
      followUps: [
        'Review and approve revised internal layout proposal',
        `Receive updated drawings from ${firstName} in 10 business days`,
        'Submit amended drawings to council with a cover letter addressing the setback changes',
      ],
    };
  }

  if (role.includes('construction') || role.includes('builder') || role.includes('contractor')) {
    return {
      durationLabel: '5 min 07 sec',
      transcript: [
        { speaker: 'You', text: `${firstName}, just calling to check on the slab pour scheduled for Thursday — are we still on track?` },
        { speaker: firstName, text: "We're on track but I need to flag one issue — the concrete supplier has a delivery delay. We're looking at a Friday pour instead." },
        { speaker: 'You', text: "That's a one-day slip. Will it affect the overall programme?" },
        { speaker: firstName, text: "No, we have float in the programme. The follow-on trades aren't mobilising until the following Tuesday so we're fine." },
        { speaker: 'You', text: "Good. And the framing subcontractor — are they confirmed for the week after?" },
        { speaker: firstName, text: "Yes, confirmed and locked in. I'll send you an updated programme by COB today." },
      ],
      summary: `${firstName} confirmed the slab pour has shifted from Thursday to Friday due to a concrete supplier delivery delay, but programme float means it won't affect downstream trades. Framing subcontractor is confirmed for the following week. An updated programme will be issued by end of day.`,
      reminders: [
        `Expect updated construction programme from ${firstName} by COB today`,
        'Confirm slab pour completion on Friday and notify project team',
      ],
      followUps: [
        'Review updated programme once received and flag to QS',
        'Check concrete delivery confirmation with site supervisor Friday morning',
        'Confirm framing subcontractor mobilisation date for following Tuesday',
      ],
    };
  }

  // Default: finance / legal / general
  return {
    durationLabel: '3 min 48 sec',
    transcript: [
      { speaker: 'You', text: `Hi ${firstName}, calling to follow up on the documentation for our construction loan drawdown.` },
      { speaker: firstName, text: "We're just waiting on the updated quantity surveyor report and the builder's progress claim." },
      { speaker: 'You', text: "The QS report should be ready by Thursday. The builder's claim was submitted last week — has it been received?" },
      { speaker: firstName, text: "Let me check... yes, it's here. Once the QS report arrives I'll process both and we should be able to release funds by next Tuesday." },
      { speaker: 'You', text: "Is there anything else needed for the file?" },
      { speaker: firstName, text: "Just make sure the updated insurance certificate of currency is included — the current one expires next month." },
    ],
    summary: `${firstName} confirmed they are awaiting the updated QS report (due Thursday) and have received the builder's progress claim. Funds should be released by next Tuesday once both documents are processed. An updated insurance certificate of currency is also required as the current one expires next month.`,
    reminders: [
      `Send QS report to ${firstName} by Thursday`,
      'Renew construction insurance — certificate of currency expiring next month',
    ],
    followUps: [
      `Confirm fund release with ${firstName} by next Tuesday`,
      'Obtain updated certificate of currency from insurer',
      'Notify builder of expected drawdown date once confirmed',
    ],
  };
}

// ─── Dialpad layout ───────────────────────────────────────────────────────────

const DIALPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

// ─── Component ────────────────────────────────────────────────────────────────

interface SoftPhoneModalProps {
  contact: Contact;
  allContacts: Contact[];
  onClose: () => void;
}

export default function SoftPhoneModal({ contact: initialContact, allContacts, onClose }: SoftPhoneModalProps) {
  const [contact, setContact] = useState(initialContact);
  const [phoneState, setPhoneState] = useState<PhoneState>('dialing');
  const [dtmf, setDtmf] = useState('');
  const [callSeconds, setCallSeconds] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [showDialpad, setShowDialpad] = useState(false);
  const [summary, setSummary] = useState<CallSummary | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-connect after 2.5s
  useEffect(() => {
    if (phoneState !== 'dialing') return;
    const t = setTimeout(() => setPhoneState('connected'), 2500);
    return () => clearTimeout(t);
  }, [phoneState, contact]);

  // Start/stop call timer
  useEffect(() => {
    if (phoneState !== 'connected') return;
    timerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phoneState]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function formatTime(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function handleEndCall() {
    if (phoneState === 'dialing') { onClose(); return; }
    if (timerRef.current) clearInterval(timerRef.current);
    setPhoneState('transcribing');
    setTimeout(() => {
      setSummary(generateCallSummary(contact));
      setPhoneState('summarized');
    }, 3200);
  }

  function selectContact(c: Contact) {
    setContact(c);
    setSearchQuery('');
    setCallSeconds(0);
    setDtmf('');
    setMuted(false);
    setSpeakerOn(false);
    setOnHold(false);
    setShowDialpad(false);
    setPhoneState('dialing');
  }

  const filteredContacts = searchQuery.trim()
    ? allContacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.organisation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const initials = contact.name.split(' ').map(n => n[0]).slice(0, 2).join('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Dialing / Connected ─────────────────────────────────────────── */}
        {(phoneState === 'dialing' || phoneState === 'connected') && (
          <div className="bg-gray-900 text-white flex flex-col">

            {/* Search bar */}
            <div className="px-4 pt-4 pb-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search contacts…"
                  className="w-full bg-gray-800 text-white text-sm placeholder-gray-500 pl-9 pr-3 py-2 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Search results */}
              {filteredContacts.length > 0 && (
                <div className="mt-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden max-h-44 overflow-y-auto">
                  {filteredContacts.slice(0, 6).map(c => (
                    <button
                      key={c.id}
                      onClick={() => selectContact(c)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-200">
                          {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.organisation}</p>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        <span className="text-xs text-gray-500">{c.phone}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contact info + status */}
            <div className="px-6 pt-4 pb-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-5">
                {phoneState === 'dialing' && (
                  <>
                    <div className="absolute rounded-full bg-green-500/20 animate-ping" style={{ inset: '-10px' }} />
                    <div className="absolute rounded-full bg-green-500/10 animate-ping" style={{ inset: '-20px', animationDelay: '0.3s' }} />
                  </>
                )}
                <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white ${phoneState === 'connected' ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {initials}
                </div>
              </div>

              <h2 className="text-xl font-semibold text-white">{contact.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{contact.role ?? contact.organisation}</p>
              <p className="text-xs text-gray-500 mt-0.5">{contact.phone}</p>

              {phoneState === 'dialing' ? (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">Calling</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${onHold ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${onHold ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`} />
                    {onHold ? 'On Hold' : formatTime(callSeconds)}
                  </span>
                </div>
              )}
            </div>

            {/* DTMF display */}
            {showDialpad && dtmf && (
              <div className="px-6 -mt-2 pb-2 text-center">
                <span className="text-xl font-mono text-white tracking-[0.3em]">{dtmf}</span>
              </div>
            )}

            {/* Dialpad */}
            {showDialpad && phoneState === 'connected' && (
              <div className="px-6 pb-4 grid grid-cols-3 gap-2">
                {DIALPAD_KEYS.flat().map(key => (
                  <button
                    key={key}
                    onClick={() => setDtmf(d => d + key)}
                    className="h-13 py-3 rounded-xl bg-gray-800 text-white font-medium text-base hover:bg-gray-700 active:scale-95 transition-all"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            {/* Controls (connected, dialpad hidden) */}
            {phoneState === 'connected' && !showDialpad && (
              <div className="px-6 pb-4 grid grid-cols-4 gap-2">
                {/* Mute */}
                <button
                  onClick={() => setMuted(m => !m)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors ${muted ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {muted ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    )}
                  </svg>
                  <span className="text-xs">{muted ? 'Unmute' : 'Mute'}</span>
                </button>
                {/* Dialpad */}
                <button
                  onClick={() => setShowDialpad(true)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  <span className="text-xs">Dialpad</span>
                </button>
                {/* Speaker */}
                <button
                  onClick={() => setSpeakerOn(s => !s)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors ${speakerOn ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  <svg className="w-5 h-5" fill={speakerOn ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  <span className="text-xs">Speaker</span>
                </button>
                {/* Hold */}
                <button
                  onClick={() => setOnHold(h => !h)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors ${onHold ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  <svg className="w-5 h-5" fill={onHold ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                  </svg>
                  <span className="text-xs">{onHold ? 'Resume' : 'Hold'}</span>
                </button>
              </div>
            )}

            {/* Dialpad back button */}
            {showDialpad && (
              <div className="px-6 pb-3 flex justify-center">
                <button
                  onClick={() => setShowDialpad(false)}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  ← Back to controls
                </button>
              </div>
            )}

            {/* End call button */}
            <div className="px-6 pb-8 flex justify-center">
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all"
                title="End call"
              >
                <svg className="w-7 h-7 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1.5 8.25c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v1.5" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Transcribing ────────────────────────────────────────────────── */}
        {phoneState === 'transcribing' && (
          <div className="bg-gray-900 text-white py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-white">Processing call</h3>
              <p className="text-sm text-gray-400 mt-1">Transcribing · Analysing · Detecting actions</p>
            </div>
            {/* Progress dots */}
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {phoneState === 'summarized' && summary && (
          <div className="bg-white flex flex-col" style={{ maxHeight: '88vh' }}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">Call Summary</h2>
                </div>
                <p className="text-xs text-gray-400">{contact.name} · {contact.organisation} · {summary.durationLabel}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

              {/* AI Summary */}
              <div>
                <SectionHeader icon="sparkle" label="AI Summary" color="purple" />
                <p className="text-sm text-gray-700 leading-relaxed bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                  {summary.summary}
                </p>
              </div>

              {/* Reminders */}
              <div>
                <SectionHeader icon="bell" label="Reminders" color="amber" />
                <ul className="space-y-2">
                  {summary.reminders.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-amber-700">{i + 1}</span>
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up Actions */}
              <div>
                <SectionHeader icon="check" label="Follow-up Actions" color="blue" />
                <ul className="space-y-2">
                  {summary.followUps.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Transcript */}
              <div>
                <SectionHeader icon="chat" label="Transcript" color="gray" />
                <div className="space-y-3 border border-gray-100 rounded-xl px-4 py-3">
                  {summary.transcript.map((line, i) => {
                    const isMe = line.speaker === 'You';
                    return (
                      <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-xs font-semibold ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {line.speaker[0]}
                        </div>
                        <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <p className={`text-xs text-gray-400 mb-0.5 ${isMe ? 'text-right' : 'text-left'}`}>{line.speaker}</p>
                          <div className={`text-sm leading-relaxed px-3 py-2 rounded-xl ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {line.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Save to Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Small helper for section headers ────────────────────────────────────────

function SectionHeader({ icon, label, color }: { icon: 'sparkle' | 'bell' | 'check' | 'chat'; label: string; color: 'purple' | 'amber' | 'blue' | 'gray' }) {
  const bg: Record<string, string> = {
    purple: 'bg-purple-100',
    amber: 'bg-amber-100',
    blue: 'bg-blue-100',
    gray: 'bg-gray-100',
  };
  const fg: Record<string, string> = {
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    gray: 'text-gray-500',
  };
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-5 h-5 rounded-full ${bg[color]} flex items-center justify-center`}>
        {icon === 'sparkle' && (
          <svg className={`w-3 h-3 ${fg[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
        {icon === 'bell' && (
          <svg className={`w-3 h-3 ${fg[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        )}
        {icon === 'check' && (
          <svg className={`w-3 h-3 ${fg[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === 'chat' && (
          <svg className={`w-3 h-3 ${fg[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
      </div>
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</h3>
    </div>
  );
}
