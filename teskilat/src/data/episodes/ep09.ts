/** Bölüm 9 — Sahte Kimlik (Genişletme GDD §4). Tüm metinler veridedir. */

export interface IdentityField {
  label: string;
  value: string;
}

export interface GuardQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface AccessPoint {
  label: string;
  detail: string;
  suspicionCost: number;
}

export const EP09 = {
  id: 'ep09',
  title: 'BÖLÜM 9 · SAHTE KİMLİK',
  kicker: 'PERDE 2 · İÇERİ SIZMA',
  briefing: 'Karya Lojistik\'e sahte kimlikle gir. Kartı EZBERLE — kapıda elinde olmayacak.',
  memorizeHint: 'Kartı incele. Hazır olduğunda kapıya yaklaş.',
  memorizeDone: 'KAPIYA YAKLAŞ',
  identity: [
    { label: 'AD SOYAD', value: 'Murat Aksoy' },
    { label: 'GÖREV', value: 'Sevkiyat Şefi' },
    { label: 'GELDİĞİ ŞUBE', value: 'Konya Aktarma' },
    { label: 'ARAÇ PLAKASI', value: '42 KL 318' }
  ] as IdentityField[],
  guardIntro: 'Güvenlik görevlisi listeye bakıyor. Gözlerini senden ayırmıyor.',
  questions: [
    {
      question: '"İsmin ne demiştin?"',
      options: ['Mesut Aktaş', 'Murat Aksoy', 'Murat Akman', 'Mert Aksu'],
      correctIndex: 1
    },
    {
      question: '"Hangi şubeden geliyorsun?"',
      options: ['Ankara Depo', 'İzmir Liman', 'Konya Aktarma', 'Adana Transfer'],
      correctIndex: 2
    },
    {
      question: '"Aracının plakası kaçtı?"',
      options: ['42 KL 318', '42 LK 813', '34 KL 318', '42 KL 381'],
      correctIndex: 0
    }
  ] as GuardQuestion[],
  wrongAnswerFeedback: 'Görevlisi kaşlarını kaldırdı. Telsizine uzandı, sonra vazgeçti.',
  correctAnswerFeedback: 'Görevli başını salladı.',
  accessIntro: 'İçerdesin. Sevkiyat ofisine üç yoldan ulaşabilirsin.',
  accessPoints: [
    {
      label: 'A · ANA KORİDOR',
      detail: 'En kısa yol. Ancak iki kamera ve danışma masası var.',
      suspicionCost: 20
    },
    {
      label: 'B · YÜKLEME RAMPASI',
      detail: 'İşçilerin arasına karış. Sevkiyat şefi için doğal bir rota.',
      suspicionCost: 0
    },
    {
      label: 'C · PERSONEL MERDİVENİ',
      detail: 'Tenha. Ama yeni bir "şef"in burayı bilmesi tuhaf kaçabilir.',
      suspicionCost: 10
    }
  ] as AccessPoint[],
  cliffhanger:
    'Kimliğin sisteme işlendiği anda, binadaki bilinmeyen bir bağlantı ' +
    'merkeze veri gönderdi. Biri geldiğini biliyor.'
} as const;
