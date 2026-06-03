
const { useState, useRef, useEffect } = React;

// ────────────────────────────────────────────
// MOCK DATA
// ────────────────────────────────────────────
const vaultDocs = [
  { id:1, type:'pdf', title:'Analisis Regresi Linier Berganda — Solusi Lengkap', course:'Statistika II', sem:'2022/2', author:'Farhan A.', upvotes:47, verified:true, tags:['Regresi','Statistika'], difficulty:'Menengah', aiCategories:['Econometrics','Regression Analysis'], desc:'Penjelasan step-by-step mulai dari asumsi OLS, diagnostik residual, hingga interpretasi koefisien regresi dengan contoh data riil.' },
  { id:2, type:'doc', title:'Ringkasan Teori Antrian & Implementasi Simulasi', course:'Riset Operasi', sem:'2023/1', author:'Yusrina P.', upvotes:33, verified:true, tags:['OR','Simulasi'], difficulty:'Lanjutan', aiCategories:['Operations Research','Queuing Theory'], desc:'Catatan lengkap mencakup model M/M/1, M/M/c, dan simulasi Monte Carlo untuk antrian di sistem pelayanan.' },
  { id:3, type:'code', title:'Implementasi Algoritma Dijkstra dengan Visualisasi', course:'Struktur Data', sem:'2023/1', author:'Bimo R.', upvotes:58, verified:false, tags:['Graf','Python'], difficulty:'Menengah', aiCategories:['Algorithms','Graph Theory'], desc:'Kode Python lengkap dengan visualisasi NetworkX dan penjelasan kompleksitas waktu O((V+E) log V).' },
  { id:4, type:'ppt', title:'Presentasi Final: Analisis Pasar Modal Indonesia 2023', course:'Manajemen Keuangan', sem:'2023/2', author:'Dina K.', upvotes:29, verified:true, tags:['Keuangan','Analisis'], difficulty:'Dasar', aiCategories:['Finance','Capital Markets'], desc:'Slide presentasi final yang memenangkan nilai A+, membahas tren IHSG, analisis fundamental 5 emiten pilihan.' },
  { id:5, type:'pdf', title:'Panduan Uji Hipotesis Parametrik & Non-Parametrik', course:'Statistika II', sem:'2021/2', author:'Keisha M.', upvotes:41, verified:true, tags:['Hipotesis','SPSS'], difficulty:'Menengah', aiCategories:['Hypothesis Testing','Statistics'], desc:'Panduan praktis kapan menggunakan t-test, ANOVA, Mann-Whitney, dan Kruskal-Wallis dengan contoh kasus.' },
  { id:6, type:'doc', title:'Cheat Sheet Linear Programming — Metode Simpleks', course:'Riset Operasi', sem:'2022/1', author:'Adrian W.', upvotes:62, verified:false, tags:['LP','Optimasi'], difficulty:'Dasar', aiCategories:['Linear Programming','Optimization'], desc:'Ringkasan langkah demi langkah metode simpleks dalam format tabel yang mudah diingat saat ujian.' },
];

const qaThreads = [
  { id:1, q:'Bagaimana cara menginterpretasi nilai p-value dalam regresi berganda? Saya bingung kapan harus menolak H0', a:'P-value adalah probabilitas mendapatkan hasil setidaknya seekstrim data kita jika H0 benar. Jika p-value < α (biasanya 0.05), kita tolak H0. Dalam regresi, ini berarti koefisien secara statistis berbeda dari nol — variabel tersebut berpengaruh signifikan terhadap Y. Contoh: p = 0.023 berarti hanya 2.3% kemungkinan pengaruh ini muncul secara kebetulan.', answerer:'Farhan A. (2022)', role:'Mahasiswa', sem:'2022', upvotes:34, verified:true, course:'Statistika II', similarity:97, campus:'Universitas Indonesia', faculty:'FASILKOM', department:'Sistem Informasi' },
  { id:2, q:'Apa perbedaan antara R² dan R² adjusted? Mana yang sebaiknya digunakan?', a:'R² selalu meningkat saat kita menambah variabel baru meski tidak relevan. R² adjusted mengoreksi ini dengan memperhitungkan jumlah variabel dan observasi. Gunakan R² adjusted saat membandingkan model dengan jumlah variabel berbeda. Rumus: R²adj = 1 - (1-R²)(n-1)/(n-k-1) di mana n=observasi, k=variabel prediktor.', answerer:'Dr. Hartono', role:'Dosen', sem:'2021', upvotes:51, verified:true, course:'Statistika II', similarity:89, campus:'Universitas Indonesia', faculty:'FASILKOM', department:'Sistem Informasi' },
  { id:3, q:'Kenapa residual saya tidak normal meski sampel besar? Apakah ini masalah serius?', a:'Dengan sampel besar (n>30), asumsi normalitas residual kurang kritis karena Central Limit Theorem. Yang lebih penting adalah homoskedastisitas dan tidak ada autokorelasi. Cek dengan plot residual vs fitted values. Jika ada pola corong = heteroskedastisitas, gunakan White Robust Standard Error.', answerer:'Yusrina P. (2023)', role:'Mahasiswa', sem:'2023', upvotes:28, verified:false, course:'Statistika II', similarity:82, campus:'Universitas Indonesia', faculty:'FEB', department:'Ilmu Ekonomi' },
  { id:4, q:'Ada yang punya panduan setup environment untuk praktikum pemrograman web?', a:'Bisa cek di Knowledge Vault untuk panduan lengkap install XAMPP, Composer, dan setup Laravel. Pastikan pakai PHP versi 8.1 ke atas.', answerer:'Bimo R.', role:'Mahasiswa', sem:'2023', upvotes:15, verified:false, course:'Pemrograman Web', similarity:65, campus:'Institut Teknologi Bandung', faculty:'STEI', department:'Informatika' },
];

const activities = [
  { id:1, user:'Dr. Hartono', initials:'DH', color:'#4a7c6f', action:'memverifikasi', target:'Panduan Analisis Regresi oleh Farhan A.', time:'10 menit lalu' },
  { id:2, user:'Yusrina P.', initials:'YP', color:'#3a4a9a', action:'mengunggah', target:'Catatan Teori Antrian ke Knowledge Vault', time:'2 jam lalu' },
  { id:3, user:'Bimo R.', initials:'BR', color:'#8a4a2a', action:'menjawab pertanyaan tentang', target:'Algoritma Dijkstra di Q&A Thread', time:'5 jam lalu' },
  { id:4, user:'AI System', initials:'AI', color:'#7240b8', action:'mengkategorisasi otomatis', target:'6 dokumen baru ke mata kuliah terkait', time:'Kemarin' },
  { id:5, user:'Keisha M.', initials:'KM', color:'#2a6a5a', action:'menambahkan komentar pada', target:'Cheat Sheet Linear Programming', time:'Kemarin' },
];

const semesters = [
  { sem:'2024/1', courses:12, docs:47, threads:89, coverage:78 },
  { sem:'2023/2', courses:14, docs:61, threads:124, coverage:92 },
  { sem:'2023/1', courses:13, docs:53, threads:98, coverage:85 },
  { sem:'2022/2', courses:11, docs:39, threads:76, coverage:71 },
];

const mockCourses = [
  { id: 1, code: 'CSI203', name: 'Struktur Data dan Algoritma', sks: 4, sem: 3, lecturer: 'Dr. Rina K.', docs: 45, threads: 89 },
  { id: 2, code: 'CSI301', name: 'Statistika dan Probabilitas', sks: 3, sem: 3, lecturer: 'Dr. Hartono', docs: 34, threads: 112 },
  { id: 3, code: 'CSI405', name: 'Riset Operasi', sks: 3, sem: 5, lecturer: 'Prof. Budi S.', docs: 28, threads: 45 },
  { id: 4, code: 'CSI201', name: 'Pemrograman Web', sks: 3, sem: 3, lecturer: 'Ahmad S., M.Kom', docs: 56, threads: 134 },
  { id: 5, code: 'CSI304', name: 'Manajemen Basis Data', sks: 4, sem: 4, lecturer: 'Dr. Rina K.', docs: 41, threads: 77 },
  { id: 6, code: 'CSI501', name: 'Kecerdasan Buatan', sks: 3, sem: 5, lecturer: 'Prof. Budi S.', docs: 22, threads: 55 },
];

const gpaData = [
  { sem: '1', ipk: 3.65, credits: 20 },
  { sem: '2', ipk: 3.72, credits: 21 },
  { sem: '3', ipk: 3.80, credits: 22 },
  { sem: '4', ipk: 3.78, credits: 20 },
  { sem: '5', ipk: 3.85, credits: 24 },
];

const leaderboardData = [
  { rank: 1, name: 'Bimo R.', role: 'Mahasiswa', score: 1245, avatar: '#8a4a2a', initials: 'BR' },
  { rank: 2, name: 'Yusrina P.', role: 'Mahasiswa', score: 982, avatar: '#3a4a9a', initials: 'YP' },
  { rank: 3, name: 'Farhan A.', role: 'Mahasiswa', score: 876, avatar: '#4a7c6f', initials: 'FA' },
  { rank: 4, name: 'Adrian W.', role: 'Mahasiswa', score: 754, avatar: '#7240b8', initials: 'AW' },
  { rank: 5, name: 'Keisha M.', role: 'Mahasiswa', score: 621, avatar: '#2a6a5a', initials: 'KM' },
];

// ────────────────────────────────────────────
// COMPONENTS
// ────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if(email && password) {
      onLogin({
        name: 'M. Syahrul',
        nim: '2006123456',
        campus: 'Universitas Indonesia',
        faculty: 'FASILKOM',
        department: 'Sistem Informasi'
      });
    }
  };

  return React.createElement('div', { className: 'login-container' },
    React.createElement('div', { className: 'login-card' },
      React.createElement('div', { className: 'login-header' },
        React.createElement('div', { className: 'login-icon' }, '📚'),
        React.createElement('h1', { className: 'login-title' }, 'LegacyLearn'),
        React.createElement('p', { className: 'login-subtitle' }, 'Platform Knowledge Transfer Akademik')
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'NIM / Email Kampus'),
          React.createElement('input', { 
            type: 'text', 
            className: 'form-input', 
            placeholder: 'Masukkan NIM atau Email',
            value: email,
            onChange: e => setEmail(e.target.value),
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Password'),
          React.createElement('input', { 
            type: 'password', 
            className: 'form-input', 
            placeholder: 'Masukkan Password',
            value: password,
            onChange: e => setPassword(e.target.value),
            required: true
          })
        ),
        React.createElement('button', { type: 'submit', className: 'login-btn' }, 'Masuk ke Dashboard')
      )
    )
  );
}

function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  const navItems = [
    { id:'dashboard', icon:'ti ti-layout-dashboard', label:'Dashboard' },
    { id:'vault', icon:'ti ti-files', label:'Knowledge Vault', badge:'156' },
    { id:'qa', icon:'ti ti-messages', label:'Generational Q&A', badge:'42' },
    { id:'upload', icon:'ti ti-cloud-upload', label:'Upload Materi' },
  ];
  const bottomItems = [
    { id:'courses', icon:'ti ti-book', label:'Mata Kuliah' },
    { id:'analytics', icon:'ti ti-chart-line', label:'Analytics' },
    { id:'settings', icon:'ti ti-settings', label:'Pengaturan' },
  ];

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: `sidebar-overlay ${isOpen ? 'open' : ''}`, onClick: onClose }),
    React.createElement('aside', { className:`sidebar ${isOpen ? 'open' : ''}` },
      React.createElement('div', { className:'sidebar-brand' },
      React.createElement('div', { className:'brand-icon' }, '📚'),
      React.createElement('div', { className:'brand-name' }, 'LegacyLearn'),
      React.createElement('div', { className:'brand-sub' }, 'Knowledge Transfer Platform')
    ),
    React.createElement('nav', { className:'sidebar-nav' },
      React.createElement('div', { className:'nav-section-label' }, 'Menu Utama'),
      navItems.map(item =>
        React.createElement('button', {
          key: item.id,
          className: `nav-item ${activeTab === item.id ? 'active' : ''}`,
          onClick: () => { onTabChange(item.id); if(onClose) onClose(); }
        },
          React.createElement('i', { className:`${item.icon} nav-icon` }),
          item.label,
          item.badge && React.createElement('span', { className:'nav-badge' }, item.badge)
        )
      ),
      React.createElement('div', { className:'nav-section-label', style:{marginTop:'6px'} }, 'Lainnya'),
      bottomItems.map(item =>
        React.createElement('button', {
          key: item.id,
          className: `nav-item ${activeTab === item.id ? 'active' : ''}`,
          onClick: () => onTabChange(item.id)
        },
          React.createElement('i', { className:`${item.icon} nav-icon` }),
          item.label
        )
      )
    ),
    React.createElement('div', { className:'sidebar-footer' },
      React.createElement('div', { className:'avatar' }, 'MS'),
      React.createElement('div', { className:'avatar-info' },
        React.createElement('div', { className:'name' }, 'M. Syahrul'),
        React.createElement('div', { className:'role' }, 'Mahasiswa Semester 5')
      ),
      React.createElement('i', { className:'ti ti-dots', style:{marginLeft:'auto', color:'rgba(255,255,255,0.3)', fontSize:'13px'} })
    )
    )
  );
}

function StatCard({ icon, iconClass, label, value, trend }) {
  return React.createElement('div', { className:'stat-card' },
    React.createElement('div', { className:'stat-card-top' },
      React.createElement('span', { className:'stat-label' }, label),
      React.createElement('div', { className:`stat-icon ${iconClass}` },
        React.createElement('i', { className:icon })
      )
    ),
    React.createElement('div', { className:'stat-value' }, value),
    React.createElement('div', { className:'stat-trend' },
      React.createElement('i', { className:'ti ti-trending-up', style:{marginRight:'4px', fontSize:'10px'} }),
      trend
    )
  );
}

function Dashboard({ onNavigate }) {
  return React.createElement('div', null,
    React.createElement('div', { className:'page-header' },
      React.createElement('h1', null, 'Selamat datang kembali, Syahrul 👋'),
      React.createElement('p', null, 'Platform Knowledge Transfer Akademik Antar Angkatan — Semester Gasal 2024/2025')
    ),
    React.createElement('div', { className:'stats-grid' },
      React.createElement(StatCard, { icon:'ti ti-file-text', iconClass:'blue', label:'Total Dokumen', value:'1.247', trend:'+23 minggu ini' }),
      React.createElement(StatCard, { icon:'ti ti-messages', iconClass:'gold', label:'Thread Q&A Aktif', value:'389', trend:'+12 pertanyaan baru' }),
      React.createElement(StatCard, { icon:'ti ti-users', iconClass:'green', label:'Kontributor Aktif', value:'284', trend:'Dari 8 angkatan' }),
      React.createElement(StatCard, { icon:'ti ti-robot', iconClass:'purple', label:'Konten Terverifikasi AI', value:'78%', trend:'Rata-rata akurasi tinggi' })
    ),
    React.createElement('div', { className:'dashboard-grid' },
      React.createElement('div', null,
        // Recent Vault
        React.createElement('div', { className:'card', style:{marginBottom:'16px'} },
          React.createElement('div', { className:'card-header' },
            React.createElement('span', { className:'card-title' }, '📂 Dokumen Terbaru di Knowledge Vault'),
            React.createElement('button', { className:'btn btn-ghost btn-sm', onClick: () => onNavigate('vault') }, 'Lihat Semua')
          ),
          React.createElement('div', { className:'card-body', style:{padding:'8px 16px'} },
            vaultDocs.slice(0,4).map(doc =>
              React.createElement('div', { key: doc.id, className:'vault-item' },
                React.createElement('div', { className:`doc-icon ${doc.type}` },
                  React.createElement('i', { className: doc.type==='pdf' ? 'ti ti-file-type-pdf' : doc.type==='code' ? 'ti ti-code' : doc.type==='ppt' ? 'ti ti-file-type-ppt' : 'ti ti-file-type-doc' })
                ),
                React.createElement('div', { className:'vault-meta' },
                  React.createElement('div', { className:'vault-title' }, doc.title),
                  React.createElement('div', { className:'vault-detail' },
                    React.createElement('span', null, doc.course),
                    React.createElement('span', null, '·'),
                    React.createElement('span', null, doc.sem),
                    doc.verified && React.createElement('span', { className:'tag tag-verified', style:{padding:'1px 6px'} },
                      React.createElement('i', { className:'ti ti-circle-check', style:{fontSize:'9px'} }), ' Verified'
                    )
                  )
                ),
                React.createElement('div', { className:'vote-group' },
                  React.createElement('button', { className:'vote-btn' }, React.createElement('i', { className:'ti ti-arrow-up' })),
                  React.createElement('span', { style:{minWidth:'22px', textAlign:'center', fontWeight:500} }, doc.upvotes),
                )
              )
            )
          )
        ),
        // Q&A Preview
        React.createElement('div', { className:'card' },
          React.createElement('div', { className:'card-header' },
            React.createElement('span', { className:'card-title' }, '💬 Thread Q&A Terpopuler'),
            React.createElement('button', { className:'btn btn-ghost btn-sm', onClick: () => onNavigate('qa') }, 'Buka Q&A')
          ),
          React.createElement('div', { className:'card-body' },
            qaThreads.slice(0,2).map(thread =>
              React.createElement('div', { key: thread.id, className:'qa-thread', style:{marginBottom:'8px'}, onClick: () => onNavigate('qa') },
                React.createElement('div', { className:'thread-q' },
                  React.createElement('i', { className:'ti ti-help-circle thread-q-icon' }),
                  React.createElement('div', { className:'thread-q-text' }, thread.q.length > 80 ? thread.q.slice(0,80)+'...' : thread.q),
                  React.createElement('span', { className:`match-score ${thread.similarity > 90 ? 'high' : ''}` }, `${thread.upvotes} ↑`)
                ),
                React.createElement('div', { className:'thread-a' },
                  React.createElement('div', { className:'thread-a-avatar' }, thread.role==='Dosen' ? 'D' : thread.answerer[0] ),
                  React.createElement('div', { className:'thread-a-content' },
                    React.createElement('div', { className:'thread-a-text' },
                      thread.a.length > 100 ? thread.a.slice(0,100)+'...' : thread.a
                    ),
                    React.createElement('div', { className:'thread-a-meta' },
                      React.createElement('span', { className:'tag tag-navy' }, thread.course),
                      thread.verified && React.createElement('span', { className:'tag tag-green' },
                        React.createElement('i', { className:'ti ti-chalkboard', style:{fontSize:'9px'} }), ' Diverifikasi Dosen'
                      ),
                    )
                  )
                )
              )
            )
          )
        )
      ),
      // Right column
      React.createElement('div', null,
        // Leaderboard
        React.createElement('div', { className:'card', style:{marginBottom:'16px'} },
          React.createElement('div', { className:'card-header' },
            React.createElement('span', { className:'card-title' }, '🏆 Top Performance (Leaderboard)')
          ),
          React.createElement('div', { className:'card-body' },
            React.createElement('p', { className:'text-muted text-xs', style:{marginBottom:'16px'} }, 'Mahasiswa paling aktif berkontribusi (Upload & Q&A) bulan ini.'),
            leaderboardData.map(user => 
              React.createElement('div', { key:user.rank, className:'leaderboard-item' },
                React.createElement('div', { className:`rank-badge ${user.rank <= 3 ? `rank-${user.rank}` : 'rank-other'}` }, user.rank),
                React.createElement('div', { className:'activity-avatar', style:{background:user.avatar} }, user.initials),
                React.createElement('div', { style:{flex:1} },
                  React.createElement('div', { style:{fontSize:'13.5px', fontWeight:600, color:'var(--navy)'} }, user.name),
                  React.createElement('div', { style:{fontSize:'11px', color:'var(--text-muted)'} }, user.role)
                ),
                React.createElement('div', { style:{fontWeight:700, color:'var(--gold)', fontSize:'14px'} }, user.score)
              )
            )
          )
        ),
        // Semester Coverage
        React.createElement('div', { className:'card', style:{marginBottom:'16px'} },
          React.createElement('div', { className:'card-header' },
            React.createElement('span', { className:'card-title' }, '📅 Cakupan Per Semester')
          ),
          React.createElement('div', { className:'card-body', style:{padding:'12px 16px'} },
            semesters.map(s =>
              React.createElement('div', { key:s.sem, className:'semester-block' },
                React.createElement('div', { className:'semester-num' }, s.sem.split('/')[0].slice(2)),
                React.createElement('div', { className:'semester-info' },
                  React.createElement('div', { className:'semester-name' }, `Sem ${s.sem}`),
                  React.createElement('div', { className:'semester-count' }, `${s.docs} dok · ${s.threads} thread`),
                  React.createElement('div', { className:'progress-bar', style:{marginTop:'5px'} },
                    React.createElement('div', { className:'progress-fill', style:{width:`${s.coverage}%`} })
                  )
                ),
                React.createElement('span', { style:{fontSize:'12px', fontWeight:600, color:'var(--sage)', marginLeft:'4px'} }, `${s.coverage}%`)
              )
            )
          )
        ),
        // Activity
        React.createElement('div', { className:'card' },
          React.createElement('div', { className:'card-header' },
            React.createElement('span', { className:'card-title' }, '🔔 Aktivitas Terkini')
          ),
          React.createElement('div', { className:'card-body', style:{padding:'8px 16px'} },
            activities.map(act =>
              React.createElement('div', { key:act.id, className:'activity-item' },
                React.createElement('div', { className:'activity-avatar', style:{background:act.color} }, act.initials),
                React.createElement('div', { className:'act-content' },
                  React.createElement('div', { className:'act-text' },
                    React.createElement('strong', null, act.user), ` ${act.action} `, act.target
                  ),
                  React.createElement('div', { className:'act-time' }, act.time)
                )
              )
            )
          )
        )
      )
    )
  );
}

function VaultPage() {
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const filters = ['Semua', 'Statistika', 'Riset Operasi', 'Struktur Data', 'Keuangan', 'Terverifikasi'];
  
  const filtered = vaultDocs.filter(d => {
    if (filter === 'Terverifikasi') return d.verified;
    if (filter !== 'Semua') return d.course.includes(filter);
    if (search) return d.title.toLowerCase().includes(search.toLowerCase()) || d.course.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return React.createElement('div', null,
    React.createElement('div', { className:'page-header' },
      React.createElement('div', { style:{display:'flex', alignItems:'center', justifyContent:'space-between'} },
        React.createElement('div', null,
          React.createElement('h1', null, '🗄️ Knowledge Vault'),
          React.createElement('p', null, 'Repositori pengetahuan terstruktur dari seluruh angkatan — dikurasi dan diverifikasi AI')
        ),
        React.createElement('div', { style:{display:'flex', gap:'8px'} },
          React.createElement('div', { className:'ai-classify-pill' },
            React.createElement('i', { className:'ti ti-robot', style:{fontSize:'11px'} }),
            'AI Auto-Classify'
          ),
          React.createElement('button', { className:'btn btn-primary' },
            React.createElement('i', { className:'ti ti-cloud-upload' }),
            'Upload Materi'
          )
        )
      )
    ),
    // Upload Zone
    React.createElement('div', { className:'upload-zone' },
      React.createElement('div', { className:'upload-zone-icon' },
        React.createElement('i', { className:'ti ti-cloud-upload' })
      ),
      React.createElement('div', { className:'upload-zone-text' }, 'Seret & lepas dokumen ke sini'),
      React.createElement('div', { className:'upload-zone-sub' },
        React.createElement('span', { className:'ai-classify-pill', style:{fontSize:'11px'} },
          React.createElement('i', { className:'ti ti-sparkles', style:{fontSize:'10px'} }),
          'AI akan otomatis menganalisis, mengkategorisasi, dan memberi tag berdasarkan konten dokumen'
        )
      )
    ),
    // Search & Filters
    React.createElement('div', { className:'vault-filters' },
      React.createElement('div', { style:{position:'relative', flex:'1', maxWidth:'300px'} },
        React.createElement('i', { className:'ti ti-search', style:{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:'12px'} }),
        React.createElement('input', {
          type:'text',
          placeholder:'Cari judul, mata kuliah...',
          value: search,
          onChange: e => setSearch(e.target.value),
          style:{width:'100%', padding:'7px 12px 7px 30px', border:'1px solid var(--border-strong)', borderRadius:'20px', fontSize:'13px', fontFamily:'DM Sans', background:'#fff', outline:'none', color:'var(--text-primary)'}
        })
      ),
      filters.map(f =>
        React.createElement('button', {
          key:f,
          className:`filter-chip ${filter===f ? 'active' : ''}`,
          onClick: () => setFilter(f)
        }, f)
      )
    ),
    // Grid
    React.createElement('div', { className:'vault-grid' },
      filtered.map(doc =>
        React.createElement('div', { key:doc.id, className:'vault-card' },
          React.createElement('div', { className:'vault-card-header' },
            React.createElement('div', { className:`doc-icon ${doc.type} vault-card-icon` },
              React.createElement('i', { className: doc.type==='pdf' ? 'ti ti-file-type-pdf' : doc.type==='code' ? 'ti ti-code' : doc.type==='ppt' ? 'ti ti-file-type-ppt' : 'ti ti-file-type-doc' })
            ),
            React.createElement('div', { className:'vault-card-meta' },
              React.createElement('div', { className:'vault-card-title' }, doc.title),
              React.createElement('div', { className:'vault-card-sub' }, `${doc.course} · ${doc.sem}`)
            )
          ),
          React.createElement('div', { className:'vault-card-body' },
            React.createElement('p', { className:'vault-card-desc' }, doc.desc),
            React.createElement('div', { className:'vault-card-tags' },
              doc.tags.map(t => React.createElement('span', { key:t, className:'tag tag-navy' }, t)),
              React.createElement('span', { className:'tag tag-ai' },
                React.createElement('i', { className:'ti ti-robot', style:{fontSize:'9px'} }), ` ${doc.aiCategories[0]}`
              ),
              React.createElement('span', { className:`tag ${doc.difficulty==='Dasar' ? 'tag-green' : doc.difficulty==='Lanjutan' ? 'tag-red' : 'tag-gold'}` }, doc.difficulty)
            )
          ),
          React.createElement('div', { className:'vault-card-footer' },
            React.createElement('span', null, doc.author),
            React.createElement('div', { style:{display:'flex', alignItems:'center', gap:'10px'} },
              doc.verified && React.createElement('span', { className:'tag tag-verified' },
                React.createElement('i', { className:'ti ti-circle-check', style:{fontSize:'9px'} }), ' Verified'
              ),
              React.createElement('div', { className:'vote-group' },
                React.createElement('i', { className:'ti ti-arrow-up', style:{fontSize:'11px'} }),
                React.createElement('span', { style:{fontWeight:600} }, doc.upvotes)
              )
            )
          )
        )
      )
    )
  );
}

function QAPage({ user }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [scope, setScope] = useState('department');
  const textareaRef = useRef(null);

  const scopeOptions = [
    { id: 'department', label: `Departemen (${user?.department || 'Sistem Informasi'})` },
    { id: 'faculty', label: `Fakultas (${user?.faculty || 'FASILKOM'})` },
    { id: 'campus', label: `Kampus (${user?.campus || 'Universitas Indonesia'})` },
    { id: 'global', label: 'Global (Semua Kampus)' }
  ];

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setShowResults(false);
    
    // Filter by scope
    const scopedThreads = qaThreads.filter(t => {
      if (scope === 'department') return t.department === user?.department && t.faculty === user?.faculty && t.campus === user?.campus;
      if (scope === 'faculty') return t.faculty === user?.faculty && t.campus === user?.campus;
      if (scope === 'campus') return t.campus === user?.campus;
      return true;
    });

    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
      setResults(scopedThreads.filter(t =>
        t.q.toLowerCase().includes(query.toLowerCase().split(' ')[0]) ||
        t.course.toLowerCase().includes(query.toLowerCase()) ||
        Math.random() > 0.2
      ));
    }, 1400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const sampleQuestions = [
    'Bagaimana cara membaca output SPSS untuk regresi berganda?',
    'Apa itu multikolinearitas dan bagaimana cara mendeteksinya?',
    'Kapan harus menggunakan uji t vs uji F dalam regresi?',
  ];

  return React.createElement('div', null,
    React.createElement('div', { className:'page-header' },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' } },
        React.createElement('div', null,
          React.createElement('h1', null, '💬 Generational Q&A'),
          React.createElement('p', null, 'Tanyakan apa saja — AI akan mencocokkan dengan jawaban dari angkatan sebelumnya secara otomatis')
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' } }, 'Lingkup Diskusi:'),
          React.createElement('select', {
            value: scope,
            onChange: e => setScope(e.target.value),
            style: {
              padding: '6px 30px 6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              fontSize: '13px',
              fontFamily: 'DM Sans',
              color: 'var(--navy)',
              fontWeight: 500,
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231a2744%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px top 50%',
              backgroundSize: '10px auto'
            }
          },
            scopeOptions.map(opt => React.createElement('option', { key: opt.id, value: opt.id }, opt.label))
          )
        )
      )
    ),

    // Main Search Box
    React.createElement('div', { className:'qa-search-container' },
      React.createElement('div', { className:`qa-search-box ${focused ? 'focused' : ''}` },
        React.createElement('div', { className:'qa-search-inner' },
          React.createElement('textarea', {
            ref: textareaRef,
            className:'qa-textarea',
            placeholder:'Ketik pertanyaanmu di sini... AI akan mencarikan jawaban serupa dari angkatan sebelumnya',
            value: query,
            onChange: e => setQuery(e.target.value),
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
            onKeyDown: handleKeyDown,
            rows: 2,
          }),
          React.createElement('div', { className:'qa-search-actions' },
            React.createElement('div', { className:'ai-badge' },
              React.createElement('div', { className:'dot' }),
              'AI Semantic'
            ),
            React.createElement('button', {
              className:'btn btn-primary',
              onClick: handleSearch,
              style:{padding:'8px 16px'}
            },
              loading
                ? React.createElement('div', { className:'spinner' })
                : React.createElement('i', { className:'ti ti-search' }),
              !loading && ' Cari'
            )
          )
        ),
        React.createElement('div', { className:'qa-hint' },
          React.createElement('i', { className:'ti ti-info-circle', style:{fontSize:'11px'} }),
          'Tekan Enter untuk mencari · AI akan mencocokkan semantik, bukan hanya kata kunci'
        )
      )
    ),

    // Sample questions
    !showResults && !loading && React.createElement('div', { style:{marginBottom:'20px'} },
      React.createElement('div', { className:'match-header', style:{marginBottom:'10px'} },
        React.createElement('span', { className:'match-header-title' }, '💡 Contoh pertanyaan populer'),
        React.createElement('div', { className:'match-line' })
      ),
      sampleQuestions.map((q, i) =>
        React.createElement('button', {
          key:i,
          onClick: () => { setQuery(q); },
          style:{
            display:'block',
            width:'100%',
            textAlign:'left',
            padding:'10px 14px',
            marginBottom:'6px',
            background:'#fff',
            border:'1px solid var(--border)',
            borderRadius:'var(--radius)',
            cursor:'pointer',
            fontSize:'13.5px',
            color:'var(--text-secondary)',
            fontFamily:'DM Sans',
            transition:'all 0.15s',
          },
          onMouseEnter: e => { e.target.style.borderColor='var(--navy)'; e.target.style.color='var(--navy)'; },
          onMouseLeave: e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-secondary)'; }
        },
          React.createElement('i', { className:'ti ti-help-circle', style:{marginRight:'8px', color:'var(--text-muted)'} }),
          q
        )
      )
    ),

    // Loading state
    loading && React.createElement('div', { style:{textAlign:'center', padding:'40px 20px'} },
      React.createElement('div', { className:'spinner', style:{width:'28px', height:'28px', margin:'0 auto 12px', borderWidth:'3px'} }),
      React.createElement('p', { style:{color:'var(--text-muted)', fontSize:'13.5px'} }, 'AI sedang mencari kecocokan semantik dari 389 thread antar angkatan...'),
      React.createElement('p', { style:{color:'var(--text-muted)', fontSize:'12px', marginTop:'4px'} }, 'Menganalisis pola pertanyaan 2019–2024 📚')
    ),

    // Results
    showResults && React.createElement('div', null,
      React.createElement('div', { className:'match-header' },
        React.createElement('span', { className:'match-header-title' },
          `🎯 ${results.length} kecocokan ditemukan dari angkatan sebelumnya`
        ),
        React.createElement('div', { className:'match-line' }),
        React.createElement('button', {
          className:'btn btn-primary btn-sm',
          style:{flexShrink:0, marginLeft:'8px'},
          onClick: () => setShowResults(false)
        },
          React.createElement('i', { className:'ti ti-plus', style:{fontSize:'11px'} }),
          ' Tanya Baru'
        )
      ),

      // Best match banner
      React.createElement('div', {
        style:{
          background:'linear-gradient(135deg, var(--navy), var(--navy-mid))',
          borderRadius:'var(--radius)',
          padding:'10px 14px',
          marginBottom:'14px',
          display:'flex',
          alignItems:'center',
          gap:'10px',
          color:'rgba(255,255,255,0.7)',
          fontSize:'12.5px'
        }
      },
        React.createElement('i', { className:'ti ti-robot', style:{color:'var(--gold-light)', fontSize:'16px'} }),
        React.createElement('span', null,
          'AI menemukan pertanyaan sangat mirip (97% similarity) dari angkatan 2022. ',
          React.createElement('strong', { style:{color:'#fff'} }, 'Lihat jawaban terbaik di bawah ini.')
        )
      ),

      results.map((thread, idx) =>
        React.createElement('div', { key:thread.id, className:`qa-thread ${idx===0 ? 'best-match' : ''}` },
          React.createElement('div', { className:'thread-q' },
            React.createElement('i', { className:'ti ti-help-circle thread-q-icon' }),
            React.createElement('div', { className:'thread-q-text' }, thread.q),
            React.createElement('span', { className:`match-score ${thread.similarity > 90 ? 'high' : ''}` }, `${thread.similarity}%`)
          ),
          React.createElement('div', { className:'thread-a' },
            React.createElement('div', { className:'thread-a-avatar', style:{background: thread.role==='Dosen' ? '#4a7c6f' : '#3a4a9a'} },
              thread.role==='Dosen' ? 'D' : thread.answerer[0]
            ),
            React.createElement('div', { className:'thread-a-content' },
              React.createElement('div', { className:'thread-a-text' }, thread.a),
              thread.a.includes('p-value') || thread.a.includes('OLS') ? React.createElement('div', { className:'code-snippet', style:{marginTop:'8px'} },
                React.createElement('span', { style:{color:'#facc15'} }, '# Python · statsmodels'), '\n',
                React.createElement('span', { style:{color:'#93c5fd'} }, 'import'), ' statsmodels.formula.api ', React.createElement('span', { style:{color:'#93c5fd'} }, 'as'), ' smf\n',
                'model = smf.ols(', React.createElement('span', { style:{color:'#86efac'} }, '"Y ~ X1 + X2"'), ', data=df).fit()\n',
                'print(model.summary())'
              ) : null,
              React.createElement('div', { className:'thread-a-meta' },
                React.createElement('span', { className:'tag tag-navy' },
                  React.createElement('i', { className:'ti ti-user', style:{fontSize:'9px'} }), ` ${thread.answerer}`
                ),
                React.createElement('span', { className:'tag tag-navy' }, thread.course),
                thread.verified && React.createElement('span', { className:'tag tag-green' },
                  React.createElement('i', { className:'ti ti-chalkboard', style:{fontSize:'9px'} }), ' Diverifikasi Dosen'
                ),
                React.createElement('div', { style:{marginLeft:'auto', display:'flex', gap:'6px'} },
                  React.createElement('button', { className:'btn btn-ghost btn-sm' },
                    React.createElement('i', { className:'ti ti-arrow-up', style:{fontSize:'11px'} }), ` ${thread.upvotes}`
                  ),
                  React.createElement('button', { className:'btn btn-ghost btn-sm' }, 'Tambah Jawaban')
                )
              )
            )
          )
        )
      ),

      // Post new question CTA
      React.createElement('div', {
        style:{
          marginTop:'16px',
          padding:'16px',
          background:'var(--gold-pale)',
          border:'1px solid rgba(200,151,58,0.25)',
          borderRadius:'var(--radius)',
          display:'flex',
          alignItems:'center',
          gap:'12px'
        }
      },
        React.createElement('i', { className:'ti ti-bulb', style:{color:'var(--gold)', fontSize:'20px'} }),
        React.createElement('div', { style:{flex:1} },
          React.createElement('p', { style:{fontSize:'13.5px', fontWeight:500, color:'var(--navy)', marginBottom:'2px'} }, 'Tidak menemukan jawaban yang sesuai?'),
          React.createElement('p', { style:{fontSize:'12.5px', color:'var(--text-muted)'} }, 'Posting pertanyaan baru dan bantu angkatan berikutnya!')
        ),
        React.createElement('button', { className:'btn btn-gold' },
          React.createElement('i', { className:'ti ti-plus' }),
          ' Post Pertanyaan'
        )
      )
    )
  );
}

function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  return React.createElement('div', null,
    React.createElement('div', { className:'page-header' },
      React.createElement('h1', null, '☁️ Upload Materi'),
      React.createElement('p', null, 'Bagikan catatan, tugas, atau slide presentasi untuk membantu angkatan berikutnya.')
    ),
    React.createElement('div', { className:'upload-form-container' },
      React.createElement('form', null,
        React.createElement('div', { className:'form-group' },
          React.createElement('label', { className:'form-label' }, 'Judul Dokumen'),
          React.createElement('input', { type:'text', className:'form-input', placeholder:'Contoh: Ringkasan Materi UAS Sistem Operasi' })
        ),
        React.createElement('div', { className:'settings-row' },
          React.createElement('div', { className:'form-group' },
            React.createElement('label', { className:'form-label' }, 'Mata Kuliah'),
            React.createElement('select', { className:'form-input', style:{appearance:'auto'} },
              React.createElement('option', null, 'Pilih Mata Kuliah...'),
              mockCourses.map(c => React.createElement('option', { key:c.id }, c.name))
            )
          ),
          React.createElement('div', { className:'form-group' },
            React.createElement('label', { className:'form-label' }, 'Tingkat Kesulitan'),
            React.createElement('select', { className:'form-input', style:{appearance:'auto'} },
              React.createElement('option', null, 'Dasar'),
              React.createElement('option', null, 'Menengah'),
              React.createElement('option', null, 'Lanjutan')
            )
          )
        ),
        React.createElement('div', { className:'form-group' },
          React.createElement('label', { className:'form-label' }, 'Deskripsi (Opsional)'),
          React.createElement('textarea', { className:'form-input', rows:3, placeholder:'Ceritakan sedikit tentang dokumen ini...' })
        ),
        React.createElement('div', { 
          className:`upload-zone ${dragActive ? 'active' : ''}`, 
          onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrag,
          style: { borderColor: dragActive ? 'var(--navy)' : 'var(--border-strong)', backgroundColor: dragActive ? 'rgba(26,39,68,0.04)' : 'var(--cream)' }
        },
          React.createElement('div', { className:'upload-zone-icon' }, React.createElement('i', { className:'ti ti-cloud-upload' })),
          React.createElement('div', { className:'upload-zone-text' }, 'Seret & lepas dokumen ke sini, atau klik untuk memilih'),
          React.createElement('div', { className:'upload-zone-sub' }, 'Mendukung PDF, DOCX, PPTX, dan ZIP (Maks 50MB)')
        ),
        React.createElement('div', { style:{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'24px'} },
          React.createElement('button', { type:'button', className:'btn btn-ghost' }, 'Batal'),
          React.createElement('button', { type:'button', className:'btn btn-primary' }, React.createElement('i', { className:'ti ti-send' }), ' Upload Dokumen')
        )
      )
    )
  );
}

function CoursesPage() {
  return React.createElement('div', null,
    React.createElement('div', { className:'page-header' },
      React.createElement('div', { style:{display:'flex', alignItems:'center', justifyContent:'space-between'} },
        React.createElement('div', null,
          React.createElement('h1', null, '📚 Mata Kuliah'),
          React.createElement('p', null, 'Jelajahi repositori pengetahuan berdasarkan mata kuliah.')
        ),
        React.createElement('div', { style:{position:'relative', width:'250px'} },
          React.createElement('i', { className:'ti ti-search', style:{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:'12px'} }),
          React.createElement('input', { type:'text', placeholder:'Cari mata kuliah...', className:'form-input', style:{paddingLeft:'30px', borderRadius:'20px'} })
        )
      )
    ),
    React.createElement('div', { className:'course-grid' },
      mockCourses.map(course => 
        React.createElement('div', { key:course.id, className:'course-card' },
          React.createElement('span', { className:'course-code' }, course.code),
          React.createElement('h3', { className:'course-title' }, course.name),
          React.createElement('ul', { className:'course-meta-list' },
            React.createElement('li', null, React.createElement('i', { className:'ti ti-user-tie' }), course.lecturer),
            React.createElement('li', null, React.createElement('i', { className:'ti ti-stack' }), `${course.sks} SKS · Semester ${course.sem}`),
            React.createElement('li', { style:{marginTop:'12px', borderTop:'1px solid var(--border)', paddingTop:'12px'} }, 
              React.createElement('i', { className:'ti ti-file-text', style:{color:'var(--gold)'} }), `${course.docs} Dokumen`
            ),
            React.createElement('li', null, React.createElement('i', { className:'ti ti-messages', style:{color:'var(--sage)'} }), `${course.threads} Thread Q&A`)
          )
        )
      )
    )
  );
}

function AnalyticsPage() {
  const maxIpk = 4.0;
  return React.createElement('div', null,
    React.createElement('div', { className:'page-header' },
      React.createElement('h1', null, '📈 Analytics & Performa'),
      React.createElement('p', null, 'Tinjau perkembangan akademik dan keaktifanmu di platform.')
    ),
    React.createElement('div', null,
      React.createElement('div', null,
        React.createElement('div', { className:'chart-container' },
          React.createElement('h3', { className:'card-title', style:{marginBottom:'8px'} }, 'Grafik IPK Per Semester'),
          React.createElement('p', { className:'text-muted text-xs' }, 'Perkembangan Indeks Prestasi Kumulatif selama studi'),
          React.createElement('div', { className:'chart-area' },
            React.createElement('div', { className:'chart-y-axis' },
              React.createElement('span', null, '4.0'),
              React.createElement('span', null, '3.5'),
              React.createElement('span', null, '3.0'),
              React.createElement('span', null, '2.5'),
              React.createElement('span', null, '2.0')
            ),
            gpaData.map((data, i) => {
              const minVal = 2.0;
              const range = 2.0;
              const heightPercent = Math.max(0, ((data.ipk - minVal) / range) * 100);
              return React.createElement('div', { key:i, className:'chart-bar-group' },
                React.createElement('div', { className:'chart-value' }, data.ipk.toFixed(2)),
                React.createElement('div', { className:'chart-bar', style:{height:`${heightPercent}%`} }),
                React.createElement('div', { className:'chart-label' }, `Sem ${data.sem}`)
              );
            })
          )
        ),
        React.createElement('div', { className:'stats-grid', style:{gridTemplateColumns:'repeat(2, 1fr)'} },
          React.createElement(StatCard, { icon:'ti ti-school', iconClass:'blue', label:'IPK Saat Ini', value:'3.85', trend:'Cum Laude' }),
          React.createElement(StatCard, { icon:'ti ti-book', iconClass:'gold', label:'Total SKS', value:'107', trend:'Sisa 37 SKS' })
        )
      )
    )
  );
}

function SettingsPage({ user }) {
  return React.createElement('div', null,
    React.createElement('div', { className:'page-header' },
      React.createElement('h1', null, '⚙️ Pengaturan'),
      React.createElement('p', null, 'Kelola profil, preferensi notifikasi, dan keamanan akun.')
    ),
    React.createElement('div', { style:{maxWidth:'800px'} },
      React.createElement('div', { className:'settings-section' },
        React.createElement('h3', { className:'settings-title' }, 'Profil Pengguna'),
        React.createElement('div', { style:{display:'flex', gap:'20px', marginBottom:'20px', alignItems:'center'} },
          React.createElement('div', { className:'avatar', style:{width:'72px', height:'72px', fontSize:'24px', borderRadius:'16px'} }, 'MS'),
          React.createElement('div', null,
            React.createElement('button', { className:'btn btn-ghost btn-sm', style:{marginBottom:'8px'} }, 'Ubah Avatar'),
            React.createElement('div', { className:'text-muted text-xs' }, 'Format JPG, PNG, atau GIF. Maksimal 2MB.')
          )
        ),
        React.createElement('div', { className:'settings-row' },
          React.createElement('div', { className:'form-group' },
            React.createElement('label', { className:'form-label' }, 'Nama Lengkap'),
            React.createElement('input', { type:'text', className:'form-input', defaultValue:user?.name || 'M. Syahrul' })
          ),
          React.createElement('div', { className:'form-group' },
            React.createElement('label', { className:'form-label' }, 'NIM / NIP'),
            React.createElement('input', { type:'text', className:'form-input', defaultValue:user?.nim || '2006123456', disabled:true, style:{background:'var(--cream)'} })
          )
        ),
        React.createElement('div', { className:'settings-row' },
          React.createElement('div', { className:'form-group' },
            React.createElement('label', { className:'form-label' }, 'Email Kampus'),
            React.createElement('input', { type:'email', className:'form-input', defaultValue:'syahrul.m@ui.ac.id' })
          ),
          React.createElement('div', { className:'form-group' },
            React.createElement('label', { className:'form-label' }, 'Semester'),
            React.createElement('select', { className:'form-input', style:{appearance:'auto'} },
              React.createElement('option', null, 'Semester 5'),
              React.createElement('option', null, 'Semester 6')
            )
          )
        ),
        React.createElement('button', { className:'btn btn-primary' }, 'Simpan Profil')
      ),
      React.createElement('div', { className:'settings-section' },
        React.createElement('h3', { className:'settings-title' }, 'Preferensi Notifikasi'),
        React.createElement('div', { className:'settings-flex' },
          React.createElement('div', null,
            React.createElement('div', { style:{fontWeight:500, color:'var(--navy)', fontSize:'14px'} }, 'Notifikasi Email'),
            React.createElement('div', { className:'text-muted text-xs', style:{marginTop:'4px'} }, 'Terima update via email untuk jawaban Q&A dan komentar dokumen.')
          ),
          React.createElement('label', { className:'toggle-switch' },
            React.createElement('input', { type:'checkbox', defaultChecked:true }),
            React.createElement('span', { className:'slider' })
          )
        ),
        React.createElement('div', { className:'settings-flex' },
          React.createElement('div', null,
            React.createElement('div', { style:{fontWeight:500, color:'var(--navy)', fontSize:'14px'} }, 'Notifikasi Push (Browser)'),
            React.createElement('div', { className:'text-muted text-xs', style:{marginTop:'4px'} }, 'Terima notifikasi real-time di browser Anda.')
          ),
          React.createElement('label', { className:'toggle-switch' },
            React.createElement('input', { type:'checkbox', defaultChecked:false }),
            React.createElement('span', { className:'slider' })
          )
        )
      )
    )
  );
}

// ────────────────────────────────────────────
// MAIN APP
// ────────────────────────────────────────────

function ProjectPage() {
  const { useEffect } = React;
  
  useEffect(() => {
    const heatmap = document.getElementById('heatmap');
    if (heatmap) {
      heatmap.innerHTML = '';
      const intensityColors = ['#F1EFE8','#EEEDFE','#AFA9EC','#7F77DD','#534AB7','#3C3489'];
      const data = [
        0,0,1,2,1,0,1,2,3,4,3,4,5,
        1,2,3,2,1,2,3,4,5,5,4,3,2,
        0,1,2,3,4,3,2,1,0,1,2,3,4,
        2,1,0,0,1,2,3,4,3,2,1,0,1,
        0,0,0,1,2,3,4,5,4,3,2,1,0,
        1,2,3,4,5,4,3,2,1,0,0,1,2,
        3,4,5,5,4,3,2,1,0,1,2,3,4,
      ];
      data.forEach(v => {
        const cell = document.createElement('div');
        cell.className = 'cb-heatmap-cell';
        cell.style.background = intensityColors[v];
        cell.title = v === 0 ? 'Tidak ada aktivitas' : v + ' kontribusi';
        heatmap.appendChild(cell);
      });
    }
  }, []);

  return React.createElement('div', null,
    React.createElement('div', { className: 'page-header' },
      React.createElement('h1', null, '📊 Proyek Kelompok'),
      React.createElement('p', null, 'Manajemen kolaborasi, pembagian tugas, dan pelacakan kontribusi yang terintegrasi.')
    ),
    React.createElement('div', { dangerouslySetInnerHTML: { __html: `<div class="cb-project-hero">
      <div>
        <div class="cb-project-title">📊 Analisis Dampak Media Sosial terhadap Perilaku Konsumen Gen Z</div>
        <div class="cb-project-meta">Mata Kuliah: Manajemen Pemasaran Digital · Dosen: Dr. Rina Kusuma · Kelompok 4 · 4 Anggota</div>
        <div class="cb-integrations">
          <a class="cb-integration-chip" href="#" onclick="return false">
            <span class="cb-integration-icon" style="background:#4285F4;"></span>
            Google Drive
          </a>
          <a class="cb-integration-chip" href="#" onclick="return false">
            <span class="cb-integration-icon" style="background:#00C4CC;border-radius:4px;"></span>
            Canva
          </a>
          <a class="cb-integration-chip" href="#" onclick="return false">
            <span class="cb-integration-icon" style="background:#000;border-radius:3px;"></span>
            Notion
          </a>
          <a class="cb-integration-chip" href="#" onclick="return false">
            <i class="ti ti-mail" style="font-size:14px;color:#888;" aria-hidden="true"></i>
            Kirim ke Email Dosen
          </a>
        </div>
      </div>
      <div>
        <div class="cb-deadline-card">
          <div class="cb-deadline-label">Deadline</div>
          <div class="cb-deadline-value">12</div>
          <div class="cb-deadline-sub">Jul 2025 · 18 hari lagi</div>
        </div>
        <div class="cb-stat-row" style="margin-top:8px;">
          <div class="cb-stat">
            <div class="cb-stat-num">7</div>
            <div class="cb-stat-lbl">Selesai</div>
          </div>
          <div class="cb-stat">
            <div class="cb-stat-num">4</div>
            <div class="cb-stat-lbl">Proses</div>
          </div>
          <div class="cb-stat">
            <div class="cb-stat-num">3</div>
            <div class="cb-stat-lbl">Tertunda</div>
          </div>
        </div>
      </div>
    </div>

    <div class="cb-grid-2">

      <div class="cb-card">
        <div class="cb-card-header">
          <div class="cb-card-title">📋 Task Board</div>
          <button class="cb-export-btn" onclick="sendPrompt('Add a new task to CollaBoard for the presentation slides')">
            <i class="ti ti-plus" aria-hidden="true"></i> Tambah Task ↗
          </button>
        </div>
        <div class="cb-col-gap">
          <div>
            <div class="cb-section-title">To Do <span class="cb-badge cb-badge-todo">3</span></div>
            <div class="cb-kanban">
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#888780;"></div>
                <span class="cb-task-name">Desain slide presentasi</span>
                <div class="cb-task-assignee" style="background:#EEEDFE;color:#534AB7;">AR</div>
                <span class="cb-task-due urgent"><i class="ti ti-alert-triangle" style="font-size:11px;" aria-hidden="true"></i> 3 hari</span>
              </div>
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#888780;"></div>
                <span class="cb-task-name">Review literatur tambahan</span>
                <div class="cb-task-assignee" style="background:#FBEAF0;color:#993556;">DN</div>
                <span class="cb-task-due">7 hari</span>
              </div>
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#888780;"></div>
                <span class="cb-task-name">Buat kesimpulan bab 5</span>
                <div class="cb-task-assignee" style="background:#E1F5EE;color:#0F6E56;">BS</div>
                <span class="cb-task-due">10 hari</span>
              </div>
            </div>
          </div>
          <div>
            <div class="cb-section-title">In Progress <span class="cb-badge cb-badge-inprogress">4</span></div>
            <div class="cb-kanban">
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#7F77DD;"></div>
                <span class="cb-task-name">Analisis data kuesioner</span>
                <div class="cb-task-assignee" style="background:#EEEDFE;color:#534AB7;">AR</div>
                <span class="cb-task-due">5 hari</span>
              </div>
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#7F77DD;"></div>
                <span class="cb-task-name">Penulisan bab 4 (Hasil)</span>
                <div class="cb-task-assignee" style="background:#FAECE7;color:#993C1D;">CF</div>
                <span class="cb-task-due">6 hari</span>
              </div>
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#7F77DD;"></div>
                <span class="cb-task-name">Infografis distribusi usia</span>
                <div class="cb-task-assignee" style="background:#FBEAF0;color:#993556;">DN</div>
                <span class="cb-task-due">4 hari</span>
              </div>
            </div>
          </div>
          <div>
            <div class="cb-section-title">Done <span class="cb-badge cb-badge-done">7</span></div>
            <div class="cb-kanban">
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#639922;"></div>
                <span class="cb-task-name done">Distribusi kuesioner (150 resp.)</span>
                <div class="cb-task-assignee" style="background:#E1F5EE;color:#0F6E56;">BS</div>
                <span class="cb-task-due">Selesai</span>
              </div>
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#639922;"></div>
                <span class="cb-task-name done">Penulisan bab 1, 2, 3</span>
                <div class="cb-task-assignee" style="background:#EEEDFE;color:#534AB7;">AR</div>
                <span class="cb-task-due">Selesai</span>
              </div>
              <div class="cb-task-item">
                <div class="cb-task-dot" style="background:#639922;"></div>
                <span class="cb-task-name done">Studi literatur utama</span>
                <div class="cb-task-assignee" style="background:#FAECE7;color:#993C1D;">CF</div>
                <span class="cb-task-due">Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cb-col-gap">

        <div class="cb-card">
          <div class="cb-card-header">
            <div class="cb-card-title">🔥 Contribution Heatmap</div>
            <button class="cb-export-btn" onclick="sendPrompt('Export proof of contribution report for CollaBoard project as PDF')">
              <i class="ti ti-download" aria-hidden="true"></i> Export ↗
            </button>
          </div>

          <div style="margin-bottom:12px;">
            <div class="cb-member-row">
              <div class="cb-avatar" style="background:#EEEDFE;color:#534AB7;width:28px;height:28px;font-size:10px;font-weight:600;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">AR</div>
              <div class="cb-member-info">
                <div class="cb-member-name">Arka Ramadhan</div>
                <div class="cb-member-role">Ketua · Penulis</div>
                <div class="cb-progress-bar-wrap" style="margin-top:5px;">
                  <div class="cb-progress-bar" style="width:78%;background:#7F77DD;"></div>
                </div>
              </div>
              <div class="cb-member-pct">78%</div>
            </div>
            <div class="cb-member-row">
              <div class="cb-avatar" style="background:#E1F5EE;color:#0F6E56;width:28px;height:28px;font-size:10px;font-weight:600;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">BS</div>
              <div class="cb-member-info">
                <div class="cb-member-name">Bella Safira</div>
                <div class="cb-member-role">Data Collector</div>
                <div class="cb-progress-bar-wrap" style="margin-top:5px;">
                  <div class="cb-progress-bar" style="width:65%;background:#1D9E75;"></div>
                </div>
              </div>
              <div class="cb-member-pct">65%</div>
            </div>
            <div class="cb-member-row">
              <div class="cb-avatar" style="background:#FAECE7;color:#993C1D;width:28px;height:28px;font-size:10px;font-weight:600;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">CF</div>
              <div class="cb-member-info">
                <div class="cb-member-name">Cinta Fauzia</div>
                <div class="cb-member-role">Analis · Penulis</div>
                <div class="cb-progress-bar-wrap" style="margin-top:5px;">
                  <div class="cb-progress-bar" style="width:55%;background:#D85A30;"></div>
                </div>
              </div>
              <div class="cb-member-pct">55%</div>
            </div>
            <div class="cb-member-row">
              <div class="cb-avatar" style="background:#FBEAF0;color:#993556;width:28px;height:28px;font-size:10px;font-weight:600;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">DN</div>
              <div class="cb-member-info">
                <div class="cb-member-name">Dito Nugraha</div>
                <div class="cb-member-role">Desainer</div>
                <div class="cb-progress-bar-wrap" style="margin-top:5px;">
                  <div class="cb-progress-bar" style="width:42%;background:#D4537E;"></div>
                </div>
              </div>
              <div class="cb-member-pct">42%</div>
            </div>
          </div>

          <div class="cb-card-title" style="font-size:12px;margin-bottom:8px;color:var(--color-text-secondary);">Aktivitas 13 Minggu Terakhir — Arka Ramadhan</div>
          <div class="cb-heatmap-wrap">
            <div class="cb-week-labels">
              <span class="cb-week-label">Apr</span>
              <span class="cb-week-label">Apr</span>
              <span class="cb-week-label">Mei</span>
              <span class="cb-week-label">Mei</span>
              <span class="cb-week-label">Jun</span>
              <span class="cb-week-label">Jun</span>
              <span class="cb-week-label">Jun</span>
              <span class="cb-week-label">Jul</span>
            </div>
            <div class="cb-heatmap" id="heatmap"></div>
            <div class="cb-heatmap-legend">
              <span>Kurang</span>
              <div class="cb-heatmap-legend-swatch" style="background:#EEEDFE;"></div>
              <div class="cb-heatmap-legend-swatch" style="background:#AFA9EC;"></div>
              <div class="cb-heatmap-legend-swatch" style="background:#7F77DD;"></div>
              <div class="cb-heatmap-legend-swatch" style="background:#534AB7;"></div>
              <div class="cb-heatmap-legend-swatch" style="background:#3C3489;"></div>
              <span>Banyak</span>
            </div>
          </div>
        </div>

        <div class="cb-card">
          <div class="cb-card-header">
            <div class="cb-card-title">🎓 Academic Timeline</div>
            <span class="cb-badge cb-badge-todo" style="font-size:11px;">UTS Warning</span>
          </div>
          <div class="cb-uts-warning">
            <i class="ti ti-alert-triangle" style="font-size:18px;color:#854F0B;flex-shrink:0;" aria-hidden="true"></i>
            <div>
              <div class="cb-uts-label">⚠ Jadwal UTS Terdeteksi</div>
              <div class="cb-uts-text">3 anggota (AR, BS, CF) memiliki UTS 24–28 Jun. Deadline internal otomatis digeser dari 26 Jun → 22 Jun.</div>
            </div>
          </div>
          <div style="margin-top:14px;">
            <div class="cb-section-title">Fase Proyek (Jun – Jul)</div>
            <div style="padding: 6px 0;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:12px;color:var(--color-text-secondary);width:80px;flex-shrink:0;">Penulisan</span>
                <div style="flex:1;background:var(--color-background-secondary);border-radius:4px;height:16px;overflow:hidden;position:relative;">
                  <div style="width:70%;height:100%;background:#7F77DD;border-radius:4px;"></div>
                  <span style="position:absolute;right:6px;top:1px;font-size:10px;color:var(--color-text-tertiary);">70%</span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:12px;color:var(--color-text-secondary);width:80px;flex-shrink:0;">Analisis</span>
                <div style="flex:1;background:var(--color-background-secondary);border-radius:4px;height:16px;overflow:hidden;position:relative;">
                  <div style="width:50%;height:100%;background:#1D9E75;border-radius:4px;"></div>
                  <span style="position:absolute;right:6px;top:1px;font-size:10px;color:var(--color-text-tertiary);">50%</span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:12px;color:var(--color-text-secondary);width:80px;flex-shrink:0;">Desain</span>
                <div style="flex:1;background:var(--color-background-secondary);border-radius:4px;height:16px;overflow:hidden;position:relative;">
                  <div style="width:30%;height:100%;background:#D4537E;border-radius:4px;"></div>
                  <div style="position:absolute;left:30%;height:100%;background:repeating-linear-gradient(90deg,#FAC775 0,#FAC775 6px,transparent 6px,transparent 12px);width:26%;opacity:0.7;"></div>
                  <span style="position:absolute;right:6px;top:1px;font-size:10px;color:#854F0B;font-weight:600;">⚠ UTS</span>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:12px;color:var(--color-text-secondary);width:80px;flex-shrink:0;">Presentasi</span>
                <div style="flex:1;background:var(--color-background-secondary);border-radius:4px;height:16px;overflow:hidden;">
                  <div style="width:10%;height:100%;background:#888780;border-radius:4px;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="cb-card">
      <div class="cb-card-header">
        <div class="cb-card-title">🔔 Notification Hub</div>
        <span style="font-size:12px;color:var(--color-text-tertiary);">4 belum dibaca</span>
      </div>
      <div>
        <div class="cb-notif-item">
          <div class="cb-notif-icon" style="background:#EEEDFE;color:#534AB7;"><i class="ti ti-alert-triangle" aria-hidden="true"></i></div>
          <div class="cb-notif-body">
            <div class="cb-notif-text"><strong>Deadline terdekat!</strong> "Desain slide presentasi" jatuh tempo dalam 3 hari. Ditugaskan ke Arka Ramadhan.</div>
            <div class="cb-notif-time">Hari ini, 09.00</div>
          </div>
        </div>
        <div class="cb-notif-item">
          <div class="cb-notif-icon" style="background:#FAEEDA;color:#854F0B;"><i class="ti ti-calendar-event" aria-hidden="true"></i></div>
          <div class="cb-notif-body">
            <div class="cb-notif-text"><strong>UTS terdeteksi</strong> untuk 3 anggota (24–28 Jun). Deadline internal digeser otomatis — periksa timeline.</div>
            <div class="cb-notif-time">Kemarin, 15.30</div>
          </div>
        </div>
        <div class="cb-notif-item">
          <div class="cb-notif-icon" style="background:#E1F5EE;color:#0F6E56;"><i class="ti ti-check" aria-hidden="true"></i></div>
          <div class="cb-notif-body">
            <div class="cb-notif-text"><strong>Bella Safira</strong> menyelesaikan "Distribusi kuesioner (150 responden)" dan mengupload hasil ke Google Drive.</div>
            <div class="cb-notif-time">2 hari lalu</div>
          </div>
        </div>
        <div class="cb-notif-item">
          <div class="cb-notif-icon" style="background:#FAECE7;color:#993C1D;"><i class="ti ti-at" aria-hidden="true"></i></div>
          <div class="cb-notif-body">
            <div class="cb-notif-text"><strong>Cinta Fauzia</strong> menyebutmu di Bab 4: "@Arka mohon cek data Tabel 4.2 ya, kayaknya ada yang salah input 🙏"</div>
            <div class="cb-notif-time">3 hari lalu</div>
          </div>
        </div>
      </div>
    </div>` } })
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  if (!user) {
    return React.createElement(LoginPage, { onLogin: setUser });
  }

  const renderPage = () => {
    switch(activeTab) {
      case 'dashboard': return React.createElement(Dashboard, { onNavigate: setActiveTab });
      case 'projects': return React.createElement(ProjectPage, null);
      case 'vault': return React.createElement(VaultPage, null);
      case 'qa': return React.createElement(QAPage, { user });
      case 'upload': return React.createElement(UploadPage, null);
      case 'courses': return React.createElement(CoursesPage, null);
      case 'analytics': return React.createElement(AnalyticsPage, null);
      case 'settings': return React.createElement(SettingsPage, { user });
      default:
        return React.createElement('div', { className:'empty-state' },
          React.createElement('i', { className:'ti ti-tools' }),
          React.createElement('p', null, 'Halaman ini sedang dalam pengembangan.')
        );
    }
  };

  const pageTitles = {
    dashboard: 'Dashboard',
    projects: 'Proyek Kelompok',
    vault: 'Knowledge Vault',
    qa: 'Generational Q&A',
    upload: 'Upload Materi',
    courses: 'Mata Kuliah',
    analytics: 'Analytics',
    settings: 'Pengaturan'
  };

  return React.createElement('div', { className:'app' },
    React.createElement(Sidebar, { activeTab, onTabChange: setActiveTab, isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    React.createElement('div', { className:'main' },
      React.createElement('div', { className:'topbar' },
        React.createElement('button', { 
          className: 'mobile-menu-btn', 
          onClick: () => setSidebarOpen(true),
          style: { marginRight: '16px' } 
        }, 
          React.createElement('i', { className: 'ti ti-menu-2' })
        ),
        React.createElement('span', { className:'topbar-title' }, pageTitles[activeTab] || 'LegacyLearn'),
        React.createElement('div', { className:'topbar-search' },
          React.createElement('i', { className:'ti ti-search search-icon' }),
          React.createElement('input', { type:'text', placeholder:'Cari dokumen, pertanyaan, atau topik...' })
        ),
        React.createElement('div', { className:'topbar-actions' },
          React.createElement('button', { className:'btn btn-ghost btn-sm' },
            React.createElement('i', { className:'ti ti-bell' }),
            React.createElement('span', {
              style:{
                width:'7px', height:'7px',
                background:'var(--gold)',
                borderRadius:'50%',
                position:'absolute',
                marginTop:'-8px',
                marginLeft:'-4px'
              }
            })
          ),
          React.createElement('button', { className:'btn btn-primary btn-sm', onClick: () => setActiveTab('upload') },
            React.createElement('i', { className:'ti ti-plus' }),
            ' Kontribusi'
          )
        )
      ),
      React.createElement('div', { className:'content' },
        renderPage()
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
