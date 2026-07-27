import type { SuspectId } from '../../systems/Campaign';

/** Bölüm 22 — İkili Oyun: kontrollü bilgi sızdırma (Genişletme GDD §4). */

export interface TrapSuspect {
  id: SuspectId;
  name: string;
  note: string;
}

export interface FakeInfo {
  code: string;
  text: string;
}

export const EP22 = {
  id: 'ep22',
  title: 'BÖLÜM 22 · İKİLİ OYUN',
  kicker: 'PERDE 3 · HAİNİN GÖLGESİ',
  briefing: 'Tuzak: üç şüpheliye ÜÇ FARKLI sahte bilgi ver. Düşman hangisine tepki verirse sızıntı odur.',
  assignInstruction: 'Her şüpheliye bir sahte bilgi ata. Şüpheliye dokun: bilgi değişir.',
  suspects: [
    { id: 'teknik', name: 'TEKNİK UZMAN', note: 'Hesabı sızıntı gecesi kullanılmıştı.' },
    { id: 'kaynak', name: 'HABER KAYNAĞI', note: 'Bilgiyi dışarı taşıyabilecek tek sivil.' },
    { id: 'amir', name: 'OPERASYON AMİRİ', note: 'Saatleri bilen en yetkili kişi.' }
  ] as TrapSuspect[],
  infos: [
    { code: 'KIRMIZI', text: 'Liman baskını · Cuma 04.00' },
    { code: 'MAVİ', text: 'Depo araması · Perşembe 23.00' },
    { code: 'SARI', text: 'Konvoy denetimi · Cumartesi 06.00' }
  ] as FakeInfo[],
  assignConfirm: 'BİLGİLERİ DAĞIT',
  waitTitle: '72 SAAT SONRA',
  /**
   * İHA raporu şablonu: {code} gerçek haine verilen bilginin kod adıyla,
   * {plan} o bilginin içeriğiyle değiştirilir.
   */
  reactionReport:
    'İHA kaydı: düşman, "{plan}" planındaki hedefi operasyondan SAATLER ÖNCE boşalttı. ' +
    'Yani dışarı sızan bilgi {code} koduydu.',
  pickInstruction: '{code} kodlu bilgiyi kime vermiştin? Sızıntının kaynağını işaretle.',
  pickWrong: 'Dağıtımını hatırla: o bilgi bu kişiye verilmemişti.',
  pickExplanation:
    'Düşman yalnızca tek plana tepki verdi — o bilgi tek kişiye verilmişti. Sızıntı kesin. ' +
    'Panodaki "klonlanmış plaka" izini de kendisi bırakmış: kendine komplo süsü vererek şüpheyi dağıtmayı denedi.',
  /** Gerçek hain (düşman bu kişiye verilen bilgiye tepki verir). */
  traitor: 'teknik' as SuspectId,
  cliffhanger:
    'Hain belli oldu. Ama telsizden gelen son mesaj her şeyi değiştirdi: ' +
    '"Yalnız olduğumu mu sandınız?" — Hain tek başına değil.'
} as const;
