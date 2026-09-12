import { useState } from 'react'
import { BookOpen, FileText, Image, Menu, Plus, Search, Sparkles, X } from 'lucide-react'

const quickItems = [
  { icon: Image, label: '사진', count: '0개', color: 'coral' },
  { icon: FileText, label: '메모', count: '0개', color: 'blue' },
  { icon: BookOpen, label: '기억', count: '0개', color: 'gold' },
]

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-label="MyStorage 홈"><span>my</span><strong>storage</strong></div>
        <button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {menuOpen && <nav className="menu-panel"><a href="#recent">최근 기록</a><a href="#collections">컬렉션</a><a href="#settings">설정</a></nav>}

      <main>
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> YOUR QUIET ARCHIVE</div>
          <h1>소중한 순간을<br /><em>오래 간직하세요.</em></h1>
          <p>사진, 메모, 기억을 한 곳에 담고<br />필요할 때 다시 꺼내보세요.</p>
          <button className="primary-button"><Plus size={19} />새 기록 남기기</button>
        </section>

        <section className="welcome-card">
          <div className="welcome-orbit"><Sparkles size={22} /></div>
          <div><strong>나만의 보관함을 시작해보세요</strong><span>소중한 기록을 담을 준비가 되었어요.</span></div>
        </section>

        <section className="section-block" id="collections">
          <div className="section-heading"><div><span className="section-kicker">BROWSE YOUR ARCHIVE</span><h2>내 보관함</h2></div><button className="search-button" aria-label="검색"><Search size={19} /></button></div>
          <div className="quick-grid">{quickItems.map(({ icon: Icon, label, count, color }) => <button className="quick-card" key={label}><div className={`quick-icon ${color}`}><Icon size={21} /></div><strong>{label}</strong><span>{count}</span></button>)}</div>
        </section>

        <section className="empty-state" id="recent"><div className="empty-art"><div className="empty-ring" /><Sparkles size={23} /></div><h3>아직 기록이 없어요</h3><p>오늘의 작은 순간부터<br />나만의 보관함을 채워보세요.</p><button className="text-button">첫 기록 만들기 <span>→</span></button></section>
      </main>
      <footer>MY STORAGE · YOUR QUIET ARCHIVE</footer>
    </div>
  )
}
