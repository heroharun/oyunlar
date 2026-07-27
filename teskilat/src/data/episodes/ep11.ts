import type { SuspectId } from '../../systems/Campaign';

/** Bölüm 11 — İçeriden Biri (Genişletme GDD §4). */

export interface SuspectStatement {
  suspect: SuspectId;
  source: string;
  text: string;
}

export interface LogEntry {
  time: string;
  text: string;
  order: number;
}

export const EP11 = {
  id: 'ep11',
  title: 'BÖLÜM 11 · İÇERİDEN BİRİ',
  kicker: 'PERDE 3 · HAİNİN GÖLGESİ',
  briefing: 'Operasyon saatleri İÇERİDEN sızdı. İfadeler ve sistem kayıtları önünde.',
  statementInstruction: 'Dört ifadeden biri sistem kayıtlarıyla çelişiyor. Bul.',
  statements: [
    {
      suspect: 'amir',
      source: 'OPERASYON AMİRİ',
      text: '"Operasyon saatlerini yalnızca kapalı toplantıda paylaştım."'
    },
    {
      suspect: 'teknik',
      source: 'TEKNİK UZMAN',
      text: '"O gece sisteme hiç bağlanmadım, evdeydim."'
    },
    {
      suspect: 'saha',
      source: 'SAHA AJANI',
      text: '"Arşiv katına yetkim yok, hiç inmedim."'
    },
    {
      suspect: 'kaynak',
      source: 'HABER KAYNAĞI',
      text: '"Bana gelen bilgiyi yalnızca amirime ilettim."'
    }
  ] as SuspectStatement[],
  statementWrong: 'Bu ifade kayıtlarla tutarlı görünüyor.',
  statementExplanation:
    'Sistem kaydı: teknik uzmanın hesabı o gece 22.10\'da VPN ile bağlandı. ' +
    '"Hiç bağlanmadım" ifadesi yalan — ya da hesabı başkası kullandı.',
  logInstruction: 'Giriş kayıtlarını zaman sırasına diz. Sızıntının rotası ortaya çıksın.',
  logs: [
    { time: '22:10', text: 'Teknik uzman hesabı VPN ile bağlandı.', order: 0 },
    { time: '22:24', text: 'Arşivdeki operasyon dosyası açıldı.', order: 1 },
    { time: '22:31', text: 'Dosya harici belleğe kopyalandı.', order: 2 },
    { time: '22:47', text: 'Erişim kaydı silinmeye çalışıldı.', order: 3 }
  ] as LogEntry[],
  logWrong: 'Zaman çizelgesi bu sırayla uyuşmuyor.',
  leakInstruction: 'Peki dışarı sızan bilgi hangisiydi?',
  leakOptions: [
    'Ajan kimlik listesi',
    'Operasyon saatleri',
    'Depo adresleri',
    'Telsiz şifreleri'
  ],
  leakCorrectIndex: 1,
  leakWrong: 'Kayıt odasındaki dosyayı hatırla.',
  leakExplanation:
    'Sızan dosya operasyon saatleriydi — Bölüm 10\'da kayıt odasında bulduğun dosyayla aynı.',
  hints: [
    'İfadeleri 22.10 tarihli VPN kaydıyla karşılaştır.',
    'Bir dosya kopyalanmadan önce AÇILMIŞ olmalı.'
  ],
  /** İki güçlü şüpheli oluşur; hain kesinleşmez (GDD B11). */
  suspicionUpdates: [
    { suspect: 'teknik', delta: 40 },
    { suspect: 'kaynak', delta: 25 },
    { suspect: 'amir', delta: 5 },
    { suspect: 'saha', delta: 5 }
  ] as { suspect: SuspectId; delta: number }[],
  cliffhanger:
    'İki güçlü şüpheli var: hesabı kullanılan Teknik Uzman ve bilgiyi taşıyabilecek ' +
    'Haber Kaynağı. Hain henüz kesin değil. Ama artık seni de izliyor.'
} as const;
