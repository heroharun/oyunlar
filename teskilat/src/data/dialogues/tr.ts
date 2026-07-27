/** Tüm arayüz metinleri — kod içinde sabit metin kullanılmaz (GDD §31 kural 7-8). */
export const TR = {
  menu: {
    kicker: 'TEŞKİLAT',
    title: 'GÖLGE PROTOKOL',
    slogan: 'Operasyon sahada değil, zihinde başlar.',
    start: 'GÖREVE BAŞLA',
    privacy: 'GİZLİLİK',
    resetProgress: 'İLERLEMEYİ SIFIRLA',
    resetDone: 'Yerel kayıt silindi.',
    privacyText:
      'Bu oyun hesap, reklam ve kişisel veri kullanmaz.\n' +
      'Kamera, mikrofon, konum izni istemez.\n' +
      'İlerleme yalnızca bu cihazda saklanır\n' +
      've istediğiniz an silinebilir.',
    close: 'KAPAT',
    keyboardHint: 'Enter: başlat'
  },
  briefing: {
    kicker: 'GÖREV BRİFİNGİ',
    fileStamp: 'DOSYA: GİZLİ',
    objectiveLabel: 'HEDEF',
    durationLabel: 'TAHMİNİ SÜRE',
    minutes: 'dk',
    proceed: 'OPERASYONA BAŞLA',
    back: 'GERİ'
  },
  cameraPuzzle: {
    kicker: 'KAMERA ANALİZİ',
    wrongPick: 'Zaman çizelgesi bu seçimle uyuşmuyor.',
    hintButton: 'İPUCU',
    hintExhausted: 'İpucu hakkı doldu. Saatleri karşılaştır.',
    resetButton: 'SIFIRLA',
    doneToast: 'Zaman çizelgesi doğrulandı.',
    keyboardHint: '1-4: kart seç',
    progressLabel: 'SIRALANAN'
  },
  result: {
    kicker: 'OPERASYON RAPORU',
    grades: {
      sessiz: 'SESSİZ BAŞARI',
      kontrollu: 'KONTROLLÜ BAŞARI',
      riskli: 'RİSKLİ BAŞARI'
    },
    gradeDesc: {
      sessiz: 'Tek hatasız analiz. Karşı taraf hiçbir şey fark etmedi.',
      kontrollu: 'Hedefe ulaşıldı; küçük izler kaldı, temizlendi.',
      riskli: 'Analiz tamamlandı ancak dikkat çekme riski oluştu.'
    },
    metrics: {
      secrecy: 'GİZLİLİK',
      accuracy: 'DOĞRULUK',
      civilian: 'SİVİL GÜVENLİĞİ'
    },
    statsMistakes: 'Hatalı seçim',
    statsHints: 'Kullanılan ipucu',
    statsTime: 'Süre',
    seconds: 'sn',
    nextTeaser:
      'Araç B işaretlendi. Ancak plakayı kapatan gölge,\nbir sonraki dosyanın ilk sayfası olacak.',
    replay: 'TEKRAR OYNA',
    menu: 'ANA MENÜ'
  }
} as const;
