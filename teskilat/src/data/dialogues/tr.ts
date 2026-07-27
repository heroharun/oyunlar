/** Tüm arayüz metinleri — kod içinde sabit metin kullanılmaz (GDD §31 kural 7-8). */
export const TR = {
  menu: {
    kicker: 'TEŞKİLAT',
    title: 'GÖLGE PROTOKOL',
    slogan: 'Operasyon sahada değil, zihinde başlar.',
    start: 'GÖREVE BAŞLA',
    howTo: 'NASIL OYNANIR',
    howToText:
      '· Her bölüm 2-4 dakikalık bir istihbarat görevidir.\n' +
      '· Kartlara DOKUNARAK seçim yaparsın; sürükleme yok.\n' +
      '· Yanlış seçim oyunu bitirmez: neden yanlış olduğu\n' +
      '  açıklanır, tekrar denersin.\n' +
      '· İPUCU düğmesi görev başına 2 kez ücretsizdir.\n' +
      '· Kararların sezona işlenir: Güven, Gizlilik Riski,\n' +
      '  Kanıt ve Ekip Bağı.\n' +
      '· Şüphe tablosunu izle: hain dört kişiden biri.\n' +
      '· Bölümler sırayla açılır; istediğin an tekrar\n' +
      '  oynayabilirsin.\n' +
      '· Klavye: 1-4 seçim, Enter devam.',
    sound: 'SES',
    privacy: 'GİZLİLİK',
    resetProgress: 'İLERLEMEYİ SIFIRLA',
    resetDone: 'Yerel kayıt silindi.',
    privacyText:
      'Bu oyun hesap, reklam ve kişisel veri kullanmaz.\n' +
      'Kamera, mikrofon, konum izni istemez.\n' +
      'İlerleme yalnızca bu cihazda saklanır\n' +
      've istediğiniz an silinebilir.',
    close: 'KAPAT',
    musicLabel: 'MÜZİK',
    sfxLabel: 'EFEKT',
    on: 'AÇIK',
    off: 'KAPALI',
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
  common: {
    continue: 'DEVAM',
    confirm: 'ONAYLA',
    hintButton: 'İPUCU',
    hintExhausted: 'İpucu hakkı doldu.',
    resetButton: 'SIFIRLA',
    keyboardPick: '1-4: seç · Enter: devam'
  },
  cameraPuzzle: {
    kicker: 'KAMERA ANALİZİ',
    wrongPick: 'Zaman çizelgesi bu seçimle uyuşmuyor.',
    doneToast: 'Zaman çizelgesi doğrulandı.',
    progressLabel: 'SIRALANAN'
  },
  contradiction: {
    kicker: 'ÇELİŞKİ TESPİTİ',
    wrongPick: 'Bu ifade diğer kayıtlarla tutarlı görünüyor.',
    doneToast: 'Çelişki dosyaya işlendi.'
  },
  signal: {
    kicker: 'SİNYAL ANALİZİ',
    doneToast: 'Kaynak kilitlendi.'
  },
  specialist: {
    kicker: 'UZMAN GÖREVLENDİRME',
    countLabel: 'SEÇİLEN',
    needTwo: 'Bu operasyon için iki uzman seçmelisin.'
  },
  route: {
    kicker: 'ROTA PLANLAMA',
    mapStart: 'EKİP',
    mapTarget: 'ARAÇ B',
    selectedLabel: 'SEÇİLİ ROTA',
    noneSelected: 'Bir rota seç.'
  },
  decision: {
    kicker: 'KRİTİK KARAR',
    noneSelected: 'Bir yöntem seç.'
  },
  episodes: {
    kicker: 'OPERASYON DOSYALARI',
    subtitle: 'Bölümler sırayla açılır. Kararların sezona işlenir.',
    locked: 'KİLİTLİ',
    play: 'OYNA',
    done: 'TAMAM',
    lockedToast: 'Önce önceki dosyayı tamamla.',
    file1Title: 'BÖLÜM 1-8 · KAYIP SİNYAL',
    file1Detail: 'Kamera, çelişki, sinyal, rota, kritik karar.',
    actLabel: 'PERDE',
    back: 'ANA MENÜ',
    metrics: {
      trust: 'GÜVEN',
      stealth: 'GİZLİLİK RİSKİ',
      evidence: 'KANIT'
    },
    campaignReset: 'SEZONU SIFIRLA',
    campaignResetDone: 'Sezon ilerlemesi sıfırlandı.'
  },
  episodeResult: {
    kicker: 'BÖLÜM RAPORU',
    suspicionTitle: 'HAİNLİK ŞÜPHE TABLOSU',
    suspects: {
      amir: 'Operasyon Amiri',
      teknik: 'Teknik Uzman',
      saha: 'Saha Ajanı',
      kaynak: 'Haber Kaynağı'
    },
    next: 'SONRAKİ BÖLÜM',
    files: 'DOSYALAR',
    campaignLabel: 'SEZON ETKİSİ'
  },
  suspicionMeter: 'ŞÜPHE',
  result: {
    kicker: 'OPERASYON RAPORU',
    grades: {
      sessiz: 'SESSİZ BAŞARI',
      kontrollu: 'KONTROLLÜ BAŞARI',
      riskli: 'RİSKLİ BAŞARI',
      desifre: 'OPERASYON DEŞİFRE OLDU'
    },
    metrics: {
      secrecy: 'GİZLİLİK',
      accuracy: 'DOĞRULUK',
      civilian: 'SİVİL GÜVENLİĞİ'
    },
    statsMistakes: 'Hatalı seçim',
    statsHints: 'İpucu',
    statsTime: 'Süre',
    seconds: 'sn',
    badgeLabel: 'YENİ ROZET',
    badges: {
      'sessiz-operator': 'Sessiz Operatör',
      'keskin-analist': 'Keskin Analist',
      'sifir-sivil-risk': 'Sıfır Sivil Risk',
      'tek-seferde-cozum': 'Tek Seferde Çözüm',
      'golge-protokol': 'Gölge Protokol'
    },
    replay: 'TEKRAR OYNA',
    menu: 'ANA MENÜ'
  }
} as const;
