import type { SuspectId } from '../../systems/Campaign';

/** Genel bölüm motoru veri modeli — 17 ara bölüm bu tiplerle tanımlanır. */

export type StepDelta = Partial<{
  trust: number;
  stealth: number;
  evidence: number;
  teamBond: number;
}>;

export interface InfoStep {
  kind: 'info';
  text: string;
}

export interface QuizStep {
  kind: 'quiz';
  prompt: string;
  options: string[];
  correctIndex: number;
  wrongText: string;
  explanation?: string;
}

export interface OrderStep {
  kind: 'order';
  prompt: string;
  items: { tag: string; text: string; order: number }[];
  wrongText: string;
}

export interface PickOption {
  label: string;
  detail?: string;
  delta?: StepDelta;
  feedback?: string;
  /** Final seçimlerinde: cliffhanger yerine geçen son metni. */
  ending?: string;
}

export interface PickStep {
  kind: 'pick';
  prompt: string;
  options: PickOption[];
}

export type EpStep = InfoStep | QuizStep | OrderStep | PickStep;

export interface EpisodeDef {
  id: string;
  title: string;
  kicker: string;
  briefing: string;
  cliffhanger: string;
  steps: EpStep[];
  /** Bölüm sonunda temel ödül. */
  reward: StepDelta;
  /** Her hatalı seçim gizlilik riskini bu kadar artırır. */
  stealthPerMistake?: number;
  suspicion?: { suspect: SuspectId; delta: number }[];
}

const P2 = 'PERDE 2 · İÇERİ SIZMA';
const P3 = 'PERDE 3 · HAİNİN GÖLGESİ';
const P4 = 'PERDE 4 · GÖLGE PROTOKOL';

export const GENERIC_EPISODES: Record<string, EpisodeDef> = {
  ep10: {
    id: 'ep10',
    title: 'BÖLÜM 10 · KÖR NOKTA',
    kicker: P2,
    briefing: 'Kayıt odasına ulaşman lazım. Kameralar dönüyor, devriye geziyor.',
    steps: [
      {
        kind: 'info',
        text: 'Koridordasın. Kamera-3 SAĞA döndüğünde kısa bir kör an oluşuyor. Devriye 2 dakikada bir geçiyor.'
      },
      {
        kind: 'quiz',
        prompt: 'Geçiş için doğru an hangisi?',
        options: [
          'Kamera sola dönerken',
          'Kamera sağa döndüğü an',
          'Devriye geçerken hemen arkasından',
          'Işıklar kapanınca'
        ],
        correctIndex: 1,
        wrongText: 'Kamera seni yakalamak üzereydi. Geri çekildin.',
        explanation: 'Kamera sağa dönünce koridorun solu 6 saniye kör kalıyor.'
      },
      {
        kind: 'quiz',
        prompt: 'Üç kısa rota var. Hangisi gerçekten güvenli?',
        options: [
          'A · Raf arası — temizlik arabası orada',
          'B · Yükleme bandının altı',
          'C · Duvarda "kör nokta" işaretli koridor'
        ],
        correctIndex: 1,
        wrongText: 'O "kör nokta" işareti kasıtlı bırakılmış bir TUZAK.',
        explanation: 'Bandın altı alçak ama hiçbir kameranın açısına girmiyor.'
      }
    ],
    cliffhanger:
      'Kayıt odasında bir dosya buldun: TEŞKİLATIN operasyon saatleri. Bu dosya buraya içeriden geldi.',
    reward: { evidence: 8, trust: 4 },
    stealthPerMistake: 8
  },

  ep12: {
    id: 'ep12',
    title: 'BÖLÜM 12 · SESSİZ TAKAS',
    kicker: P2,
    briefing: 'Pazar meydanında gizli bir teslimat olacak. Hedefi kaybetme.',
    steps: [
      {
        kind: 'info',
        text: 'Kaynağın notu: hedef GRİ montlu, çantayı SOL elinde taşıyor ve sık sık saatine bakıyor. Meydanda üç gri mont var.'
      },
      {
        kind: 'quiz',
        prompt: 'Hedef hangisi?',
        options: [
          'Çanta sol elde, saatine bakıyor',
          'Çantasız, telefonla konuşuyor',
          'Gri mont ama çanta sağ omuzda'
        ],
        correctIndex: 0,
        wrongText: 'Yanlış kişiyi izledin, hedef gözden kayboluyordu.',
        explanation: 'Sol el + saat teyit edildi. Takip başlasın.'
      },
      {
        kind: 'order',
        prompt: 'Kamera geçişlerini zaman sırasına diz, rota çıksın.',
        items: [
          { tag: '14:02', text: 'K-2 · Meydan girişi', order: 0 },
          { tag: '14:06', text: 'K-5 · Çeşme önü', order: 1 },
          { tag: '14:09', text: 'K-1 · Kapalı pasaj', order: 2 },
          { tag: '14:13', text: 'K-7 · Doğu çıkışı', order: 3 }
        ],
        wrongText: 'Zaman çizelgesi bu sırayla uyuşmuyor.'
      },
      {
        kind: 'quiz',
        prompt: 'Çanta değişimi hangi anda oldu?',
        options: [
          'Çeşme önünde eğildiğinde',
          'Pasajda omuz temasında',
          'Çıkışta taksiye binerken'
        ],
        correctIndex: 1,
        wrongText: 'Kaydı geri sar: çanta o karede hâlâ aynı elde.',
        explanation: 'Omuz teması 2 saniye — çanta el değiştirdi, kimse fark etmedi.'
      }
    ],
    cliffhanger:
      'Çantayı alan adam kalabalıkta kayboldu. Ama yüz tanıma sonucu geldi: o kişi TEŞKİLAT giriş kartıyla içeri girip çıkmış.',
    reward: { evidence: 10, trust: 4 },
    stealthPerMistake: 6
  },

  ep13: {
    id: 'ep13',
    title: 'BÖLÜM 13 · ÇİFTE ROL',
    kicker: P2,
    briefing: 'Şebekenin adamı seni yemekhanede sıkıştırdı. Kimliğini hatırla.',
    steps: [
      {
        kind: 'info',
        text: '"Seni Konya\'dan hatırlayamadım," dedi adam. Gözü üstünde. Verdiğin her cevap ezberlediğin kimlikle TUTARLI olmalı.'
      },
      {
        kind: 'quiz',
        prompt: '"Hangi şubede çalışıyordun?"',
        options: ['Konya Aktarma', 'Ankara Depo', 'Konya Merkez', 'Cevap verme'],
        correctIndex: 0,
        wrongText: 'Adamın gözleri kısıldı. Kimliğinle çeliştin.',
        explanation: 'Sakin bir sesle: "Konya Aktarma." Adam duraksadı.'
      },
      {
        kind: 'quiz',
        prompt: '"Plakan kaçtı demiştin?"',
        options: ['42 KL 318', '42 KL 381', 'Hatırlamıyorum, şirket aracı'],
        correctIndex: 0,
        wrongText: 'Sevkiyat şefi kendi plakasını bilmez mi?',
        explanation: 'Tereddütsüz cevap. Şüphe azaldı.'
      },
      {
        kind: 'pick',
        prompt: 'Adam hâlâ tam ikna olmadı. Ne yaparsın?',
        options: [
          {
            label: 'MASUM BİR ÇALIŞANI SUÇLA',
            detail: '"Beni sorgulayacağına yeni gelen şoföre bak."',
            delta: { trust: -4, teamBond: -8 },
            feedback: 'Şüphe dağıldı ama masum biri zan altında. Merkez bunu not etti.'
          },
          {
            label: 'ŞÜPHEYİ SEVKİYAT HATASINA YÖNLENDİR',
            detail: '"Beni merak edeceğine kayıp koliyi merak et."',
            delta: { trust: 6 },
            feedback: 'Adamın aklı koliye takıldı. Temiz çözüm.'
          },
          {
            label: 'KONUŞMAYI SABOTE ET',
            detail: 'Yangın alarmına bas, ortalık karışsın.',
            delta: { stealth: 14 },
            feedback: 'Kaçtın ama alarm kayıtlara geçti. Dikkat çekici.'
          }
        ]
      }
    ],
    cliffhanger: 'Adam uzaklaşırken telefonuna uzun bir mesaj yazdı. Kime?',
    reward: { trust: 4 },
    stealthPerMistake: 10
  },

  ep14: {
    id: 'ep14',
    title: 'BÖLÜM 14 · KIRIK MÜHÜR',
    kicker: P2,
    briefing: 'Delil deposundaki üç sevkiyat raporundan biri sahte.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Raporları karşılaştır. Sahte olan hangisi?',
        options: [
          'R-1 · Mühür 4471-A, mavi imza, tarih uyumlu',
          'R-2 · Mühür 4471-A, siyah imza, tarih uyumlu',
          'R-3 · Mühür 4417-A, mavi imza, tarih uyumlu'
        ],
        correctIndex: 2,
        wrongText: 'Bu rapor depo kayıtlarıyla birebir uyuşuyor.',
        explanation: '4417-A diye bir mühür hiç basılmadı. Seri numarası ters yazılmış: sahtecinin klasik hatası.'
      },
      {
        kind: 'quiz',
        prompt: 'Delil ne zaman değiştirildi?',
        options: ['Sevkiyattan önce', 'Depoya girişte', 'Gece sayımından sonra'],
        correctIndex: 2,
        wrongText: 'O saatte raporun fotoğrafı hâlâ orijinaliyle aynı.',
        explanation: 'Gece sayımı 23.40\'ta bitti; sahte rapor 23.58\'de sisteme yüklendi.'
      }
    ],
    cliffhanger:
      'Değişiklik YETKİLİ bir hesapla yapılmış. Sıradan bir memur değil — imza yetkisi olan biri.',
    reward: { evidence: 12 },
    stealthPerMistake: 5,
    suspicion: [
      { suspect: 'amir', delta: 10 },
      { suspect: 'teknik', delta: 5 }
    ]
  },

  ep15: {
    id: 'ep15',
    title: 'BÖLÜM 15 · GÖLGE TOPLANTI',
    kicker: P3,
    briefing: 'Dinleme cihazı kayıtta. Gürültünün içinden gerçeği ayıkla.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Üç kayıttan hangisi çözümlenebilir?',
        options: [
          'K-1 · Sürekli uğultu, tek kelime yok',
          'K-2 · Aralıklı ama net cümleler',
          'K-3 · Yalnızca müzik ve kahkaha'
        ],
        correctIndex: 1,
        wrongText: 'Bu kayıttan kelime çıkmaz. Zaman kaybı.',
        explanation: 'K-2 temizlendi. Konuşmacılar netleşiyor.'
      },
      {
        kind: 'quiz',
        prompt: 'Kayıtta geçen ANAHTAR kelime hangisi?',
        options: ['"düğün hazırlığı"', '"gölge"', '"kamyon lastiği"'],
        correctIndex: 1,
        wrongText: 'O kelime günlük konuşma — şifre değil.',
        explanation: '"Gölge" bir kod adı. Cümlenin tamamı: "Gölge Protokol hazır olsun."'
      },
      {
        kind: 'quiz',
        prompt: '"Terzi evrakları dikti" deniyor. TERZİ kim?',
        options: ['Silah tedarikçisi', 'Belge sahtecisi', 'Finansör'],
        correctIndex: 1,
        wrongText: 'Terzi "dikiyor" — silah ya da para dikilmez.',
        explanation: 'Terzi = sahte evrak ustası. Kırık mühür raporunu da o "dikti".'
      }
    ],
    cliffhanger:
      'GÖLGE PROTOKOL adını ilk kez duydun. Ve kayıttaki seslerden biri... teşkilat binasından tanıdık.',
    reward: { evidence: 10, trust: 4 },
    stealthPerMistake: 5,
    suspicion: [{ suspect: 'kaynak', delta: 10 }]
  },

  ep16: {
    id: 'ep16',
    title: 'BÖLÜM 16 · SİNYAL AVI',
    kicker: P3,
    briefing: 'Gizli verici üç araçtan birinde. Alıcılar güç ölçüyor.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Verici hangi araçta?',
        options: [
          'Kamyonet · güç sabit %40',
          'Sedan · güç şehir turuyla birlikte DEĞİŞİYOR',
          'Minibüs · güç sıfıra yakın'
        ],
        correctIndex: 1,
        wrongText: 'Sabit güç sabit kaynaktır: bina, araç değil.',
        explanation: 'Sinyal sedanla birlikte hareket ediyor. Verici orada.'
      },
      {
        kind: 'pick',
        prompt: 'Sedan hakkında kararın?',
        options: [
          {
            label: 'HEMEN DURDUR',
            delta: { stealth: 14 },
            feedback: 'Erkendi. Vericiyi izleyenler alarma geçti.'
          },
          {
            label: 'UZAKTAN TAKİP ET',
            delta: { trust: 6 },
            feedback: 'Sedan seni şebekenin garajına götürdü.'
          },
          {
            label: 'FREKANSI KARIŞTIR',
            delta: { evidence: -5 },
            feedback: 'Verici sustu ama iz de soğudu.'
          }
        ]
      }
    ],
    cliffhanger:
      'Frekans analizi ikinci bir dinleyici buldu: biri bu operasyonu CANLI izliyor.',
    reward: { evidence: 8 },
    stealthPerMistake: 6
  },

  ep17: {
    id: 'ep17',
    title: 'BÖLÜM 17 · KAYIP AJAN',
    kicker: P3,
    briefing: 'Saha ajanı Kerem 6 saattir sessiz. Son telsiz kaydı parçalı.',
    steps: [
      {
        kind: 'order',
        prompt: 'Telsiz parçalarını sıraya diz, son konumu çöz.',
        items: [
          { tag: '03:12', text: '"Kuzey depoya iniyorum..."', order: 0 },
          { tag: '03:13', text: '"Takip ediliyorum, iki kişi."', order: 1 },
          { tag: '03:15', text: '"Işıkları söndürün, tekrar ediyorum—"', order: 2 },
          { tag: '03:16', text: '(parazit... hat kesildi)', order: 3 }
        ],
        wrongText: 'Kayıt damgaları bu sırayla uyuşmuyor.'
      },
      {
        kind: 'quiz',
        prompt: 'İki yardım çağrısı geldi. Hangisi SAHTE?',
        options: [
          'Kuzey depo — günün güvenlik kelimesiyle',
          'Liman — acil ama güvenlik kelimesi YOK'
        ],
        correctIndex: 1,
        wrongText: 'Güvenlik kelimesi doğruydu; o çağrı gerçek.',
        explanation: 'Kelimesiz çağrı seni limana, yani TUZAĞA çekecekti.'
      },
      {
        kind: 'pick',
        prompt: 'Kararın?',
        options: [
          {
            label: 'KEREM\'İ KURTAR',
            detail: 'Tüm ekip kuzey depoya.',
            delta: { teamBond: 15, trust: -3 },
            feedback: 'Kerem sağ. Ekip bunu unutmayacak.'
          },
          {
            label: 'GÖREVİ SÜRDÜR',
            detail: 'Kerem beklesin, hedef önce gelir.',
            delta: { trust: 8, teamBond: -15 },
            feedback: 'Merkez onayladı. Ekipte sessizlik var.'
          },
          {
            label: 'KÜÇÜK EKİP GÖNDER',
            detail: 'İki kişi Kerem\'e, gerisi görevde.',
            delta: { teamBond: 6, trust: 3 },
            feedback: 'Riskli ama dengeli. İkisi de başarıldı.'
          }
        ]
      }
    ],
    cliffhanger:
      'Kerem\'i tuzağa çağıran o sahte mesaj... TEŞKİLAT hattından gönderilmişti.',
    reward: { evidence: 6 },
    stealthPerMistake: 5
  },

  ep18: {
    id: 'ep18',
    title: 'BÖLÜM 18 · SAHTE EMİR',
    kicker: P3,
    briefing: 'Gece yarısı üç acil emir düştü. Biri sahte.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Emirleri doğrula. Sahte olan hangisi?',
        options: [
          'E-1 · İmza doğrulandı, kod bugünkü',
          'E-2 · İmza var ama güvenlik kelimesi DÜNKÜ',
          'E-3 · İmza ve kod tam, saat uyumlu'
        ],
        correctIndex: 1,
        wrongText: 'Bu emrin tüm doğrulamaları geçerli.',
        explanation: 'Güvenlik kelimesi bu sabah değişti. Sahteci eski kelimeyi kullandı: içeriden ama TAM içeriden değil.'
      },
      {
        kind: 'quiz',
        prompt: 'Sahte emir seni nereye yönlendiriyordu?',
        options: ['Şehir dışındaki boş depoya', 'Merkez binaya', 'Eve, dinlenmeye'],
        correctIndex: 0,
        wrongText: 'Emri tekrar oku: adres açıkça yazıyor.',
        explanation: 'Boş depo = pusu noktası. Gitmediğin için hâlâ hayattasın.'
      }
    ],
    cliffhanger: 'Sahteci EMİR FORMATINI biliyordu. Bu format yalnızca komuta katında görülür.',
    reward: { evidence: 10, trust: 5 },
    stealthPerMistake: 6,
    suspicion: [{ suspect: 'amir', delta: 10 }]
  },

  ep19: {
    id: 'ep19',
    title: 'BÖLÜM 19 · KAPAN',
    kicker: P3,
    briefing: 'Kimliğin yanmak üzere. Binadan 90 saniyede çıkmalısın.',
    steps: [
      {
        kind: 'pick',
        prompt: 'Çıkış rotan?',
        options: [
          {
            label: 'A · ANA KAPI',
            detail: 'Kalabalığa karış. Ama turnikeler kimlik okuyor.',
            delta: { stealth: 12 },
            feedback: 'Çıktın; turnike kaydı arkanda kaldı.'
          },
          {
            label: 'B · SERVİS RAMPASI',
            detail: 'Kamyoncular arasında, kayıtsız çıkış.',
            delta: {},
            feedback: 'Kimse dönüp bakmadı bile.'
          },
          {
            label: 'C · ÇATI HATTI',
            detail: 'Yan binaya atla. Cesur ama görünür.',
            delta: { stealth: 6 },
            feedback: 'Çıktın; bir güvenlik kamerası gölgeni yakaladı.'
          }
        ]
      },
      {
        kind: 'quiz',
        prompt: 'Çıkmadan sisteme ne bırakırsın?',
        options: ['Hiçbir şey — temiz çık', 'SAHTE rota bilgisi', 'Her şeyi silen bir komut'],
        correctIndex: 1,
        wrongText: 'Peşindekiler izini hemen bulur.',
        explanation: 'Sahte rota, peşindekileri 6 saat yanlış yöne sürdü.'
      },
      {
        kind: 'pick',
        prompt: 'Ekipten yardım ister misin?',
        options: [
          {
            label: 'YARDIM İSTE',
            detail: 'Araç köşede beklesin.',
            delta: { teamBond: 10, stealth: 4 },
            feedback: 'Araç tam zamanında oradaydı.'
          },
          {
            label: 'TEK BAŞINA ÇIK',
            detail: 'Kimseyi riske atma.',
            delta: { trust: 4 },
            feedback: 'Yalnız ve sessiz. Merkez not etti.'
          }
        ]
      }
    ],
    cliffhanger:
      'Kurtuldun. Ama seni ele veren ihbar telefonu binadan değil... MERKEZDEN açılmıştı.',
    reward: { trust: 3 },
    stealthPerMistake: 8
  },

  ep20: {
    id: 'ep20',
    title: 'BÖLÜM 20 · HAİNİN İZİ',
    kicker: P3,
    briefing: 'Kanıt panosu önündesin: kişiler, araçlar, saatler, hesaplar.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Panodaki ipuçlarından biri SAHTE. Hangisi?',
        options: [
          'Teknik uzmanın aracı sızıntı gecesi depoda görüldü',
          'Haber kaynağı o gece şehir dışındaydı',
          'Amirin telefonu o gece kapalıydı'
        ],
        correctIndex: 0,
        wrongText: 'Bu ipucu üç bağımsız kaynakla doğrulanıyor.',
        explanation: 'Plaka KLONLANMIŞ: araç o gece servisteydi. Birisi teknik uzmanı hedef gösteriyor.'
      },
      {
        kind: 'quiz',
        prompt: 'Pano tamam. Hain profili?',
        options: ['Teknik Uzman', 'Haber Kaynağı', 'Operasyon Amiri', 'KANIT YETERSİZ'],
        correctIndex: 3,
        wrongText: 'Elindeki delil bu suçlamayı taşımaz. Yanlış suçlama operasyonu bitirir.',
        explanation: 'Deliller çelişiyor; biri seni yönlendiriyor. "Kanıt yetersiz" demek cesaret ister — ve bu gece doğrusu bu.'
      }
    ],
    cliffhanger: 'Panoyu toparladın. Ama tuzağı kuran kişi... senin panonu da görüyor.',
    reward: { evidence: 12, trust: 5 },
    stealthPerMistake: 6,
    suspicion: [{ suspect: 'teknik', delta: -10 }]
  },

  ep21: {
    id: 'ep21',
    title: 'BÖLÜM 21 · İÇ SORUŞTURMA',
    kicker: P3,
    briefing: 'Sorgu odası. Aynı soruyu farklı sor; yalanı ve saklananı ayır.',
    steps: [
      {
        kind: 'info',
        text: 'Amir: "O gece evdeydim." — bir saat sonra: "Toplantıdaydım."\nTeknik: her seferinde aynı: "Hesabım çalındı."\nKaynak: "Cevap vermeyeceğim."'
      },
      {
        kind: 'quiz',
        prompt: 'Kim YALAN söylüyor?',
        options: ['Operasyon Amiri', 'Teknik Uzman', 'Haber Kaynağı'],
        correctIndex: 0,
        wrongText: 'İfadesi tutarlı; yalancı ifade DEĞİŞTİRİR.',
        explanation: 'Amirin iki ifadesi çelişiyor. Yalan, değişen hikâyede saklanır.'
      },
      {
        kind: 'quiz',
        prompt: 'Kim bilgi SAKLIYOR?',
        options: ['Operasyon Amiri', 'Teknik Uzman', 'Haber Kaynağı'],
        correctIndex: 2,
        wrongText: 'Saklayan susar; o konuşuyor.',
        explanation: 'Kaynak susuyor. Yalan söylemiyor ama bir şeyi koruyor.'
      },
      {
        kind: 'pick',
        prompt: 'Baskı seviyesi?',
        options: [
          {
            label: 'BASKIYI ARTIR',
            delta: { evidence: 5, teamBond: -6 },
            feedback: 'Kaynak bir isim verdi ama odada güven kalmadı.'
          },
          {
            label: 'SAKİN DEVAM ET',
            delta: { teamBond: 5, evidence: 3 },
            feedback: 'Sessizlik uzadı; sonunda kaynak kendiliğinden konuştu.'
          },
          {
            label: 'SORGUYU BİTİR',
            delta: { evidence: -5 },
            feedback: 'Cevaplar yarım kaldı.'
          }
        ]
      }
    ],
    cliffhanger: 'İkisi de bir şey gizliyor. Ama yalnızca biri HAİN. Diğerinin sakladığı şey ne?',
    reward: { evidence: 6 },
    stealthPerMistake: 5,
    suspicion: [
      { suspect: 'amir', delta: 15 },
      { suspect: 'kaynak', delta: 15 }
    ]
  },

  ep23: {
    id: 'ep23',
    title: 'BÖLÜM 23 · SESSİZ BASKIN',
    kicker: P4,
    briefing: 'Hain gözaltında; şimdi sıra depoda. Baskını sen planla.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Kapıdaki kilit elektronik. Ekip kimlerden oluşsun?',
        options: ['İki saha ajanı', 'Bir saha + bir teknik uzman', 'İki teknik uzman'],
        correctIndex: 1,
        wrongText: 'Kilidi kim açacak / kapıyı kim tutacak?',
        explanation: 'Teknik kilidi açar, saha ajanı korur. Denge.'
      },
      {
        kind: 'pick',
        prompt: 'Giriş noktası?',
        options: [
          {
            label: 'ANA KAPI',
            detail: 'Hızlı ama nöbetçinin önünden.',
            delta: { stealth: 14 },
            feedback: 'Nöbetçi bastırıldı ama telsizine dokunmuştu.'
          },
          {
            label: 'HAVALANDIRMA',
            detail: 'Yavaş, dar, ama tamamen görünmez.',
            delta: {},
            feedback: 'İçerdesiniz. Kimse duymadı.'
          },
          {
            label: 'YÜKLEME KAPISI',
            detail: 'Orta risk; kamera var ama açısı dar.',
            delta: { stealth: 6 },
            feedback: 'Girildi; kamera bir silüet yakaladı.'
          }
        ]
      },
      {
        kind: 'quiz',
        prompt: 'Nöbet değişimi 03.00\'te. Baskın saati?',
        options: ['02.55 · değişimden hemen önce', '03.05 · değişimden hemen sonra', '04.00 · gece yarısı sükûneti'],
        correctIndex: 1,
        wrongText: 'O saatte iki vardiya birden ayakta.',
        explanation: 'Devir teslimden hemen sonra: gözler yorgun, rapor karışık.'
      }
    ],
    cliffhanger: 'Depo alındı. İçerideki telsiz frekansı... TEŞKİLAT frekansına ayarlıydı.',
    reward: { trust: 8, evidence: 8 },
    stealthPerMistake: 8
  },

  ep24: {
    id: 'ep24',
    title: 'BÖLÜM 24 · UZAK GÖZ',
    kicker: P4,
    briefing: 'İki İHA havada. Isı izlerini sınıflandır, sahte konvoyu ele.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Hangi iz SAHTE konvoy?',
        options: [
          'K-1 · Motorlar sıcak, düzensiz aralıklı 5 araç',
          'K-2 · Motorlar SOĞUK, cetvelle dizilmiş 6 araç',
          'K-3 · Tek araç, normal seyir'
        ],
        correctIndex: 1,
        wrongText: 'Sıcak motor + düzensiz dizilim: bu konvoy gerçekten yol almış.',
        explanation: 'Soğuk motor ve kusursuz dizilim: saatlerdir park hâlinde bırakılmış YEM.'
      },
      {
        kind: 'quiz',
        prompt: 'Haritada sivil alanı işaretle — operasyon oraya girmeyecek.',
        options: ['Pazar meydanı', 'Terk edilmiş depo', 'Fabrika sahası'],
        correctIndex: 0,
        wrongText: 'Orada bu saatte sivil yok.',
        explanation: 'Pazar kalabalık. İşaretlendi: müdahale rotası dışında.'
      }
    ],
    cliffhanger:
      'Gerçek konvoy İHA açısının tam kör noktasından ilerliyordu. Rotanı önceden bilen biri var.',
    reward: { evidence: 8, trust: 5 },
    stealthPerMistake: 6
  },

  ep25: {
    id: 'ep25',
    title: 'BÖLÜM 25 · SON HAT',
    kicker: P4,
    briefing: 'Keskin nişancı pozisyonda. Görevi: yalnızca GÖZLEM.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Üç benzer kişi. Ekip için tehdit hangisi?',
        options: [
          'A · Sigara yakıyor, duvara yaslanmış',
          'B · Saatine bakıyor, elleri cebinde',
          'C · Kalabalığı tarayarak ekibe doğru ilerliyor'
        ],
        correctIndex: 2,
        wrongText: 'Davranışı sıradan: bekleyen biri.',
        explanation: 'Sistematik tarama + yönelme: eğitimli davranış kalıbı.'
      },
      {
        kind: 'pick',
        prompt: 'Kararın?',
        options: [
          {
            label: 'MÜDAHALE EMRİ VER',
            delta: { stealth: 16, trust: -5 },
            feedback: 'Erkendi. Meydanda panik; operasyon az daha deşifre oluyordu.'
          },
          {
            label: 'BEKLE VE İZLE',
            delta: { trust: 4 },
            feedback: 'Sabır. Adım adım izlendi.'
          },
          {
            label: 'EKİBİ SESSİZCE UYAR',
            delta: { trust: 6, teamBond: 5 },
            feedback: 'Ekip yön değiştirdi; temas hiç yaşanmadı.'
          }
        ]
      }
    ],
    cliffhanger:
      'Adam ekibin eski rotasından geçip gitti: kurye değil GÖZCÜydü. Birileri seni sınadı.',
    reward: { evidence: 6 },
    stealthPerMistake: 7
  },

  ep26: {
    id: 'ep26',
    title: 'BÖLÜM 26 · GÖKYÜZÜ KARARI',
    kicker: P4,
    briefing: 'SİHA kilitte. Kural net: en az ÜÇ bağımsız kaynak doğrulamalı.',
    steps: [
      {
        kind: 'quiz',
        prompt: 'Kaynakları say. Hangisi hedefi DOĞRULAMIYOR?',
        options: [
          'İHA görüntüsü: plaka birebir eşleşti',
          'Sinyal kaydı: kaynak araçla hareketli',
          'Tanık ifadesi: "sarı kamyondu" — hedef BEYAZ',
          'Önceki kanıt: aynı araç depo baskınında'
        ],
        correctIndex: 2,
        wrongText: 'O kaynak hedefle birebir uyumlu.',
        explanation: 'Tanık çelişiyor. Yine de elimizde ÜÇ doğrulayan kaynak var: kural sağlandı.'
      },
      {
        kind: 'pick',
        prompt: 'Sivil hareketliliği düşük. Kararın?',
        options: [
          {
            label: 'MÜDAHALE ET',
            delta: { trust: 4, evidence: -6 },
            feedback: 'Hedef durduruldu; ama araçtaki isimler sorgulanamadan yandı.'
          },
          {
            label: 'TAKİBİ SÜRDÜR',
            delta: { trust: 3 },
            feedback: 'Araç bir buluşma noktasına gidiyor gibiydi... sonra sinyal kesildi.'
          },
          {
            label: 'SAHA EKİBİNİ YÖNLENDİR',
            delta: { trust: 8, evidence: 8 },
            feedback: 'Araç sessizce durduruldu: cihaz VE belgeler sağlam ele geçti.'
          },
          {
            label: 'OPERASYONU İPTAL ET',
            delta: { trust: -6 },
            feedback: 'Üç kaynak varken iptal... Merkez gerekçeni sordu.'
          }
        ]
      }
    ],
    cliffhanger:
      'Araçtan çıkan listede TEŞKİLAT isimleri vardı. Gölge Protokol bir saldırı değil: bir TEMİZLİK listesi.',
    reward: { evidence: 6 },
    stealthPerMistake: 6
  },

  ep27: {
    id: 'ep27',
    title: 'BÖLÜM 27 · BAŞKENTTE GÖLGE',
    kicker: P4,
    briefing: 'Üç kriz aynı anda. Üç birimin var: Teknik, İHA, Saha Destek.',
    steps: [
      {
        kind: 'info',
        text: 'Aynı dakikada:\n1) Şüpheli araç şehir merkezine giriyor.\n2) Teşkilat sunucusunda veri sızıntısı başladı.\n3) Saha ekibinin konumu açığa çıktı.'
      },
      {
        kind: 'quiz',
        prompt: 'Veri sızıntısına hangi birimi atarsın?',
        options: ['Teknik ekip', 'İHA', 'Saha destek'],
        correctIndex: 0,
        wrongText: 'O birim sunucuya erişemez.',
        explanation: 'Teknik ekip sızıntıyı 4. dakikada kesti.'
      },
      {
        kind: 'quiz',
        prompt: 'Şüpheli aracı kim izlesin?',
        options: ['Teknik ekip', 'İHA', 'Saha destek'],
        correctIndex: 1,
        wrongText: 'Araç hareket hâlinde — yerden yetişemezsin.',
        explanation: 'İHA aracı ana caddede kilitledi.'
      },
      {
        kind: 'quiz',
        prompt: 'Açığa çıkan ekibe kim gitsin?',
        options: ['Teknik ekip', 'İHA', 'Saha destek'],
        correctIndex: 2,
        wrongText: 'Oraya fiziksel müdahale gerekiyor.',
        explanation: 'Saha destek ekibi ekibi güvenli noktaya taşıdı.'
      }
    ],
    cliffhanger:
      'Üç kriz de aynı elden çıkmıştı: OYALAMA. Gerçek hedef, boşalan operasyon merkeziydi.',
    reward: { trust: 8, teamBond: 8 },
    stealthPerMistake: 7
  },

  ep28: {
    id: 'ep28',
    title: 'BÖLÜM 28 · GÖLGE PROTOKOL',
    kicker: P4,
    briefing: 'Sezon finali. Sızma, kanıt, İHA, keskin nişancı, karar: hepsi bu gece.',
    steps: [
      {
        kind: 'quiz',
        prompt: '1/5 · SIZMA — Kompleks girişi?',
        options: [
          'Havalandırma — teknik planda "izlenmiyor" yazıyor',
          'Ana kapı — hızlı ve gürültülü',
          'Çatı — uzun ve rüzgârlı'
        ],
        correctIndex: 0,
        wrongText: 'Alarm çalmasına saniyeler kaldı; geri çekildin.',
        explanation: 'İçerdesin. Sunucu odası iki kat aşağıda.'
      },
      {
        kind: 'quiz',
        prompt: '2/5 · KANIT — Sunucuda hangi dosya davayı BİTİRİR?',
        options: [
          'Sevkiyat listeleri',
          'Şifreli ödeme kayıtları + dijital imzalar',
          'Kamera arşivi'
        ],
        correctIndex: 1,
        wrongText: 'O dosya yardımcı delil; tek başına yetmez.',
        explanation: 'Ödemeler + imzalar: ağın tamamını tek zincirde bağlıyor.'
      },
      {
        kind: 'quiz',
        prompt: '3/5 · İHA — Kaçış hazırlığındaki araç hangisi?',
        options: [
          'Siyah sedan · motor SICAK, arka kapıda bekliyor',
          'Kamyon · motor soğuk, dorse boş',
          'Motosiklet · sahibi içeride, kilitli'
        ],
        correctIndex: 0,
        wrongText: 'O araç saatlerdir yerinden kımıldamamış.',
        explanation: 'Sıcak motor + bekleyen sürücü: kaçış aracı işaretlendi.'
      },
      {
        kind: 'quiz',
        prompt: '4/5 · SON HAT — Ekibe yaklaşan silüeti doğrula.',
        options: [
          'Parolayı verdi: "gölge değil, ışık"',
          'Parola yok; elini ceketine götürüyor'
        ],
        correctIndex: 0,
        wrongText: 'Bekle! Parola kanalını dinle.',
        explanation: 'Kerem\'di. Ekip tamam — son kapıya geldik.'
      },
      {
        kind: 'pick',
        prompt: '5/5 · SON KARAR — Hain karşında. Gölge Protokol elinde.',
        options: [
          {
            label: 'HAİNİ YAKALA, OPERASYONU BİTİR',
            delta: { trust: 10 },
            feedback: 'Kelepçe sesi koridorda yankılandı.',
            ending:
              'FİNAL · BEDELİ AĞIR BAŞARI — Hain yakalandı, tehdit bitti. Ama ağın uzantıları karanlığa çekildi; bu dosya bir gün yeniden açılacak.'
          },
          {
            label: 'HAİNİ İZLE, BÜYÜK YAPIYA ULAŞ',
            delta: { evidence: 15 },
            feedback: 'Hain, izlendiğini bilmeden merkeze yürüdü.',
            ending:
              'FİNAL · DERİN GÖLGE — Hain seni uluslararası ağın kapısına götürdü. Dosya kapanmadı: BÜYÜDÜ. Yeni sezon burada başlar.'
          },
          {
            label: 'OPERASYONU AÇIKLA, TEŞKİLATI TEMİZLE',
            delta: { trust: 15 },
            feedback: 'Kayıtlar komuta katına sunuldu.',
            ending:
              'FİNAL · KUSURSUZ OPERASYON — Ağ çökertildi, içerideki gölge temizlendi. Sessizlik, en büyük zaferdi.'
          },
          {
            label: 'DOSYAYI GİZLİ TUT, DIŞ AĞI ÇÖKERT',
            delta: { evidence: 8, trust: -5 },
            feedback: 'Dosya kasaya kilitlendi; operasyon dışarıda sürdü.',
            ending:
              'FİNAL · SESSİZ HESAP — Dış ağ çökertildi. Ama içerideki gölgenin adı hâlâ bir kasada duruyor... ve kasaların da anahtarı vardır.'
          }
        ]
      }
    ],
    cliffhanger: '',
    reward: { trust: 5, evidence: 5 },
    stealthPerMistake: 8
  }
};
