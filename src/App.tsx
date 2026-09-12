import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Check, Cloud, FileText, Image, LogOut, Menu, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabaseConfig, supabase } from './lib/supabase'

type Note = { id: string; category: string | null; created_at: string; updated_at: string; title: string; content: string; user_id?: string | null }
type NoteForm = { title: string; category: string; content: string }
type View = 'home' | 'list' | 'detail' | 'form'
type AuthMode = 'login' | 'forgot'
const emptyForm: NoteForm = { title: '', category: '일상', content: '' }
const quickItems = [{ icon: Image, label: '사진', count: '준비 중', color: 'coral' }, { icon: FileText, label: '메모', count: 'Notes', color: 'blue' }, { icon: BookOpen, label: '기억', count: '준비 중', color: 'gold' }]

function formatDate(value: string) { return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) }

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [view, setView] = useState<View>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [form, setForm] = useState<NoteForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [connection, setConnection] = useState<'checking' | 'connected' | 'error' | 'needs-config'>('checking')

  useEffect(() => {
    if (!supabase || !hasSupabaseConfig) { setConnection('needs-config'); setAuthReady(true); return }
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setAuthReady(true); if (!nextSession) { setNotes([]); setView('home') } })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (session) void loadNotes() }, [session])

  async function loadNotes() {
    if (!supabase || !session) return
    setLoading(true)
    const { data, error } = await supabase.from('notes').select('id, category, created_at, updated_at, title, content, user_id').eq('user_id', session.user.id).order('updated_at', { ascending: false })
    if (error) { setConnection('error'); setMessage(error.message) } else { setConnection('connected'); setNotes((data ?? []) as Note[]) }
    setLoading(false)
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return 'Supabase 환경변수가 설정되지 않았습니다.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? ''
  }

  function openNew() { setSelected(null); setForm(emptyForm); setMessage(''); setView('form') }
  function openEdit(note: Note) { setSelected(note); setForm({ title: note.title, category: note.category ?? '일상', content: note.content }); setMessage(''); setView('form') }
  function openDetail(note: Note) { setSelected(note); setMessage(''); setView('detail') }

  async function saveNote(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !session || !form.title.trim() || !form.content.trim()) { setMessage('제목과 내용을 입력해주세요.'); return }
    setLoading(true); setMessage('')
    const payload = { title: form.title.trim(), content: form.content.trim(), category: form.category.trim() || null, updated_at: new Date().toISOString(), user_id: session.user.id }
    const result = selected ? await supabase.from('notes').update(payload).eq('id', selected.id).eq('user_id', session.user.id).select('id, category, created_at, updated_at, title, content, user_id').single() : await supabase.from('notes').insert(payload).select('id, category, created_at, updated_at, title, content, user_id').single()
    if (result.error) setMessage(result.error.message)
    else { const saved = result.data as Note; setNotes(current => selected ? current.map(note => note.id === saved.id ? saved : note) : [saved, ...current]); setSelected(saved); setView('detail'); setMessage('저장되었습니다.') }
    setLoading(false)
  }

  async function deleteNote(note: Note) {
    if (!supabase || !session || !window.confirm('이 메모를 삭제할까요?')) return
    setLoading(true); setMessage('')
    const { error } = await supabase.from('notes').delete().eq('id', note.id).eq('user_id', session.user.id)
    if (error) setMessage(error.message)
    else { setNotes(current => current.filter(item => item.id !== note.id)); setSelected(null); setView('list'); setMessage('삭제되었습니다.') }
    setLoading(false)
  }

  if (!authReady) return <div className="auth-shell"><div className="auth-card"><div className="brand-mark"><span>my</span><strong>storage</strong></div><p>안전한 보관함을 준비하고 있어요...</p></div></div>
  if (!session) return <LoginScreen mode={connection === 'needs-config' ? 'login' : undefined} onLogin={signIn} />

  return <div className="app-shell">
    <header className="topbar"><button className="brand-mark" onClick={() => setView('home')} aria-label="MyStorage 홈"><span>my</span><strong>storage</strong></button><button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></header>
    {menuOpen && <nav className="menu-panel"><button onClick={() => { setView('list'); setMenuOpen(false) }}>모든 메모</button><button onClick={() => { void supabase?.auth.signOut(); setMenuOpen(false) }}><LogOut size={14} />로그아웃</button></nav>}
    <main>
      {view === 'home' && <><section className="hero"><div className="eyebrow"><Sparkles size={14} /> YOUR QUIET ARCHIVE</div><h1>소중한 순간을<br /><em>오래 간직하세요.</em></h1><p>사진, 메모, 기억을 한 곳에 담고<br />필요할 때 다시 꺼내보세요.</p><button className="primary-button" onClick={openNew}><Plus size={19} />새 메모 작성</button></section><section className="welcome-card"><div className="welcome-orbit"><Cloud size={22} /></div><div><strong>{connection === 'connected' ? '클라우드 연결됨' : '클라우드 연결 확인 필요'}</strong><span>{session.user.email} 계정으로 안전하게 보관 중</span></div><div className={`status-dot ${connection}`} /></section><section className="section-block"><div className="section-heading"><div><span className="section-kicker">BROWSE YOUR ARCHIVE</span><h2>내 보관함</h2></div><button className="search-button" aria-label="검색은 아직 준비 중"><Search size={19} /></button></div><div className="quick-grid">{quickItems.map(({ icon: Icon, label, count, color }) => <button className="quick-card" key={label} onClick={() => label === '메모' && setView('list')}><div className={`quick-icon ${color}`}><Icon size={21} /></div><strong>{label}</strong><span>{label === '메모' ? `${notes.length}개` : count}</span></button>)}</div></section>{notes.length === 0 ? <section className="empty-state"><div className="empty-art"><div className="empty-ring" /><Sparkles size={23} /></div><h3>아직 기록이 없어요</h3><p>오늘의 작은 순간부터<br />나만의 보관함을 채워보세요.</p><button className="text-button" onClick={openNew}>첫 메모 만들기 <span>→</span></button></section> : <NoteList notes={notes} onSelect={openDetail} onNew={openNew} loading={loading} />}</>}
      {view === 'list' && <NoteList notes={notes} onSelect={openDetail} onNew={openNew} loading={loading} />}
      {view === 'detail' && selected && <section className="note-detail"><button className="back-button" onClick={() => setView('list')}><ArrowLeft size={18} />모든 메모</button><div className="note-meta"><span>{selected.category ?? '일상'}</span><time>{formatDate(selected.updated_at)}</time></div><h1>{selected.title}</h1><p className="note-content">{selected.content}</p><div className="detail-actions"><button className="secondary-button" onClick={() => openEdit(selected)}><Pencil size={16} />수정</button><button className="danger-button" onClick={() => void deleteNote(selected)} disabled={loading}><Trash2 size={16} />삭제</button></div>{message && <p className="form-message success"><Check size={15} />{message}</p>}</section>}
      {view === 'form' && <section className="note-form-section"><button className="back-button" onClick={() => setView(selected ? 'detail' : 'home')}><ArrowLeft size={18} />돌아가기</button><div className="section-kicker">{selected ? 'EDIT NOTE' : 'NEW NOTE'}</div><h2>{selected ? '메모 수정' : '새 메모 작성'}</h2><form className="note-form" onSubmit={saveNote}><label>제목<input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="메모 제목을 입력하세요" maxLength={120} /></label><label>카테고리<input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="예: 일상, 아이디어, 여행" maxLength={40} /></label><label>내용<textarea value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} placeholder="기억하고 싶은 내용을 적어보세요" rows={9} /></label>{message && <p className="form-message error">{message}</p>}<button className="primary-button submit-button" type="submit" disabled={loading}>{loading ? '저장 중...' : <><Check size={18} />{selected ? '변경사항 저장' : '메모 저장'}</>}</button></form></section>}
    </main><footer>MY STORAGE · YOUR QUIET ARCHIVE</footer>
  </div>
}

function LoginScreen({ onLogin }: { mode?: 'login'; onLogin: (email: string, password: string) => Promise<string> }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(await onLogin(email, password)); setBusy(false) }
  return <div className="auth-shell"><div className="auth-card"><div className="auth-brand"><div className="brand-mark"><span>my</span><strong>storage</strong></div><div className="auth-orbit"><Sparkles size={20} /></div></div><div className="eyebrow">YOUR PRIVATE ARCHIVE</div><h1>다시 오신 것을<br /><em>환영해요.</em></h1><p>나만의 보관함에 로그인해주세요.</p><form className="note-form" onSubmit={submit}><label>이메일<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label>비밀번호<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="비밀번호" autoComplete="current-password" required /></label>{error && <p className="form-message error">{error}</p>}<button className="primary-button submit-button" disabled={busy}>{busy ? '로그인 중...' : '로그인'}</button></form></div></div>
}

function NoteList({ notes, onSelect, onNew, loading }: { notes: Note[]; onSelect: (note: Note) => void; onNew: () => void; loading: boolean }) { return <section className="notes-section"><div className="section-heading"><div><span className="section-kicker">YOUR NOTES</span><h2>모든 메모</h2></div><button className="round-add" onClick={onNew} aria-label="새 메모"><Plus size={19} /></button></div>{loading && <p className="loading-text">메모를 불러오는 중...</p>}{!loading && notes.length === 0 && <div className="notes-empty">아직 작성한 메모가 없습니다.<br />첫 번째 메모를 남겨보세요.</div>}<div className="notes-list">{notes.map(note => <button className="note-row" key={note.id} onClick={() => onSelect(note)}><div className="note-row-copy"><span>{note.category ?? '일상'} · {formatDate(note.updated_at)}</span><strong>{note.title}</strong><p>{note.content}</p></div><ArrowLeft className="note-arrow" size={17} /></button>)}</div></section> }
