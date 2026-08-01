/* =========================================================
   Kelime Yörüngesi — levels.js
   Her bölüm: harf havuzu + bulunması gereken kelimeler + küçük dünyanın kimliği.
   words dizisindeki her kelime, sahnedeki bir parçayı canlandırır.
   Yeni bölüm eklemek için diziye yeni bir nesne eklemen yeterli.
   ========================================================= */

const KY_LEVELS = [
  {
    id: 1,
    title: 'Kuru Bahçe',
    hint: 'Toprak su bekliyor.',
    letters: ['Ç', 'İ', 'Ç', 'E', 'K'],
    words: ['ÇEKİ', 'KEÇİ', 'ÇİÇEK'],
    scene: 'cicek',
    palette: { sky1: '#2A1F4E', sky2: '#4C3A78', land1: '#5C4A2E', land2: '#3A2F22', item: '#FFB86B', item2: '#FF8FA8', stem: '#6BE3B0', glow: '#FFD9A0' }
  },
  {
    id: 2,
    title: 'Çıplak Tepe',
    hint: 'Kökler dallanmak istiyor.',
    letters: ['O', 'R', 'M', 'A', 'N'],
    words: ['NAR', 'MOR', 'NORM', 'ORAN', 'ROMAN', 'ORMAN'],
    scene: 'agac',
    palette: { sky1: '#16234B', sky2: '#2E5A6B', land1: '#3E5233', land2: '#25331F', item: '#5FD39A', item2: '#2E8F6B', stem: '#8A5A38', glow: '#CFF6E1' }
  },
  {
    id: 3,
    title: 'Sessiz Gölet',
    hint: 'Suyun altında bir şey kıpırdıyor.',
    letters: ['B', 'A', 'L', 'I', 'K'],
    words: ['BAL', 'KIL', 'ILK', 'AKIL', 'BALIK'],
    scene: 'gol',
    palette: { sky1: '#132A45', sky2: '#2E6E86', land1: '#2F6B72', land2: '#1B4149', item: '#7FE0D6', item2: '#FFC46B', stem: '#4FB8A8', glow: '#D6FFF8' }
  },
  {
    id: 4,
    title: 'Karanlık Köy',
    hint: 'Pencereler ışık bekliyor.',
    letters: ['L', 'A', 'M', 'B', 'A'],
    words: ['BAL', 'MAL', 'ABLA', 'LAMBA'],
    scene: 'ev',
    palette: { sky1: '#161B3D', sky2: '#3A2B5C', land1: '#4A3B2E', land2: '#2A2119', item: '#E7DCC6', item2: '#8A6A4E', stem: '#FFC978', glow: '#FFE3A8' }
  },
  {
    id: 5,
    title: 'Yarım Çatılar',
    hint: 'Kiremitler yerini arıyor.',
    letters: ['Ç', 'A', 'T', 'I', 'K'],
    words: ['KAT', 'KAÇ', 'TAÇ', 'AÇI', 'ÇITA', 'ATIK', 'ÇATI'],
    scene: 'sehir',
    palette: { sky1: '#1B1B40', sky2: '#5C3D6B', land1: '#4E3A4A', land2: '#2A1F2C', item: '#C6B8E8', item2: '#8A6FB5', stem: '#FFB86B', glow: '#FFDCC0' }
  },
  {
    id: 6,
    title: 'Kopuk Köprü',
    hint: 'İki yaka birbirine değmiyor.',
    letters: ['K', 'Ö', 'P', 'R', 'Ü'],
    words: ['KÜP', 'KÜR', 'KÖR', 'KÖPRÜ'],
    scene: 'kopru',
    palette: { sky1: '#141F44', sky2: '#3C5C8A', land1: '#3B4762', land2: '#212838', item: '#9FC2FF', item2: '#5E7FC0', stem: '#FFB86B', glow: '#DCEBFF' }
  },
  {
    id: 7,
    title: 'Durgun Deniz',
    hint: 'Yelkenler rüzgârsız.',
    letters: ['D', 'E', 'N', 'İ', 'Z', 'Y'],
    words: ['DEN', 'DİZ', 'DİZE', 'YENİ', 'YEDİ', 'DENİZ'],
    scene: 'tekne',
    palette: { sky1: '#10254A', sky2: '#2C7E92', land1: '#1F5E77', land2: '#123846', item: '#FFF1D6', item2: '#FF9E7A', stem: '#7FD6E0', glow: '#EAFBFF' }
  },
  {
    id: 8,
    title: 'Dökülen Yapraklar',
    hint: 'Dallar yeniden giyinecek.',
    letters: ['Y', 'A', 'P', 'R', 'A', 'K'],
    words: ['KAR', 'PAY', 'KARA', 'KAYA', 'PARK', 'ARKA', 'YAPRAK'],
    scene: 'agac',
    palette: { sky1: '#2E1E33', sky2: '#7A4630', land1: '#5A3C24', land2: '#33231A', item: '#FFA556', item2: '#E0623C', stem: '#7A4E2E', glow: '#FFD9A8' }
  },
  {
    id: 9,
    title: 'Duran Pervaneler',
    hint: 'Hava bir itiş bekliyor.',
    letters: ['R', 'Ü', 'Z', 'G', 'A', 'R'],
    words: ['GAR', 'GAZ', 'ZAR', 'ARZ', 'GÜR', 'GÜRZ', 'RÜZGAR'],
    scene: 'ruzgar',
    palette: { sky1: '#17304F', sky2: '#4E86A6', land1: '#3F6350', land2: '#22382E', item: '#E8F4FF', item2: '#9BB8CC', stem: '#CFE4F2', glow: '#FFFFFF' }
  },
  {
    id: 10,
    title: 'Boş Gökyüzü',
    hint: 'Gece henüz süslenmedi.',
    letters: ['Y', 'I', 'L', 'D', 'I', 'Z', 'A'],
    words: ['DAL', 'AYI', 'YIL', 'YAZI', 'YILDIZ'],
    scene: 'yildiz',
    palette: { sky1: '#0B1030', sky2: '#241C56', land1: '#2A2352', land2: '#151234', item: '#FFE9A8', item2: '#B9A6FF', stem: '#6BE3B0', glow: '#FFF6D6' }
  },
  {
    id: 11,
    title: 'Sessiz Atölye',
    hint: 'Dişliler ilk dönüşünü bekliyor.',
    letters: ['M', 'A', 'K', 'İ', 'N', 'E'],
    words: ['KİM', 'KİN', 'NEM', 'MANİ', 'MİNE', 'İNEK', 'EKİM', 'EKİN', 'MEKAN', 'MAKİNE'],
    scene: 'carkli',
    palette: { sky1: '#1A1630', sky2: '#4A3A5E', land1: '#4A4038', land2: '#272220', item: '#F0B65C', item2: '#B8763A', stem: '#8FA3B8', glow: '#FFE0A8' }
  },
  {
    id: 12,
    title: 'Uyanan Şehir',
    hint: 'Son ışıklar senin elinde.',
    letters: ['D', 'E', 'M', 'İ', 'R', 'K'],
    words: ['DEK', 'DEM', 'DİK', 'KİR', 'KİM', 'DERİ', 'KEDİ', 'EMİR', 'EKİM', 'DEMİR'],
    scene: 'sehir',
    palette: { sky1: '#101A3A', sky2: '#3B4E8C', land1: '#3A4360', land2: '#1D2236', item: '#BFD4FF', item2: '#6D85C7', stem: '#FFC978', glow: '#FFE9C0' }
  }
];
