/* =========================================================
   Kelime Yörüngesi — dictionary.js
   Türkçe sözlük (tamamı BÜYÜK harf, Türkçe karakterli).
   Sadece geçerlilik kontrolü ve bonus kelime üretimi için kullanılır.
   Yeni kelime eklemek için listeye BÜYÜK harfle yaz, yeter.
   ========================================================= */

const KY_WORD_SOURCE = `
ABLA ADA ADAM ADIM AÇI AKIL AKIM AKIN ALEM ALIN ALMA ALTI ANA ANI ANNE ARI ARK ARKA ARPA ARZ ASA ASIL
AŞÇI AŞK ATA ATEŞ ATIK AVCI AYAK AYAZ AYI AYNA AZA
BABA BADE BAHÇE BAKIR BAL BALIK BASAMAK BAŞ BEBEK BEL BEN BEYİN BİBER BİLGİ BİNA BİR BORU BOY BOYA
BULUT BURUN BUZ BUZUL
CAM CAN CEKET CEP
ÇAKI ÇALI ÇAMUR ÇANTA ÇARK ÇATI ÇAYIR ÇEKİ ÇEKİÇ ÇİÇEK ÇİVİ ÇITA ÇOBAN
DAĞ DAL DAMLA DAM DAR DEDE DEFTER DEK DEM DEMİR DEN DENİZ DERE DERİ DERİN DEVE DİK DİKME DİL DİLEK
DİN DİZ DİZE DOLAP DOST DUT DUVAR DÜNYA
EKİM EKİN EKMEK ELA ELMA EMİR ERİK ESER EŞİK EVLAT
FİDAN FIRIN FISTIK
GAR GAZ GECE GEMİ GÖL GÖLGE GÖZ GÜL GÜNEŞ GÜN GÜR GÜRZ
HALI HAL HAN HAT HAVA HAYAT HEDEF HIRKA HIZ
ILIK ILK IRK IRMAK ISI IŞIK
İKİ İNCİ İNEK İPEK İRİ İSİM İZİN
KAÇ KADEH KAFA KALE KALEM KAP KAPI KAR KARA KAT KAYA KAZ KAZAN KEDİ KEL KELİME KEÇİ KEMER KİL KİM
KEMAN KİN KİR KİRAZ KİTAP KIL KIR KIŞ KOL KOLAY KOMŞU KÖK KÖPRÜ KÖR KÖY KUM KUŞ KUYU KUZU KÜP KÜR
LALE LAMA LAMBA LEKE LİMAN
MAÇ MAKİNE MAL MANİ MASA MASAL MEKAN MERAK MEYVE MİNE MOR MUTLU
NAKIŞ NAL NAR NEHİR NEM NİYET NORM NUR
OCAK ODA ODUN OKUL ORAN ORMAN OYA OYUN
ÖRDEK ÖRGÜ ÖRTÜ
PAK PARK PASTA PATİKA PAY PENCERE PERDE PUL
RAF RENK RESİM ROMAN RÜYA RÜZGAR
SABAH SABUN SAAT SAÇ SAL SALON SANAT SAP SAZ SEPET SES SEVGİ SICAK SIR SOKAK SÜT
ŞAL ŞEHİR ŞEKER ŞEN
TABAK TAÇ TAKI TAM TARLA TAS TAŞ TAVUK TAY TEK TEL TEN TEPE TİP TOP TOPRAK TUZ TÜY
UÇAK UFUK UZAY
ÜLKE ÜZÜM
VAPUR VATAN VAR
YAĞ YAN YAPRAK YARA YAY YAZ YAZI YEDİ YEL YELKEN YEM YENİ YER YIL YILDIZ YOL YOLCU YUVA YÜK YÜZ
ZAMAN ZAR ZEYTİN ZİL ZİYARET
`;

const KY_DICT = new Set(
  KY_WORD_SOURCE.split(/\s+/).filter(function (w) { return w.length > 1; })
);

/* Bir kelime, verilen harf havuzundan yazılabilir mi? (harf sayısına saygılı) */
function kyCanSpell(word, letters) {
  const pool = {};
  for (const l of letters) pool[l] = (pool[l] || 0) + 1;
  for (const ch of word) {
    if (!pool[ch]) return false;
    pool[ch]--;
  }
  return true;
}
