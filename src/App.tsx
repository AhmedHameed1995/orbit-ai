import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowUpRight, Bot, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronRight, Clipboard, Clock3, Copy, FileText, Filter, FolderClosed, Gauge,
  Highlighter, LayoutGrid, Link2, ListFilter, MessageSquareText, MoreHorizontal,
  Pause, Play, PlayCircle, Plus, Radio, Search, Send, Settings, Share2, Sparkles,
  Star, Users, WandSparkles, X,
} from 'lucide-react';

type Person = { name: string; role: string; color: string; initials: string; talk: number };
type Segment = { at: number; speaker: string; text: string; key?: boolean };
type Action = { id: number; text: string; owner: string; at: number; done?: boolean };
type Meeting = {
  id: string; title: string; company: string; date: string; time: string; duration: number;
  type: string; people: Person[]; preview: string; sentiment: string; starred?: boolean;
};

const people: Person[] = [
  { name: 'Ahmed Chen', role: 'VP Product · Northstar', initials: 'AC', color: '#b999ff', talk: 24 },
  { name: 'Noah Williams', role: 'Engineering Lead · Northstar', initials: 'NW', color: '#59c7f0', talk: 19 },
  { name: 'Priya Shah', role: 'Design Director · Northstar', initials: 'PS', color: '#ffb35c', talk: 15 },
  { name: 'Leo Martinez', role: 'Customer Success · Northstar', initials: 'LM', color: '#80dca8', talk: 13 },
  { name: 'Sofia Kim', role: 'COO · Atlas Labs', initials: 'SK', color: '#ff88a9', talk: 11 },
  { name: 'Ethan Brooks', role: 'IT Director · Atlas Labs', initials: 'EB', color: '#7eb0ff', talk: 8 },
  { name: 'Amara Okafor', role: 'Operations · Atlas Labs', initials: 'AO', color: '#f0d26a', talk: 6 },
  { name: 'Jon Bell', role: 'Security · Atlas Labs', initials: 'JB', color: '#d19cff', talk: 4 },
];

const meetings: Meeting[] = [
  { id: 'atlas-q3', title: 'Atlas Labs · Q3 implementation review', company: 'Atlas Labs', date: 'Today', time: '10:00 AM', duration: 3728, type: 'Customer success', people, preview: 'Launch remains on track for October 14. Security review is the only critical dependency.', sentiment: 'Positive', starred: true },
  { id: 'weekly-product', title: 'Weekly product & design sync', company: 'Northstar', date: 'Yesterday', time: '2:30 PM', duration: 2864, type: 'Project update', people: people.slice(0, 5), preview: 'Aligned on the activation redesign, experiment guardrails, and research plan for next week.', sentiment: 'Aligned' },
  { id: 'helio-discovery', title: 'Helio · Discovery call', company: 'Helio Systems', date: 'Sep 11', time: '4:00 PM', duration: 1938, type: 'Sales', people: people.slice(2, 6), preview: 'Helio needs SSO and audit-log coverage before their procurement review in November.', sentiment: 'Promising' },
  { id: 'ahmed-one-one', title: 'Ahmed / Noah 1:1', company: 'Northstar', date: 'Sep 10', time: '11:30 AM', duration: 2441, type: 'One-on-one', people: people.slice(0, 2), preview: 'Discussed team load, staff engineer hiring, and ownership for the reliability roadmap.', sentiment: 'Candid' },
  { id: 'q4-kickoff', title: 'Q4 launch kickoff', company: 'Northstar', date: 'Sep 8', time: '9:00 AM', duration: 3295, type: 'Project kick-off', people: people.slice(0, 7), preview: 'Defined launch outcomes, workstream owners, and a weekly risk review through general availability.', sentiment: 'Focused' },
  { id: 'redwood-retro', title: 'Redwood migration retrospective', company: 'Redwood Health', date: 'Sep 4', time: '3:00 PM', duration: 3140, type: 'Retrospective', people: people.slice(1, 8), preview: 'The phased rollout worked; earlier sandbox access would have prevented the final integration crunch.', sentiment: 'Constructive' },
];

const transcript: Segment[] = [
  { at: 12, speaker: 'Ahmed Chen', text: 'Thanks, everyone. The goal today is to leave with confidence on the October launch and make every remaining dependency explicit.' },
  { at: 58, speaker: 'Sofia Kim', text: 'From our side, adoption looks healthy. Operations has 42 pilot users active, and the weekly completion rate moved from 61 to 78 percent.' },
  { at: 174, speaker: 'Leo Martinez', text: 'That matches what we see. The strongest behavior is teams returning to the same workspace, not just completing onboarding once.' },
  { at: 318, speaker: 'Priya Shah', text: 'The mobile handoff is still the rough edge. We can simplify the last confirmation step without changing the October scope.' },
  { at: 438, speaker: 'Ethan Brooks', text: 'SSO is validated in staging. I need the final SCIM mapping and the security package before we can sign production access.' },
  { at: 612, speaker: 'Jon Bell', text: 'I have one open item: evidence for the ninety-day audit log retention. If that lands by Thursday, security review stays on schedule.', key: true },
  { at: 791, speaker: 'Noah Williams', text: 'We can deliver the retention export tomorrow. The implementation is already live behind the Atlas flag; it only needs the evidence bundle.' },
  { at: 968, speaker: 'Amara Okafor', text: 'Training is booked for October 7 and 9. Can we make the second session a recording for people in APAC?' },
  { at: 1124, speaker: 'Ahmed Chen', text: 'Yes. Leo will own the recording and a short admin guide. Let’s also create a two-minute setup clip instead of sending a long document.' },
  { at: 1355, speaker: 'Sofia Kim', text: 'That would help. The champion group is confident, but managers want a clearer way to see adoption without asking us for exports.' },
  { at: 1576, speaker: 'Priya Shah', text: 'The new workspace health panel solves most of that. I’ll share the interactive prototype today and collect feedback async.' },
  { at: 1812, speaker: 'Ethan Brooks', text: 'For provisioning, the last decision is whether contractors live in a separate group. I will confirm that with identity by Friday.' },
  { at: 2094, speaker: 'Noah Williams', text: 'Either model works technically. Separate groups give you cleaner policy boundaries, so that is our recommendation.' },
  { at: 2368, speaker: 'Sofia Kim', text: 'Let’s take that recommendation. The broader question is launch support—what happens if a region hits an issue in its first shift?' },
  { at: 2591, speaker: 'Leo Martinez', text: 'We will run a shared launch channel for the first week, with a named support lead in US and EU hours and a four-hour response target.', key: true },
  { at: 2910, speaker: 'Amara Okafor', text: 'Perfect. I’ll publish the escalation tree with regional leads once you send the channel details.' },
  { at: 3248, speaker: 'Ahmed Chen', text: 'I’m hearing one critical path—security evidence by Thursday—and three follow-ups that do not threaten the date.' },
  { at: 3556, speaker: 'Jon Bell', text: 'Correct. Assuming the evidence matches what we reviewed, I can return final approval by Monday afternoon.' },
  { at: 3692, speaker: 'Sofia Kim', text: 'Great. October 14 stays the date. Thanks all—this is the clearest the plan has felt.' },
];

const initialActions: Action[] = [
  { id: 1, text: 'Send audit-log retention evidence bundle', owner: 'Noah', at: 791 },
  { id: 2, text: 'Share workspace health prototype with Atlas', owner: 'Priya', at: 1576 },
  { id: 3, text: 'Confirm contractor provisioning group', owner: 'Ethan', at: 1812 },
  { id: 4, text: 'Create APAC training recording + admin guide', owner: 'Leo', at: 1124 },
  { id: 5, text: 'Publish launch escalation tree', owner: 'Amara', at: 2910 },
];

const summaries: Record<string, { intro: string; sections: { title: string; bullets: string[] }[] }> = {
  'General': {
    intro: 'Atlas Labs and Northstar confirmed the October 14 launch remains on track, with security evidence as the only critical dependency.',
    sections: [
      { title: 'Key takeaways', bullets: ['Pilot adoption rose to 78% weekly completion across 42 active users.', 'SSO is validated; production access depends on the final audit-log evidence package.', 'Training is scheduled for October 7 and 9, with an APAC-friendly recording to follow.'] },
      { title: 'Decisions', bullets: ['Keep October 14 as the launch date.', 'Use a separate identity group for contractors.', 'Run a shared launch-support channel with regional coverage and a four-hour response target.'] },
      { title: 'Risks', bullets: ['Security approval could move the schedule if retention evidence is not delivered by Thursday.', 'Mobile confirmation remains a friction point, but is contained within current scope.'] },
    ],
  },
  'Customer success': {
    intro: 'Atlas is showing strong early adoption and is ready to move from pilot to a supported company rollout.',
    sections: [
      { title: 'Customer health', bullets: ['Positive: weekly completion increased 17 points.', 'Champions are confident; managers need self-serve adoption visibility.', 'No commercial or stakeholder blocker was raised.'] },
      { title: 'Customer goals', bullets: ['Launch company-wide on October 14.', 'Give APAC teams asynchronous enablement.', 'Establish a clear first-week escalation path.'] },
      { title: 'Follow-up plan', bullets: ['Deliver security evidence by Thursday.', 'Share the workspace health prototype today.', 'Publish training recording and escalation tree before launch.'] },
    ],
  },
  'Executive brief': {
    intro: 'Status: on track. Confidence is high, adoption is improving, and one security deliverable gates final approval.',
    sections: [
      { title: 'What matters', bullets: ['October 14 launch date reaffirmed.', '78% weekly completion in the 42-user pilot.', 'Security decision expected Monday if evidence arrives Thursday.'] },
      { title: 'Leadership ask', bullets: ['No escalation needed today.', 'Protect engineering time for the evidence bundle and launch-week support.'] },
    ],
  },
};

const fmt = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const personFor = (name: string) => people.find((p) => p.name === name) || people[0];

const copyText = async (text: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* blocked or unavailable; fall through to the legacy path */ }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch { return false; }
};

function Avatar({ person, small = false }: { person: Person; small?: boolean }) {
  return <span className={`avatar ${small ? 'small' : ''}`} style={{ background: `${person.color}22`, color: person.color, borderColor: `${person.color}55` }}>{person.initials}</span>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span className="logo-mark"><i /><i /><i /></span>{!compact && <span>ORBIT</span>}</div>;
}

function App() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [activeMeeting, setActiveMeeting] = useState(meetings[0]);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareMode, setShareMode] = useState(() => new URLSearchParams(location.search).has('share'));

  const openMeeting = (meeting: Meeting) => { setActiveMeeting(meeting); setView('detail'); window.scrollTo(0, 0); };
  if (shareMode) return <PublicShare onExit={() => { history.replaceState({}, '', location.pathname); setShareMode(false); }} />;

  return (
    <div className="app-shell">
      <Sidebar view={view} onHome={() => setView('list')} />
      <main className="main">
        <Topbar onSearch={() => setSearchOpen(true)} />
        {view === 'list' ? <MeetingList onOpen={openMeeting} query={query} setQuery={setQuery} /> : <MeetingDetail meeting={activeMeeting} onBack={() => setView('list')} />}
      </main>
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} onOpen={(m) => { openMeeting(m); setSearchOpen(false); }} />}
    </div>
  );
}

function Sidebar({ view, onHome }: { view: string; onHome: () => void }) {
  const nav = [
    { label: 'My meetings', icon: LayoutGrid, active: view === 'list' },
    { label: 'Team library', icon: Users }, { label: 'Clips', icon: PlayCircle, count: 6 },
    { label: 'Playlists', icon: FolderClosed }, { label: 'Trackers', icon: Radio, badge: 'BETA' },
  ];
  return <aside className="sidebar">
    <Logo />
    <button className="capture-btn"><Plus size={17} /> Capture meeting</button>
    <nav>{nav.map((item) => <button key={item.label} className={item.active ? 'active' : ''} onClick={item.label === 'My meetings' ? onHome : undefined}><item.icon size={18} /><span>{item.label}</span>{item.count && <b>{item.count}</b>}{item.badge && <em>{item.badge}</em>}</button>)}</nav>
    <div className="sidebar-bottom">
      <div className="usage"><div><Sparkles size={15} /> AI minutes</div><strong>214 <span>/ 300</span></strong><div className="meter"><i /></div><small>Resets in 12 days</small></div>
      <button><Settings size={18} /><span>Settings</span></button>
      <div className="user-row"><Avatar person={people[0]} small /><div><strong>Ahmed Chen</strong><small>Northstar Labs</small></div><MoreHorizontal size={18} /></div>
    </div>
  </aside>;
}

function Topbar({ onSearch }: { onSearch: () => void }) {
  return <header className="topbar">
    <button className="global-search" onClick={onSearch}><Search size={17} /><span>Search meetings, people, or moments…</span><kbd>⌘ K</kbd></button>
    <button className="icon-button"><CalendarDays size={19} /></button>
    <button className="invite"><Users size={17} /> Invite team</button>
  </header>;
}

function MeetingList({ onOpen, query, setQuery }: { onOpen: (m: Meeting) => void; query: string; setQuery: (q: string) => void }) {
  const [filter, setFilter] = useState('All meetings');
  const filtered = meetings.filter((m) => `${m.title} ${m.company} ${m.preview} ${m.type}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All meetings' || m.type === filter));
  return <div className="page list-page">
    <section className="welcome">
      <div><p className="eyebrow">MONDAY, SEPTEMBER 14</p><h1>Good morning, Ahmed.</h1><p>Here’s what your conversations are moving forward.</p></div>
      <div className="pulse-card"><span><WandSparkles size={17} /> This week</span><strong>11 meetings</strong><p>4h 38m captured · 17 actions found</p></div>
    </section>
    <section className="insight-strip">
      <div className="insight-icon"><Sparkles size={20} /></div><div><span>Across your meetings</span><strong>Security review is the most repeated launch risk this week.</strong></div>
      <button onClick={() => onOpen(meetings[0])}>See the moments <ArrowUpRight size={16} /></button>
    </section>
    <section className="list-controls">
      <div><h2>Meetings</h2><span>{filtered.length} conversations</span></div>
      <div className="control-actions"><label><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter meetings" /></label><button><ListFilter size={16} /> Sort</button></div>
    </section>
    <div className="filter-row">{['All meetings', 'Customer success', 'Sales', 'Project update', 'One-on-one'].map((f) => <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
    <section className="meeting-grid">
      {filtered.map((m, index) => <article className={`meeting-card ${index === 0 ? 'featured' : ''}`} key={m.id} onClick={() => onOpen(m)}>
        <div className="card-top"><span className="type-pill">{m.type}</span>{m.starred ? <Star size={17} fill="#f1c75b" color="#f1c75b" /> : <MoreHorizontal size={18} />}</div>
        <h3>{m.title}</h3><p>{m.preview}</p>
        <div className="mini-meta"><span><CalendarDays size={14} /> {m.date} · {m.time}</span><span><Clock3 size={14} /> {fmt(m.duration)}</span></div>
        <div className="card-foot"><div className="avatar-stack">{m.people.slice(0, 4).map((p) => <Avatar key={p.name} person={p} small />)}{m.people.length > 4 && <span className="more-people">+{m.people.length - 4}</span>}</div><span className="sentiment"><i /> {m.sentiment}</span><ChevronRight size={18} /></div>
      </article>)}
      {!filtered.length && <div className="empty"><Search size={28} /><h3>No conversations match</h3><p>Try a person, company, topic, or another filter.</p></div>}
    </section>
  </div>;
}

function MeetingDetail({ meeting, onBack }: { meeting: Meeting; onBack: () => void }) {
  const [tab, setTab] = useState<'Summary' | 'Transcript' | 'Ask Orbit'>('Summary');
  const [template, setTemplate] = useState('General');
  const [current, setCurrent] = useState(612);
  const [playing, setPlaying] = useState(false);
  const [actions, setActions] = useState(initialActions);
  const [clips, setClips] = useState([{ id: 1, at: 612, title: 'Security review stays on schedule', length: 48 }]);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState('');
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setCurrent((value) => value >= meeting.duration ? 0 : value + 1), 1000);
    return () => clearInterval(timer);
  }, [playing, meeting.duration]);

  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(''), 1800); };
  const seek = (at: number) => { setCurrent(at); notify(`Jumped to ${fmt(at)}`); };
  const addClip = (segment: Segment) => { if (!clips.some((c) => c.at === segment.at)) setClips((list) => [...list, { id: Date.now(), at: segment.at, title: segment.text.split('. ')[0], length: 36 }]); notify('Moment saved as a clip'); };

  return <div className="detail-page">
    <div className="detail-head">
      <button className="back" onClick={onBack}><ArrowLeft size={18} /> Meetings</button>
      <div className="detail-title"><div><span className="type-pill">{meeting.type}</span><h1>{meeting.title}</h1><p>{meeting.date} · {meeting.time} · {fmt(meeting.duration)} · {meeting.people.length} people</p></div>
        <div className="head-actions"><button><MoreHorizontal size={18} /></button><button className="share-button" onClick={() => setShareOpen(true)}><Share2 size={17} /> Share</button></div></div>
    </div>
    <div className="detail-layout">
      <section className="content-column">
        <div className="video-card">
          <div className="video-stage">
            <div className="video-grid">{meeting.people.slice(0, 8).map((p) => <div key={p.name} style={{ '--person': p.color } as React.CSSProperties}><span>{p.initials}</span><small>{p.name}</small></div>)}</div>
            <div className="recording-pill"><i /> RECORDED MEETING</div>
          </div>
          <div className="player"><button onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><span>{fmt(current)}</span><input aria-label="Playback position" type="range" min="0" max={meeting.duration} value={current} onChange={(e) => setCurrent(Number(e.target.value))} /><span>{fmt(meeting.duration)}</span><button className="speed">1×</button></div>
        </div>
        <div className="tabs">{(['Summary', 'Transcript', 'Ask Orbit'] as const).map((name) => <button key={name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>{name === 'Ask Orbit' && <Sparkles size={15} />}{name}</button>)}</div>
        {tab === 'Summary' && <Summary template={template} setTemplate={setTemplate} seek={seek} notify={notify} />}
        {tab === 'Transcript' && <Transcript current={current} seek={seek} addClip={addClip} containerRef={transcriptRef} notify={notify} />}
        {tab === 'Ask Orbit' && <AskPanel seek={seek} />}
      </section>
      <aside className="right-rail">
        <PeoplePanel people={meeting.people} />
        <ActionPanel actions={actions} setActions={setActions} seek={seek} people={meeting.people} current={current} notify={notify} />
        <ClipsPanel clips={clips} seek={seek} />
      </aside>
    </div>
    {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
    {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
  </div>;
}

function Summary({ template, setTemplate, seek, notify }: { template: string; setTemplate: (v: string) => void; seek: (n: number) => void; notify: (m: string) => void }) {
  const data = summaries[template];
  const copySummary = async () => {
    const body = [
      `${template} summary`,
      '',
      data.intro,
      '',
      ...data.sections.flatMap((section) => [section.title, ...section.bullets.map((b) => `- ${b}`), '']),
    ].join('\n').trim();
    notify(await copyText(body) ? 'Summary copied to clipboard' : 'Your browser blocked the copy');
  };
  return <div className="tab-panel summary-panel">
    <div className="panel-toolbar"><div className="select-wrap"><Sparkles size={16} /><select value={template} onChange={(e) => setTemplate(e.target.value)}>{Object.keys(summaries).map((t) => <option key={t}>{t}</option>)}</select><ChevronDown size={15} /></div><button onClick={copySummary}><Copy size={15} /> Copy summary</button></div>
    <div className="summary-intro"><span>AI SUMMARY</span><p>{data.intro}</p></div>
    {data.sections.map((section, sIndex) => <section className="summary-section" key={section.title}><h3>{section.title}</h3><ul>{section.bullets.map((bullet, index) => <li key={bullet}><span>{bullet}</span>{(sIndex + index) % 2 === 0 && <button onClick={() => seek([612, 1576, 2591][(sIndex + index) % 3])}><Play size={11} fill="currentColor" /> {fmt([612, 1576, 2591][(sIndex + index) % 3])}</button>}</li>)}</ul></section>)}
  </div>;
}

function Transcript({ current, seek, addClip, containerRef, notify }: { current: number; seek: (n: number) => void; addClip: (s: Segment) => void; containerRef: React.RefObject<HTMLDivElement | null>; notify: (m: string) => void }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const visible = term ? transcript.filter((s) => s.text.toLowerCase().includes(term) || s.speaker.toLowerCase().includes(term)) : transcript;
  const copyTranscript = async () => {
    const body = visible.map((segment) => `${fmt(segment.at)}  ${segment.speaker}: ${segment.text}`).join('\n');
    notify(await copyText(body) ? `${term ? visible.length + ' matching lines' : 'Transcript'} copied to clipboard` : 'Your browser blocked the copy');
  };
  return <div className="tab-panel transcript-panel" ref={containerRef}>
    <div className="panel-toolbar"><label><Search size={15} /><input placeholder="Search this transcript" value={query} onChange={(e) => setQuery(e.target.value)} />{term && <button className="clear-search" title="Clear search" onClick={() => setQuery('')}><X size={13} /></button>}</label>{term && <span className="filter-count">{visible.length} of {transcript.length}</span>}<button onClick={copyTranscript}><Clipboard size={15} /> Copy transcript</button></div>
    <div className="transcript-list">{visible.map((segment) => { const p = personFor(segment.speaker); const active = current >= segment.at && current < segment.at + 90; return <div key={segment.at} className={`segment ${active ? 'active' : ''}`} onClick={() => seek(segment.at)}><button className="add-highlight" title="Save this moment" onClick={(e) => { e.stopPropagation(); addClip(segment); }}><Plus size={14} /></button><Avatar person={p} small /><div><div className="segment-meta"><strong>{segment.speaker}</strong><button>{fmt(segment.at)}</button>{segment.key && <span><Highlighter size={11} /> Key moment</span>}</div><p>{segment.text}</p></div></div>; })}{term && !visible.length && <p className="panel-empty">No lines match “{query}”.</p>}</div>
  </div>;
}

function AskPanel({ seek }: { seek: (n: number) => void }) {
  const [asked, setAsked] = useState(false);
  return <div className="tab-panel ask-panel"><div className="ask-hero"><div><Bot size={24} /></div><h2>Ask this meeting anything</h2><p>Answers stay grounded in the transcript and link back to the exact moment.</p></div>
    {!asked ? <><div className="prompt-grid">{['What could delay the launch?', 'Draft a concise follow-up email', 'What did Atlas commit to?', 'Summarize this for my manager'].map((p) => <button key={p} onClick={() => setAsked(true)}>{p}<ArrowUpRight size={14} /></button>)}</div><div className="ask-input"><input placeholder="Ask about this conversation…" /><button onClick={() => setAsked(true)}><Send size={16} /></button></div></> : <div className="answer"><span><Sparkles size={15} /> ORBIT</span><p>The only launch-critical risk is Atlas’s security approval. Noah will send the 90-day audit-log retention evidence by Thursday; Jon expects to return final approval Monday if it matches the reviewed implementation.</p><button onClick={() => seek(612)}><Play size={12} fill="currentColor" /> Evidence at 10:12</button><div className="ask-input"><input placeholder="Ask a follow-up…" /><button><Send size={16} /></button></div></div>}
  </div>;
}

function PeoplePanel({ people: list }: { people: Person[] }) {
  const [expanded, setExpanded] = useState(false);
  return <section className="rail-card people-card"><div className="rail-title"><h3>People <span>{list.length}</span></h3><button onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide' : 'View all'}</button></div><div className="company-split"><div><i style={{ width: '63%' }} /><span>Northstar 63%</span></div><div><i style={{ width: '37%' }} /><span>Atlas 37%</span></div></div>{(expanded ? list : list.slice(0, 4)).map((p) => <div className="person-row" key={p.name}><Avatar person={p} small /><div><strong>{p.name}</strong><small>{p.role}</small></div><span>{p.talk}%</span></div>)}</section>;
}

function ActionPanel({ actions, setActions, seek, people: list, current, notify }: { actions: Action[]; setActions: (a: Action[]) => void; seek: (n: number) => void; people: Person[]; current: number; notify: (m: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [owner, setOwner] = useState(list[0].name.split(' ')[0]);
  const toggle = (id: number) => setActions(actions.map((a) => a.id === id ? { ...a, done: !a.done } : a));
  const cancel = () => { setAdding(false); setDraft(''); };
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setActions([...actions, { id: Date.now(), text, owner, at: current }]);
    cancel();
    notify(`Action item assigned to ${owner}`);
  };
  const copyActions = async () => {
    const body = actions.map((a) => `[${a.done ? 'x' : ' '}] ${a.text} — ${a.owner} (${fmt(a.at)})`).join('\n');
    notify(await copyText(body) ? 'Action items copied to clipboard' : 'Your browser blocked the copy');
  };
  return <section className="rail-card"><div className="rail-title"><h3>Action items <span>{actions.filter((a) => !a.done).length}</span></h3><button title="Copy action items" onClick={copyActions}><Copy size={14} /></button></div><div className="action-list">{actions.map((a) => <div className={`action ${a.done ? 'done' : ''}`} key={a.id}><button className="check" onClick={() => toggle(a.id)}>{a.done && <Check size={13} />}</button><div><p>{a.text}</p><span><b>{a.owner}</b><button onClick={() => seek(a.at)}><Play size={9} fill="currentColor" /> {fmt(a.at)}</button></span></div></div>)}</div>{adding
    ? <div className="action-compose"><input autoFocus value={draft} placeholder="What needs to happen?" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel(); }} /><div><select value={owner} onChange={(e) => setOwner(e.target.value)}>{list.map((p) => <option key={p.name}>{p.name.split(' ')[0]}</option>)}</select><span>at {fmt(current)}</span><button className="compose-add" onClick={submit}>Add</button><button className="compose-cancel" onClick={cancel}><X size={13} /></button></div></div>
    : <button className="add-action" onClick={() => setAdding(true)}><Plus size={14} /> Add action item</button>}</section>;
}

function ClipsPanel({ clips, seek }: { clips: { id: number; at: number; title: string; length: number }[]; seek: (n: number) => void }) {
  return <section className="rail-card"><div className="rail-title"><h3>Saved moments <span>{clips.length}</span></h3></div>{clips.map((clip) => <button className="clip" key={clip.id} onClick={() => seek(clip.at)}><span className="clip-play"><Play size={13} fill="currentColor" /></span><div><strong>{clip.title}</strong><small>{fmt(clip.at)} · {clip.length}s clip</small></div><Share2 size={14} /></button>)}<p className="clip-hint"><Highlighter size={14} /> Hover a transcript line and press + to save a moment.</p></section>;
}

function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState('Anyone with the link');
  const url = `${location.origin}${location.pathname}?share=atlas-q3`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); } catch { /* clipboard can be unavailable in preview */ } setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="modal-icon"><Share2 size={19} /></span><div><h2>Share this meeting</h2><p>Choose what people can see.</p></div></div><button onClick={onClose}><X size={18} /></button></div><label className="access-select"><span>Link access</span><select value={access} onChange={(e) => setAccess(e.target.value)}><option>Anyone with the link</option><option>Anyone at Northstar</option><option>Only people added</option></select></label><div className="share-preview"><CheckCircle2 size={18} /><div><strong>No sign-in required</strong><p>Viewers can watch the recording, read the summary, and follow the transcript.</p></div></div><div className="copy-row"><code>{url}</code><button onClick={copy}>{copied ? <Check size={16} /> : <Link2 size={16} />}{copied ? 'Copied' : 'Copy link'}</button></div><div className="modal-foot"><span><Users size={15} /> 3 people already have access</span><button onClick={onClose}>Done</button></div></div></div>;
}

function SearchPalette({ onClose, onOpen }: { onClose: () => void; onOpen: (m: Meeting) => void }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q) return meetings.slice(0, 4);
    const needle = q.toLowerCase();
    return meetings.filter((m) => `${m.title} ${m.company} ${m.preview}`.toLowerCase().includes(needle) || transcript.some((s) => s.text.toLowerCase().includes(needle))).slice(0, 5);
  }, [q]);
  return <div className="modal-backdrop search-backdrop" onMouseDown={onClose}><div className="search-palette" onMouseDown={(e) => e.stopPropagation()}><div className="palette-input"><Search size={20} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search every conversation…" /><kbd>ESC</kbd></div>{q && <div className="ai-search"><Sparkles size={16} /><span>Ask Orbit: “{q}” across all meetings</span><ChevronRight size={16} /></div>}<div className="results-label">{q ? `${results.length} matching conversations` : 'Recent conversations'}</div>{results.map((m) => <button className="search-result" key={m.id} onClick={() => onOpen(m)}><span className="result-icon"><FileText size={17} /></span><div><strong>{m.title}</strong><p>{q && q.toLowerCase().includes('security') ? '“Security review is the only critical dependency…”' : m.preview}</p><small>{m.date} · {m.type}</small></div><ChevronRight size={17} /></button>)}</div></div>;
}

function PublicShare({ onExit }: { onExit: () => void }) {
  const [current, setCurrent] = useState(612);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (!playing) return; const t = setInterval(() => setCurrent((v) => v + 1), 1000); return () => clearInterval(t); }, [playing]);
  return <div className="public-page"><header><Logo /><span>Shared by Ahmed Chen at Northstar</span><button onClick={onExit}>Open workspace <ArrowUpRight size={15} /></button></header><main><div className="public-title"><span className="type-pill">Customer success</span><h1>Atlas Labs · Q3 implementation review</h1><p>September 14, 2026 · 1:02:08 · 8 people</p></div><div className="public-grid"><div><div className="video-card public-video"><div className="video-stage"><div className="video-grid">{people.map((p) => <div key={p.name} style={{ '--person': p.color } as React.CSSProperties}><span>{p.initials}</span><small>{p.name}</small></div>)}</div></div><div className="player"><button onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}</button><span>{fmt(current)}</span><input type="range" min="0" max="3728" value={current} onChange={(e) => setCurrent(Number(e.target.value))} /><span>1:02:08</span></div></div><div className="public-summary"><span>AI SUMMARY</span><h2>Launch stays on track for October 14</h2><p>Atlas and Northstar aligned on rollout readiness, training, and first-week support. The final security evidence bundle is the only critical dependency.</p><div className="public-points"><div><CheckCircle2 size={17} /><span>Pilot weekly completion reached <strong>78%</strong>.</span></div><div><CheckCircle2 size={17} /><span>SSO is validated in staging.</span></div><div><Gauge size={17} /><span>Final security approval expected Monday.</span></div></div></div></div><aside><h3>Key moments</h3>{[{ at: 612, title: 'Security timeline confirmed' }, { at: 1576, title: 'Adoption visibility prototype' }, { at: 2591, title: 'Launch support plan' }].map((x) => <button key={x.at} onClick={() => setCurrent(x.at)}><span><Play size={13} fill="currentColor" /></span><div><strong>{x.title}</strong><small>{fmt(x.at)}</small></div></button>)}<div className="shared-note"><Sparkles size={16} /><p>This is a shared Orbit recording. No account is required to view it.</p></div></aside></div></main></div>;
}

export default App;
