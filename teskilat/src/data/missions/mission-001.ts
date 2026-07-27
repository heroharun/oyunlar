import type { Mission } from '../../types/mission';

/** Operasyon: Kayıp Sinyal — tam görev akışı (GDD §5-7). */
export const MISSION_001: Mission = {
  id: 'mission-001',
  title: 'Kayıp Sinyal',
  codename: 'OPERASYON: KAYIP SİNYAL',
  briefing: {
    headline: 'Üç lojistik araçtan biri gizli bir sinyal cihazı taşıyor.',
    description:
      'Ankara yaklaşımındaki şüpheli tekstil aracı (Araç B), gece boyunca ' +
      'dört ayrı kameraya yakalandı. Kayıt saatleri karışık geldi. ' +
      'Aracın rotasını doğrulamadan operasyon planı kurulamaz.',
    objective: 'Kamera kartlarını zaman sırasına göre yerleştir.',
    estimatedMinutes: 8
  },
  cameraPuzzle: {
    kind: 'camera-puzzle',
    instruction: 'Kartlara KRONOLOJİK sırayla dokun: en erken kayıt önce.',
    cards: [
      {
        id: 'kam-depo',
        camera: 'KAM-01 · DEPO ÇIKIŞI',
        time: '20:45',
        note: 'Yükleme tamamlandı, araç kapıdan ayrılıyor.',
        order: 0
      },
      {
        id: 'kam-cevre',
        camera: 'KAM-04 · ÇEVRE YOLU',
        time: '20:58',
        note: 'Araç sağ şeritte, hız sabit, plaka net.',
        order: 1
      },
      {
        id: 'kam-tunel',
        camera: 'KAM-07 · TÜNEL ÇIKIŞI',
        time: '21:04',
        note: 'Plakanın yarısı gölgede. Sürücü ifadesiyle çelişiyor.',
        order: 2
      },
      {
        id: 'kam-sanayi',
        camera: 'KAM-12 · SANAYİ KAVŞAĞI',
        time: '21:16',
        note: 'Araç 12 dakikalık kayıptan sonra yeniden görünüyor.',
        order: 3
      }
    ],
    hints: [
      'Depodan çıkmadan hiçbir kamera aracı göremez: en erken saat depodadır.',
      'Tünel, çevre yolundan SONRA gelir. 21:04 kaydına dikkat.'
    ]
  },
  contradiction: {
    kind: 'contradiction',
    instruction: 'Dört kayıttan biri diğerleriyle çelişiyor. Tutarsız ifadeyi bul.',
    statements: [
      {
        id: 'ifade-surucu',
        source: 'SÜRÜCÜ İFADESİ',
        text: '"Saat 21.10\'da tünele girdim, hiç durmadım."'
      },
      {
        id: 'ifade-kamera',
        source: 'KAM-07 KAYDI',
        text: 'Araç 21.04\'te tünelden ÇIKARKEN görüntülendi.'
      },
      {
        id: 'ifade-sevkiyat',
        source: 'SEVKİYAT KAYDI',
        text: 'Yükleme 20.45\'te tamamlandı, kapı mührü sağlam.'
      },
      {
        id: 'ifade-gps',
        source: 'GPS VERİSİ',
        text: 'Araç takip sinyali 21.07\'de kesildi.'
      }
    ],
    inconsistentId: 'ifade-surucu',
    explanation:
      'Araç 21.04\'te tünelden çıktıysa sürücü 21.10\'da tünele girmiş olamaz. ' +
      'Sürücü zaman çizelgesini gizliyor.',
    hints: [
      'Kamera kaydı ile sürücünün verdiği saati yan yana koy.',
      'Bir araç tünelden çıktıktan SONRA tünele giremez.'
    ]
  },
  signal: {
    kind: 'signal',
    instruction: 'Üç kaynaktan HAREKETLİ olanı bul. Yanlış pozitife dikkat.',
    sources: [
      {
        id: 'sinyal-a',
        label: 'ARAÇ A · SOĞUK ZİNCİR',
        reading: 'Zayıf ve düz sinyal. Kaynak koordinatı sabit: depo binası.',
        feedback: 'Sabit koordinat, araçtaki bir cihaza ait olamaz.',
        pattern: 'flat'
      },
      {
        id: 'sinyal-b',
        label: 'ARAÇ B · TEKSTİL',
        reading: 'Orta güçte sinyal. Kaynak, kamera kayıtlarıyla AYNI hatta ilerliyor.',
        feedback: '',
        pattern: 'moving'
      },
      {
        id: 'sinyal-c',
        label: 'ARAÇ C · MEDİKAL',
        reading: 'Çok yüksek yoğunluk! Ancak kaynak sabit: baz istasyonunun üstü.',
        feedback: 'Yüksek yoğunluk yanlış pozitif: kaynak baz istasyonu, araç değil.',
        pattern: 'spike'
      }
    ],
    correctId: 'sinyal-b',
    explanation:
      'Hareket eden tek kaynak Araç B ile aynı rotada. En güçlü sinyal değil, ' +
      'DOĞRU sinyal önemliydi.',
    hints: [
      'En güçlü sinyal her zaman doğru hedef değildir.',
      'Araçla birlikte YER DEĞİŞTİREN kaynağı ara.'
    ]
  },
  specialist: {
    kind: 'specialist',
    instruction: 'Bu operasyon için İKİ uzman seç. Seçimin sonucu etkileyecek.',
    pickCount: 2,
    specialists: [
      {
        id: 'analist',
        name: 'ANALİST',
        role: 'Belge ve ifade analizi',
        strength: 'Çelişki dosyalarını derinleştirir, doğruluğu artırır.'
      },
      {
        id: 'teknik',
        name: 'TEKNİK UZMAN',
        role: 'Sinyal ve cihaz müdahalesi',
        strength: 'Sinyal bastırma ancak onunla sessiz yapılabilir.'
      },
      {
        id: 'saha',
        name: 'SAHA OPERATÖRÜ',
        role: 'Fiziksel takip ve müdahale',
        strength: 'Aracı fark edilmeden takip eder, rota kontrolü sağlar.'
      }
    ]
  },
  route: {
    kind: 'route',
    instruction: 'Ekibi araca ulaştır. En kısa yol değil, EN DÜŞÜK RİSKLİ yol.',
    options: [
      {
        id: 'rota-merkez',
        label: 'A · MERKEZ HATTI',
        detail: 'En kısa. Ancak pazar kalabalığının içinden geçiyor.',
        secrecyPenalty: 5,
        civilianPenalty: 25,
        waypoints: [
          [0.1, 0.85],
          [0.35, 0.6],
          [0.5, 0.45],
          [0.9, 0.15]
        ]
      },
      {
        id: 'rota-arter',
        label: 'B · ANA ARTER',
        detail: 'Orta uzunlukta. MOBESE kamera yoğunluğu yüksek.',
        secrecyPenalty: 18,
        civilianPenalty: 0,
        waypoints: [
          [0.1, 0.85],
          [0.55, 0.75],
          [0.75, 0.5],
          [0.9, 0.15]
        ]
      },
      {
        id: 'rota-cevre',
        label: 'C · ÇEVRE HATTI',
        detail: 'En uzun. Kamerasız, tenha, güvenli geçiş noktalı.',
        secrecyPenalty: 0,
        civilianPenalty: 0,
        waypoints: [
          [0.1, 0.85],
          [0.2, 0.45],
          [0.55, 0.2],
          [0.9, 0.15]
        ]
      }
    ],
    bestId: 'rota-cevre'
  },
  decision: {
    kind: 'decision',
    instruction: 'Cihaz Araç B\'de. Operasyon yöntemini seç.',
    radioLine: '"Merkez, sinyal yeniden aktif. Karar için otuz saniyeniz var."',
    options: [
      {
        id: 'karar-durdur',
        label: 'ARACI HEMEN DURDUR',
        detail: 'Tehdit anında biter. Ancak karşı taraf operasyonu öğrenir.',
        secrecyPenalty: 45,
        civilianPenalty: 0,
        ending:
          'Araç durduruldu, cihaz ele geçirildi. Karşı taraf haberleşmeyi kesti; ' +
          'ama cihazın sevkiyat etiketi tek bir kapıya çıkıyor: KARYA LOJİSTİK.'
      },
      {
        id: 'karar-bastir',
        label: 'SİNYALİ BASTIR VE TAKİP ET',
        detail: 'Cihaz sessizce etkisizleşir, araç yeni izlere götürür.',
        secrecyPenalty: 0,
        civilianPenalty: 0,
        ending:
          'Cihaz uzaktan susturuldu. Araç, farkında olmadan ekibi bir üst ' +
          'bağlantının kapısına götürdü: KARYA LOJİSTİK deposu.'
      },
      {
        id: 'karar-ayir',
        label: 'ROTADAN AYIR',
        detail: 'Araç kalabalığa girmeden yönlendirilir. Şüphe uyandırabilir.',
        secrecyPenalty: 15,
        civilianPenalty: 0,
        ending:
          'Araç sahte yol çalışmasıyla tenha hatta alındı ve etkisizleştirildi. ' +
          'Sürücünün üstünden çıkan irsaliyede tek isim var: KARYA LOJİSTİK.'
      }
    ],
    bestId: 'karar-bastir'
  }
};
