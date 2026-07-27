import type { Mission } from '../../types/mission';

/** Operasyon: Kayıp Sinyal — Sprint 1 dilimi: kamera takibi bulmacası (GDD §6-7.1). */
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
    estimatedMinutes: 2
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
  }
};
