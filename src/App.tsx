import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Check, Cloud, FileText, Image, Menu, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { hasSupabaseConfig, supabase } from './lib/supabase'

 type Note = {
  id: string
  category: string | null
  created_at: string
  updated_at: string
  title: string
  content: string
}

type NoteForm = { title: string; category: string; content: string }
type View = 'home' | 'list' | 'detail' | 'form'
const emptyForm: NoteForm = { title: '', category: '일상', content: '' }

const quickItems = [
  { icon: Image, label: '사진', count: '준비 중', color: 'coral' },
  { icon: FileText, label: '메모', count: 'Notes', color: 'blue' },
  { icon: BookOpen, label: '기억', count: '준비 중', color: 'gold' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [form, setForm] = useState<NoteForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [connection, setConnection] = useState<'checking' | 'connected' | 'error' | 'needs-config'>('checking')

  async function loadNotes() {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase.from('notes').select('id, category, created_at, updated_at, title, content').order('updated_at', { ascending: false })
    if (error) setMessage(error.message)
    else setNotes((data ?? []) as Note[])
    setLoading(false)
  }

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) { setConnection('needs-config'); return }
    void (async () => {
      const { error } = await supabase.from('notes').select('id', { count: 'exact', head: true })
      setConnection(error ? 'error' : 'connected')
      if (!error) await loadNotes()
    })()
  }, [])

  function openNew() { setSelected(null); setForm(emptyForm); setMessage(''); setView('form') }
  function openEdit(note: Note) { setSelected(note); setForm({ title: note.title, category: note.category ?? '일상', content: note.content }); setMessage(''); setView('form') }
  function openDetail(note: Note) { setSelected(note); setMessage(''); setView('detail') }

  async function saveNote(event: FormEvent) {
    event.preventDefault()
    if (!supabase || !form.title.trim() || !form.content.trim()) { setMessage('제목과 내용을 입력해주세요.'); return }
    setLoading(true); setMessage('')
    const payload = { title: form.title.trim(), content: form.content.trim(), category: form.category.trim() || null, updated_at: new Date().toISOString() }
    const result = selected
      ? await supabase.from('notes').update(payload).eq('id', selected.id).select('id, category, created_at, updated_at, title, content').single()
      : await supabase.from('notes').insert(payload).select('id, category, created_at, updated_at, title, content').single()
    if (result.error) setMessage(result.error.message)
    else { const saved = result.data as Note; setNotes(current => selected ? current.map(note => note.id === saved.id ? saved : note) : [saved, ...current]); setSelected(saved); setView('detail'); setMessage('저장되었습니다.') }
    setLoading(false)
  }

  async function deleteNote(note: Note) {
    if (!supabase || !window.confirm('이 메모를 삭제할까요?')) return
    setLoading(true); setMessage('')
    const { error } = await supabase.from('notes').delete().eq('id', note.id)
    if (error) setMessage(error.message)
    else { setNotes(current => current.filter(item => item.id !== note.id)); setSelected(null); setView('list'); setMessage('삭제되었습니다.') }
    setLoading(false)
  }

  const connectionLabel = { checking: '클라우드 연결 확인 중', connected: '클라우드 연결됨', 'needs-config': '환경변수 설정 필요', error: '클라우드 연결 확인 필요' }[connection]

  return <div className="app-shell">
    <header className="topbar"><button className="brand-mark" onClick={() => setView('home')} aria-label="MyStorage 홈"><span>my</span><strong>storage</strong></button><button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></header>
    {menuOpen && <nav className="menu-panel"><button onClick={() => { setView('list'); setMenuOpen(false) }}>모든 메모</button><button onClick={() => { setView('home'); setMenuOpen(false) }}>홈으로</button></nav>}
    <main>
      {view === 'home' && <>
        <section className="hero"><div className="eyebrow"><Sparkles size={14} /> YOUR QUIET ARCHIVE</div><h1>소중한 순간을<br /><em>오래 간직하세요.</em></h1><p>사진, 메모, 기억을 한 곳에 담고<br />필요할 때 다시 꺼내보세요.</p><button className="primary-button" onClick={openNew}><Plus size={19} />새 메모 작성</button></section>
        <section className="welcome-card"><div className="welcome-orbit"><Cloud size={22} /></div><div><strong>{connectionLabel}</strong><span>{connection === 'connected' ? '메모를 안전하게 보관할 준비가 되었어요.' : '연결 설정 후 메모를 동기화할 수 있어요.'}</span></div><div className={`status-dot ${connection}`} /></section>
        <section className="section-block"><div className="section-heading"><div><span className="section-kicker">BROWSE YOUR ARCHIVE</span><h2>내 보관함</h2></div><button className="search-button" aria-label="검색은 아직 준비 중"><Search size={19} /></button></div><div className="quick-grid">{quickItems.map(({ icon: Icon, label, count, color }) => <button className="quick-card" key={label} onClick={() => label === '메모' && setView('list')}><div className={`quick-icon ${color}`}><Icon size={21} /></div><strong>{label}</strong><span>{label === '메모' ? `${notes.length}개` : count}</span></button>)}</div></section>
        {notes.length === 0 ? <section className="empty-state"><div className="empty-art"><div className="empty-ring" /><Sparkles size={23} /></div><h3>아직 기록이 없어요</h3><p>오늘의 작은 순간부터<br />나만의 보관함을 채워보세요.</p><button className="text-button" onClick={openNew}>첫 메모 만들기 <span>→</span></button></section> : <NoteList notes={notes} onSelect={openDetail} onNew={openNew} loading={loading} />}
      </>}
      {view === 'list' && <NoteList notes={notes} onSelect={openDetail} onNew={openNew} loading={loading} />}
      {view === 'detail' && selected && <section className="note-detail"><button className="back-button" onClick={() => setView('list')}><ArrowLeft size={18} />모든 메모</button><div className="note-meta"><span>{selected.category ?? '일상'}</span><time>{formatDate(selected.updated_at)}</time></div><h1>{selected.title}</h1><p className="note-content">{selected.content}</p><div className="detail-actions"><button className="secondary-button" onClick={() => openEdit(selected)}><Pencil size={16} />수정</button><button className="danger-button" onClick={() => void deleteNote(selected)} disabled={loading}><Trash2 size={16} />삭제</button></div>{message && <p className="form-message success"><Check size={15} />{message}</p>}</section>}
      {view === 'form' && <section className="note-form-section"><button className="back-button" onClick={() => setView(selected ? 'detail' : 'home')}><ArrowLeft size={18} />돌아가기</button><div className="section-kicker">{selected ? 'EDIT NOTE' : 'NEW NOTE'}</div><h2>{selected ? '메모 수정' : '새 메모 작성'}</h2><form className="note-form" onSubmit={saveNote}><label>제목<input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="메모 제목을 입력하세요" maxLength={120} /></label><label>카테고리<input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="예: 일상, 아이디어, 여행" maxLength={40} /></label><label>내용<textarea value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} placeholder="기억하고 싶은 내용을 적어보세요" rows={9} /></label>{message && <p className="form-message error">{message}</p>}<button className="primary-button submit-button" type="submit" disabled={loading}>{loading ? '저장 중...' : <><Check size={18} />{selected ? '변경사항 저장' : '메모 저장'}</>}</button></form></section>}
    </main><footer>MY STORAGE · YOUR QUIET ARCHIVE</footer>
  </div>
}

function NoteList({ notes, onSelect, onNew, loading }: { notes: Note[]; onSelect: (note: Note) => void; onNew: () => void; loading: boolean }) {
  return <section className="notes-section"><div className="section-heading"><div><span className="section-kicker">YOUR NOTES</span><h2>모든 메모</h2></div><button className="round-add" onClick={onNew} aria-label="새 메모"><Plus size={19} /></button></div>{loading && <p className="loading-text">메모를 불러오는 중...</p>}{!loading && notes.length === 0 && <div className="notes-empty">아직 작성한 메모가 없습니다.<br />첫 번째 메모를 남겨보세요.</div>}<div className="notes-list">{notes.map(note => <button className="note-row" key={note.id} onClick={() => onSelect(note)}><div className="note-row-copy"><span>{note.category ?? '일상'} · {formatDate(note.updated_at)}</span><strong>{note.title}</strong><p>{note.content}</p></div><ArrowLeft className="note-arrow" size={17} /></button>)}</div></section>
}
