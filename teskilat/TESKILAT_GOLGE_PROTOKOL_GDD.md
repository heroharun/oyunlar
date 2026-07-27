# TEŞKİLAT: GÖLGE PROTOKOL
## Hackathon Oyun Tasarım Dokümanı, Teknik Plan ve Claude Code Başlangıç Rehberi

> **Proje hedefi:** Reklamsız, üyelik gerektirmeyen, kişisel veri toplamayan, kısa oturumlarla oynanabilen, mobil öncelikli ve Teşkilat evreninin ruhunu taşıyan sürükleyici bir taktik-istihbarat oyunu geliştirmek.

---

# 1. YÖNETİCİ ÖZETİ

**Teşkilat: Gölge Protokol**, oyuncuyu doğrudan silahlı çatışmanın içine atan klasik bir aksiyon oyunu değildir. Oyuncu; istihbarat parçalarını analiz eden, ekip üyelerini doğru görevlere yönlendiren ve kritik anlarda operasyonun kaderini belirleyen karar verici konumundadır.

Oyun üç temel vaade dayanır:

1. **Basit:** Tek parmakla, kısa görevlerle ve açıklayıcı arayüzle oynanır.
2. **Sürükleyici:** Her görev bir gizem, karar baskısı ve sonuç zinciri içerir.
3. **Güvenli:** Hesap, reklam, kişisel veri, kamera, mikrofon, konum ve cihaz kimliği gerektirmez.

Oyunun hackathon sürümü, 10-15 dakikada tamamlanabilen tek bir güçlü operasyon dosyasından oluşacaktır. Bu dosya; 4 farklı mini oyun mekaniği, 3 uzman karakter, 1 final kararı ve alternatif sonuçlar içerir.

---

# 2. ÜRÜN VİZYONU

## 2.1 Vizyon cümlesi

> Oyuncuya, üç dakikadan kısa görevlerde doğru bilgiyi doğru zamanda kullanarak görünmez bir operasyonu başarıyla yönetme hissi vermek.

## 2.2 Ürün pozisyonu

Bu oyun:

- Bir shooter değildir.
- Bir açık dünya oyunu değildir.
- Ağır strateji oyunu değildir.
- Uzun metinli görsel roman değildir.
- Reklam veya enerji sistemi üzerine kurulmaz.

Bu oyun:

- Mikro görevli bir istihbarat bulmacasıdır.
- Anlatı ve karar mekaniklerini birleştirir.
- Mobil cihazlarda hızlı açılır.
- Oyuncuya her turda “büyük resmi ben çözdüm” hissi verir.

## 2.3 Ana slogan seçenekleri

- **Görünmeyeni gör. Doğru kararı ver.**
- **Her bilgi doğru değildir. Her karar geri alınamaz.**
- **Operasyon sahada değil, zihinde başlar.**
- **Sessizlik bazen en büyük zaferdir.**

Hackathon sunumu için önerilen ana slogan:

> **Operasyon sahada değil, zihinde başlar.**

---

# 3. HEDEF KİTLE

## 3.1 Birincil hedef kitle

- Teşkilat dizisini takip eden izleyiciler
- 13 yaş ve üzeri kullanıcılar
- Kısa mobil oyunları sevenler
- Bulmaca, karar ve gizem oyunlarına ilgi duyanlar
- Oyun tecrübesi sınırlı olan yetişkin kullanıcılar

## 3.2 İkincil hedef kitle

- TRT ve tabii içeriklerini tüketen kullanıcılar
- Ailece oynanabilecek reklamsız içerik arayanlar
- Hikâyeli mini oyunlara ilgi duyan gençler

## 3.3 Erişilebilirlik hedefi

Oyunun ilk bir dakikasında kullanıcı şunları anlamalıdır:

- Nerede olduğunu
- Ne yapması gerektiğini
- Hangi bilgiye bakacağını
- Yanlış karar verirse ne olacağını

---

# 4. TEMEL OYUN DÖNGÜSÜ

Her görev aşağıdaki döngüyü kullanır:

1. **Brifing**
2. **İpucu toplama**
3. **Bilgi karşılaştırma**
4. **Uzman seçme**
5. **Kritik karar**
6. **Operasyon sonucu**
7. **Yeni bilgi açılması**

Bu döngü 2-4 dakika içinde tamamlanmalıdır.

## 4.1 Mikro döngü

- Oyuncu bir bilgi görür.
- Bilginin güvenilirliğini değerlendirir.
- Bir bağlantı kurar.
- Bir seçim yapar.
- Sistem anında geri bildirim verir.

## 4.2 Makro döngü

- Küçük görevler tamamlanır.
- Büyük operasyon dosyası açılır.
- Oyuncu gizli yapının parçalarını birleştirir.
- Final görevinde önceki kararların etkisi görünür.

---

# 5. HACKATHON DEMO KAPSAMI

## 5.1 Demo adı

**Operasyon: Kayıp Sinyal**

## 5.2 Demo süresi

- Ortalama: 8 dakika
- Hızlı oyuncu: 5 dakika
- Detaylı oyuncu: 12 dakika

## 5.3 Demo içeriği

Demo aşağıdaki bölümleri içermelidir:

1. Sinematik açılış
2. Kısa brifing
3. Kamera takibi mini oyunu
4. Çelişki tespiti mini oyunu
5. Sinyal analizi mini oyunu
6. Uzman görevlendirme ekranı
7. Harita üzerinde rota kararı
8. Kritik final seçimi
9. Sonuç ekranı
10. Operasyon raporu ve rozet

## 5.4 Demo başarı kriteri

Oyuncu şunu hissetmelidir:

> “Ben yalnızca bir bulmaca çözmedim, bir operasyon yönettim.”

---

# 6. HİKÂYE: OPERASYON KAYIP SİNYAL

## 6.1 Ana olay

Ankara’ya yaklaşan üç lojistik araçtan biri, uzaktan etkinleştirilecek gizli bir sinyal cihazı taşımaktadır. Araçları doğrudan durdurmak karşı tarafı alarma geçirecektir. Operasyon merkezi, cihazın hangi araçta olduğunu bulmalı ve tehdidi karşı taraf fark etmeden etkisiz hâle getirmelidir.

## 6.2 Oyuncunun rolü

Oyuncu, operasyon masasındaki karar sorumlusudur.

Oyuncu:

- Kamera kayıtlarını inceler.
- Zaman çizelgesindeki tutarsızlıkları bulur.
- Sürücü ifadelerini karşılaştırır.
- Sinyal yoğunluğunu analiz eder.
- Doğru uzmanı doğru noktaya gönderir.
- Operasyon yöntemini seçer.

## 6.3 Şüpheli araçlar

### Araç A

- Soğuk zincir aracı
- Rotası düzenli
- Kamera kayıtlarında gecikme yok
- Sürücü ifadesi tutarlı

### Araç B

- Tekstil sevkiyat aracı
- On iki dakikalık açıklanamayan rota kaybı
- Plaka görüntüsü bir kamerada kısmen kapalı
- Sürücü teslim saatini yanlış hatırlıyor

### Araç C

- Medikal yardım aracı
- Sinyal yoğunluğu yüksek görünüyor
- Ancak yoğunluk araçtan değil, yakındaki baz istasyonundan kaynaklanıyor
- Bilerek oluşturulmuş yanlış hedef

Doğru hedef: **Araç B**

## 6.4 Final kararı

Oyuncuya üç seçenek sunulur:

1. Aracı hemen durdur.
2. Sinyali uzaktan bastır ve aracı takip et.
3. Aracı kalabalık bölgeye girmeden rotadan ayır.

En iyi sonuç:

> **Sinyali uzaktan bastır ve aracı takip et.**

Bu sonuçta:

- Tehdit etkisizleşir.
- Karşı taraf operasyonu fark etmez.
- Daha büyük yapıya ulaşmak için yeni iz elde edilir.

---

# 7. OYUN MEKANİKLERİ

## 7.1 Kamera Takibi

Oyuncuya kısa kamera görüntüsü kartları gösterilir.

Görev:

- Aynı aracı farklı kameralarda takip etmek
- Saat, yön, plaka ve araç üzerindeki detayları eşleştirmek

### Etkileşim

- Kartlara dokunma
- Doğru sıraya sürükleme
- Şüpheli bölgeyi işaretleme

### Başarısızlık

Yanlış seçimde doğrudan “yanlış” yazmak yerine:

> “Zaman çizelgesi bu seçimle uyuşmuyor.”

şeklinde ipucu verilir.

---

## 7.2 Çelişki Tespiti

Oyuncuya dört ifade sunulur.

Örnek:

- Sürücü: “Saat 21.10’da tünele girdim.”
- Kamera: “Araç 21.04’te tünelden çıktı.”
- Sevkiyat kaydı: “Yükleme 20.45’te tamamlandı.”
- GPS: “21.07’de bağlantı kesildi.”

Oyuncu tutarsız ifadeyi seçer.

### Tasarım amacı

- Okuma becerisi
- Mantıksal karşılaştırma
- Dikkat

---

## 7.3 Sinyal Analizi

Oyuncuya üç sinyal grafiği veya dalga göstergesi gösterilir.

Görev:

- Hareketli kaynağı sabit kaynaktan ayırmak
- Ani yükselişi tespit etmek
- Yanlış pozitif sinyali elemek

Bu mekanik teknik görünmeli ancak gerçek dünyada kötüye kullanılabilecek ayrıntılı teknik bilgi içermemelidir.

### Görsel dil

- Basit dalga çizgileri
- Hareket eden tarama halkası
- Renk yerine şekil ve etiket desteği

---

## 7.4 Uzman Görevlendirme

Oyuncunun üç uzmanı vardır:

### Analist

- Belgeler arası bağlantı kurar
- Çelişki tespitinde avantaj sağlar

### Teknik Uzman

- Sinyal, kamera ve cihaz analizinde avantaj sağlar

### Saha Operatörü

- Fiziksel takip, güvenli müdahale ve rota kontrolünde avantaj sağlar

Her görevde yalnızca bir veya iki uzman seçilebilir.

### Tasarım amacı

Oyuncunun sadece doğru cevabı değil, doğru yöntemi de düşünmesini sağlamak.

---

## 7.5 Rota Planlama

Oyuncu küçük bir harita üzerinde ekibi hedefe yönlendirir.

Haritada:

- Kamera bölgeleri
- Trafik yoğunluğu
- Sivil kalabalık
- Güvenli geçiş noktası
- Şüpheli araç

bulunur.

Amaç en kısa yolu değil, en düşük riskli yolu bulmaktır.

---

## 7.6 Kritik Karar

Her operasyon sonunda oyuncuya net bir seçim sunulur.

Kararların üç metriğe etkisi vardır:

- Gizlilik
- Doğruluk
- Sivil güvenliği

Doğru karar her zaman en hızlı karar değildir.

---

# 8. PUANLAMA VE GERİ BİLDİRİM

## 8.1 Ana metrikler

### Gizlilik

Operasyonun karşı tarafça fark edilmeden yürütülmesi.

### Doğruluk

Bilgilerin doğru yorumlanması ve doğru hedefin seçilmesi.

### Sivil Güvenliği

Sivil riskin minimum seviyede tutulması.

## 8.2 Puan yerine değerlendirme

Klasik 100 puan sistemi yerine görev sonunda operasyon raporu gösterilir:

- **Sessiz Başarı**
- **Kontrollü Başarı**
- **Riskli Başarı**
- **Operasyon Deşifre Oldu**

## 8.3 Rozet sistemi

- Sessiz Operatör
- Keskin Analist
- Sıfır Sivil Risk
- Tek Seferde Çözüm
- Gölge Protokol

Rozetler yalnızca cihaz üzerinde saklanır.

---

# 9. SÜRÜKLEYİCİLİK TASARIMI

## 9.1 Merak döngüsü

Her görevin sonunda yeni bir soru açılmalıdır.

Örnek:

> “Cihaz etkisiz hâle getirildi. Ancak cihaz üzerindeki seri numarası, üç ay önce kapatılan başka bir dosyayla eşleşti.”

Bu cümle sonraki göreve doğal geçiş sağlar.

## 9.2 Bilgi katmanları

Oyuncuya tüm bilgiler aynı anda verilmez.

1. İlk bilgi
2. Çelişki
3. Yeni ipucu
4. Yanlış hedef
5. Gerçek bağlantı

## 9.3 Mikro ödüller

- Dosya damgası
- Kısa telsiz mesajı
- Yeni belge açılması
- Haritada yeni bağlantı
- Operasyon masasında görsel ilerleme

## 9.4 Tekrar oynanabilirlik

- Alternatif kararlar
- Farklı uzman kombinasyonları
- Ek ipucu kullanmadan tamamlama
- Daha kısa sürede çözme
- Gizli belge bulma

---

# 10. GÖRSEL TASARIM

## 10.1 Genel sanat yönü

- Koyu operasyon masası
- Mat yüzeyler
- Dosya kartları
- Tarama çizgileri
- Harita katmanları
- Sinyal efektleri
- Hafif analog parazit
- Minimal kırmızı vurgu
- Açık gri ve beyaz bilgi katmanları

## 10.2 Görsel hedef

Arayüz bir oyun ile operasyon kontrol paneli arasında durmalıdır.

Çok teknik olmamalıdır.
Çok oyuncak gibi görünmemelidir.
Çok karanlık olup okunabilirliği düşürmemelidir.

## 10.3 Ekranlar

- Açılış ekranı
- Ana operasyon masası
- Görev brifingi
- Kamera analizi
- Belge karşılaştırma
- Sinyal analizi
- Uzman seçimi
- Harita rotası
- Kritik karar
- Sonuç raporu

## 10.4 Animasyon dili

- Dosya açılma
- Tarama çizgisi
- Harita yakınlaşma
- Sinyal halkası
- Onay damgası
- Ekran parazit geçişi
- Telsiz konuşmasında hafif dalga animasyonu

Animasyonlar kısa tutulmalıdır.

Önerilen süreler:

- Buton geri bildirimi: 100-150 ms
- Kart geçişi: 200-300 ms
- Sahne geçişi: 400-700 ms
- Sonuç damgası: 600-900 ms

---

# 11. MÜZİK VE SES TASARIMI

## 11.1 Müzik hedefi

Müzik oyuncuyu yormadan gerilim oluşturmalıdır.

Müzik:

- Sürekli yüksek tempoda olmamalı
- Diyalog ve görev ipuçlarını bastırmamalı
- Tekrar döngüsünde rahatsız edici olmamalı
- Gerilim arttıkça katman eklemeli

## 11.2 Müzik katmanları

### Katman 1: Operasyon Masası

- Düşük tempolu elektronik drone
- Hafif vurmalı ritim
- Düşük frekanslı nabız hissi

### Katman 2: Analiz

- Aralıklı kısa synth notaları
- Hafif saat tıklaması
- Yumuşak veri tarama efektleri

### Katman 3: Kritik Karar

- Tempo artışı
- Derin bas vuruşları
- Kısa yaylı gerilim katmanı

### Katman 4: Başarı

- Kısa, ağırbaşlı ve zafer hissi veren motif
- Abartılı kahramanlık müziğinden kaçınılmalı

### Katman 5: Başarısızlık

- Ani sert ses yerine kontrollü ton düşüşü
- Oyuncuyu cezalandırmayan geri bildirim

## 11.3 Dinamik müzik sistemi

Müzik tek parça olarak oynatılmak yerine katmanlı tasarlanmalıdır.

Durumlar:

- idle
- investigation
- suspicion
- critical
- success
- failure

Oyun durumu değiştiğinde müzik katmanı yumuşak geçişle değişir.

## 11.4 Ses efektleri

Gerekli sesler:

- Kart açma
- Belge çevirme
- Telsiz açılma
- Telsiz kapanma
- Harita işaretleme
- Tarama başlatma
- Sinyal yakalama
- Karar onayı
- Uyarı
- Başarı damgası
- Görev tamamlandı
- Buton tıklama
- Geri dönüş

## 11.5 Sesli anlatım

Hackathon için tam seslendirme zorunlu değildir.

Önerilen minimum:

- Açılışta 1 kısa komuta cümlesi
- Kritik karar öncesinde 1 telsiz cümlesi
- Başarı sonunda 1 kapanış cümlesi

Örnek:

> “Merkez, sinyal yeniden aktif. Karar için otuz saniyeniz var.”

## 11.6 Ses erişilebilirliği

- Müzik kapatma seçeneği
- Efekt kapatma seçeneği
- Tüm sesli diyaloglar için altyazı
- Kritik bilgilerin yalnızca sesle verilmemesi

---

# 12. KULLANICI DENEYİMİ

## 12.1 İlk açılış

Oyuncudan hiçbir izin istenmez.

İlk ekran:

- Oyuna Başla
- Ses
- Erişilebilirlik
- Gizlilik

## 12.2 Eğitim sistemi

Uzun eğitim ekranları kullanılmamalıdır.

Eğitim, ilk görev içinde bağlamsal olarak verilir.

Örnek:

> “Kamera kartlarını zaman sırasına göre yerleştir.”

## 12.3 Hata geri bildirimi

Yanlış seçimlerde:

- Oyuncu küçük düşürülmez.
- Sert kırmızı ekran kullanılmaz.
- Neden yanlış olduğu kısaca açıklanır.
- Bir sonraki deneme için ipucu sunulur.

## 12.4 İpucu sistemi

Oyuncu her görevde en fazla iki ipucu kullanabilir.

İpucu kullanımı ücretsizdir.
Reklam izletilmez.
Puan satın alma yoktur.

İpucu seviyeleri:

1. Yönlendirme
2. Daraltma
3. Çözüm açıklaması

Hackathon demosunda ilk iki seviye yeterlidir.

---

# 13. ERİŞİLEBİLİRLİK

## 13.1 Görsel erişilebilirlik

- Yüksek kontrast modu
- Büyük yazı seçeneği
- Renk körlüğüne uygun işaretler
- Renge ek olarak ikon ve metin kullanımı
- Yanıp sönen yoğun efektlerden kaçınma

## 13.2 Motor erişilebilirlik

- Tek parmakla oynanabilirlik
- Küçük hedeflerden kaçınma
- Sürükleme yerine dokunarak seçim alternatifi
- Zaman baskısı kapatma seçeneği

## 13.3 Bilişsel erişilebilirlik

- Kısa cümleler
- Aynı anda az bilgi
- Açık görev hedefi
- Görev sırasında hedefi yeniden görme
- Karmaşık jargonun azaltılması

---

# 14. GİZLİLİK VE VERİ TASARIMI

## 14.1 Temel ilke

> Oyun, çalışmak için oyuncunun kim olduğunu bilmek zorunda değildir.

## 14.2 Toplanmayacak veriler

- Ad
- Soyad
- E-posta
- Telefon
- Konum
- IP kaydı
- Reklam kimliği
- Cihaz parmak izi
- Kamera
- Mikrofon
- Kişiler
- Sosyal medya hesabı
- Kullanıcı davranış profili

## 14.3 Yerel kayıt

Aşağıdaki bilgiler yalnızca cihazda saklanabilir:

- Tamamlanan görevler
- Açılan rozetler
- Ses ayarları
- Erişilebilirlik ayarları
- Son oynanan bölüm

Bu veri:

- Sunucuya gönderilmez.
- Başka kullanıcıyla paylaşılmaz.
- Kullanıcı tarafından “İlerlemeyi Sıfırla” seçeneğiyle silinebilir.

## 14.4 Teknik saklama seçenekleri

Önerilen sıra:

1. localStorage
2. IndexedDB
3. Platform içi anonim yerel depolama

Hackathon için localStorage yeterlidir.

## 14.5 Telemetri

Hackathon sürümünde telemetri tamamen kapalı olmalıdır.

Ürün sürümünde ölçüm gerekiyorsa yalnızca anonim ve toplu sayaç düşünülmelidir.

Örnek:

- Görev açılma sayısı
- Görev tamamlanma sayısı
- Ortalama görev süresi

Ancak kullanıcı bazlı profil, cihaz kimliği veya oturum takibi yapılmamalıdır.

---

# 15. TEKNİK MİMARİ

## 15.1 Önerilen teknoloji yığını

- TypeScript
- Vite
- Phaser 3
- HTML5 Canvas
- CSS
- Web Audio API veya Howler.js
- localStorage
- PWA desteği

## 15.2 Neden Phaser

- Mobil web için uygundur.
- Sahne yönetimi sağlar.
- Girdi, ses, animasyon ve ölçekleme kolaydır.
- Hızlı prototip üretilebilir.
- Claude Code ile modüler geliştirmeye uygundur.

## 15.3 Alternatif teknoloji

Daha çok arayüz ağırlıklı ilerlemek istenirse:

- React
- TypeScript
- Framer Motion
- Web Audio API

Ancak hackathon için oyun hissini daha hızlı vermek amacıyla Phaser önerilir.

## 15.4 Mimari prensipler

- Veri odaklı görev sistemi
- Sahne bazlı yapı
- İçerik ve kod ayrımı
- Tek sorumluluk prensibi
- Offline çalışma
- Sunucusuz MVP
- Asset bağımsızlığı

---

# 16. PROJE KLASÖR YAPISI

```text
src/
  app/
    Game.ts
    config.ts
  scenes/
    BootScene.ts
    PreloadScene.ts
    MainMenuScene.ts
    BriefingScene.ts
    CameraPuzzleScene.ts
    ContradictionScene.ts
    SignalScene.ts
    SpecialistScene.ts
    RouteScene.ts
    DecisionScene.ts
    ResultScene.ts
  systems/
    AudioManager.ts
    SaveManager.ts
    AccessibilityManager.ts
    MissionManager.ts
    TransitionManager.ts
  components/
    PrimaryButton.ts
    MissionCard.ts
    DialogueBox.ts
    ProgressBar.ts
    StatusMeter.ts
  data/
    missions/
      mission-001.ts
    dialogues/
      tr.ts
    specialists.ts
    badges.ts
  types/
    mission.ts
    game.ts
  utils/
    constants.ts
    responsive.ts
    validation.ts
  assets/
    audio/
      music/
      sfx/
    images/
      ui/
      maps/
      portraits/
    fonts/
public/
  manifest.webmanifest
  icons/
```

---

# 17. GÖREV VERİ MODELİ

```ts
export interface Mission {
  id: string;
  title: string;
  codename: string;
  briefing: Briefing;
  stages: MissionStage[];
  specialists: SpecialistId[];
  finalDecision: FinalDecision;
  outcomes: MissionOutcome[];
}

export interface Briefing {
  headline: string;
  description: string;
  objective: string;
  estimatedMinutes: number;
}

export type MissionStage =
  | CameraPuzzleStage
  | ContradictionStage
  | SignalAnalysisStage
  | SpecialistSelectionStage
  | RoutePlanningStage;

export interface MissionOutcome {
  id: string;
  title: string;
  description: string;
  secrecy: number;
  accuracy: number;
  civilianSafety: number;
  unlocks?: string[];
}
```

---

# 18. SAHNE AKIŞI

```text
Boot
  ↓
Preload
  ↓
Main Menu
  ↓
Briefing
  ↓
Camera Puzzle
  ↓
Contradiction Puzzle
  ↓
Signal Analysis
  ↓
Specialist Selection
  ↓
Route Planning
  ↓
Critical Decision
  ↓
Mission Result
  ↓
Main Menu / Replay
```

---

# 19. OYUN DURUMLARI

```ts
export type GamePhase =
  | 'boot'
  | 'menu'
  | 'briefing'
  | 'investigation'
  | 'analysis'
  | 'specialist-selection'
  | 'route-planning'
  | 'critical-decision'
  | 'result';
```

Müzik ve arayüz, oyun durumuna göre güncellenmelidir.

---

# 20. SES YÖNETİMİ

```ts
export type MusicState =
  | 'idle'
  | 'investigation'
  | 'suspicion'
  | 'critical'
  | 'success'
  | 'failure';

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}
```

AudioManager şu işleri yapmalıdır:

- Müzik geçişi
- Crossfade
- Ses seviyesi
- Müzik aç/kapat
- Efekt aç/kapat
- Kullanıcı etkileşimi sonrası ses başlatma
- Mobil tarayıcı uyumluluğu

---

# 21. RESPONSIVE TASARIM

## 21.1 Hedef ekranlar

- 360x640
- 390x844
- 412x915
- Tablet yatay
- Masaüstü tarayıcı

## 21.2 Ana kural

Oyun mobil dikey ekran için tasarlanmalıdır.

Masaüstünde oyun alanı ortalanmalı, ancak mobil görünüm korunmalıdır.

## 21.3 Güvenli alan

- Üst çentik alanı
- Alt tarayıcı çubuğu
- Dokunmatik hedefler
- Yatay taşma kontrolü

---

# 22. PERFORMANS HEDEFLERİ

- İlk yükleme: mümkünse 5 MB altında
- Ana sahne açılışı: 3 saniye altında
- 30 FPS altına düşmeme
- Orta seviye mobil cihazlarda çalışma
- Tek görevde 50 MB üzeri bellek tüketmemeye çalışma
- Görselleri WebP kullanma
- Sesleri sıkıştırılmış formatta sunma
- Gereksiz büyük video kullanmama

---

# 23. OFFLINE VE PWA

## 23.1 PWA özellikleri

- Ana ekrana ekleme
- Offline oynama
- Uygulama benzeri açılış
- Hızlı tekrar giriş

## 23.2 Offline kapsamı

İlk yüklemeden sonra:

- Demo görevi
- Tüm görseller
- Tüm sesler
- Kayıt sistemi

çevrimdışı çalışmalıdır.

---

# 24. GÜVENLİK

- Harici API kullanılmamalı
- Gizli anahtar bulunmamalı
- Kullanıcı girdileri sınırlı tutulmalı
- HTML enjeksiyonuna açık metin alanı olmamalı
- Harici linkler yeni sekmede ve güvenli açılmalı
- Dosya sistemi erişimi olmamalı
- Kamera, mikrofon, konum izinleri olmamalı

---

# 25. İÇERİK GÜVENLİĞİ

- Gerçek operasyon yöntemleri ayrıntılı öğretilmemeli
- Gerçek kurum içi prosedürler taklit edilmemeli
- Patlayıcı, silah, takip veya sabotaj konusunda uygulanabilir teknik bilgi verilmemeli
- Tüm araçlar, kodlar ve yöntemler kurgu olmalı
- Sivil güvenlik öncelikli gösterilmeli
- Şiddet görseli minimumda tutulmalı

---

# 26. FİKRİ MÜLKİYET VE MARKA

Hackathon sürecinde şu ayrım korunmalıdır:

## Onaylı varlık varsa

- Dizi logosu
- Oyuncu görselleri
- Müzik
- Ses kayıtları
- Karakter isimleri

kullanılabilir.

## Onaylı varlık yoksa

- Geçici logo
- Stilize siluetler
- Özgün müzik
- Kurgu karakter isimleri
- Temsili operasyon arayüzü

kullanılmalıdır.

Sunumda şu not yer almalıdır:

> Demo içindeki marka varlıkları, üretim sürümünde lisans ve yayın onayı sonrasında nihai hâline getirilecektir.

---

# 27. HACKATHON İÇİN FARK YARATAN ÖZELLİKLER

## 27.1 Kişisel veri toplamayan oyun

Bu, yalnızca teknik detay değil ürün vaadi olarak sunulmalıdır.

## 27.2 Diziyi izleme deneyimini genişleten yapı

Oyun dizinin bölümünü tekrar anlatmaz.
Dizideki dünyanın bir parçası gibi hissettirir.

## 27.3 Kısa ama sinematik deneyim

10 dakikalık demo, uzun bir oyun fragmanı gibi değil, tamamlanmış bir mini operasyon gibi hissettirilmelidir.

## 27.4 Dinamik ses

Müzik, oyuncunun seçimlerine göre yoğunlaşmalıdır.
Bu özellik sunumda mutlaka canlı gösterilmelidir.

## 27.5 Alternatif sonuç

Jüriye iki farklı final gösterilebilir.
Bu, sistemin tekrar oynanabilirliğini kanıtlar.

## 27.6 Erişilebilirlik

Zaman baskısını kapatma, büyük yazı ve ses kapatma seçenekleri ürün olgunluğu gösterir.

---

# 28. JÜRİ SUNUM AKIŞI

## 28.1 Açılış

> “Teşkilat’ı oyuna çevirirken ilk düşündüğümüz şey silahlar değil, karar baskısı oldu.”

## 28.2 Problem

- Dizi oyunları genelde pahalı aksiyon yapımlarına dönüşür.
- Mobil kullanıcı kısa sürede değer görmek ister.
- Reklam ve üyelik deneyimi bozar.
- Kişisel veri toplama güven sorununa yol açar.

## 28.3 Çözüm

> “Üç dakikalık operasyonlar, sıfır üyelik, sıfır reklam, sıfır kişisel veri.”

## 28.4 Canlı demo

1. Kamera takibi
2. Sinyal analizi
3. Uzman seçimi
4. Kritik karar
5. Dinamik müzik
6. Sonuç raporu

## 28.5 Ürün avantajı

- Düşük üretim maliyeti
- Yeni görev eklemeye uygun yapı
- Web, mobil ve tabii içinde çalışabilir
- Geniş yaş kitlesi
- Güvenli marka deneyimi

## 28.6 Kapanış

> “Bu oyun, Teşkilat’ı izleyen kişiyi seyirciden karar vericiye dönüştürüyor.”

---

# 29. MVP ÖNCELİKLERİ

## P0: Olmazsa olmaz

- Açılış ekranı
- Brifing
- 3 mini oyun
- Uzman seçimi
- Final kararı
- Sonuç ekranı
- Müzik ve temel ses efektleri
- Yerel kayıt
- Mobil responsive yapı

## P1: Güçlü katkı

- Dinamik müzik katmanları
- Rozet sistemi
- Alternatif sonuç
- Erişilebilirlik menüsü
- PWA

## P2: Zaman kalırsa

- Ek görev
- Seslendirme
- Gelişmiş animasyon
- Çoklu dil
- Gizli belge sistemi

---

# 30. GELİŞTİRME SPRINTLERİ

## Sprint 1: Temel iskelet

- Vite + TypeScript + Phaser kurulumu
- Sahne sistemi
- Responsive canvas
- Ana menü
- Geçiş sistemi

## Sprint 2: Oyun mekanikleri

- Kamera bulmacası
- Çelişki tespiti
- Sinyal analizi
- Uzman seçimi

## Sprint 3: Final akışı

- Rota ekranı
- Kritik karar
- Sonuç hesaplama
- Alternatif sonlar

## Sprint 4: Sunum kalitesi

- Müzik
- Ses efektleri
- Animasyon
- Erişilebilirlik
- PWA
- QA

---

# 31. CLAUDE CODE İÇİN ANA KOMUT

Aşağıdaki komut proje klasörünün kökünde Claude Code’a verilmelidir:

```text
Bu repoda mobil öncelikli, TypeScript + Vite + Phaser 3 tabanlı bir oyun geliştireceğiz.
Projenin adı “Teşkilat: Gölge Protokol”.

Önce TEŞKİLAT_GÖLGE_PROTOKOL_GDD.md dosyasını tamamen oku.
Ardından aşağıdaki sırayla ilerle:

1. Proje mimarisini kur.
2. Klasör yapısını oluştur.
3. TypeScript strict modunu etkinleştir.
4. Phaser sahnelerini boş iskelet olarak oluştur.
5. Mobil dikey responsive canvas yapısını kur.
6. MainMenuScene, BriefingScene ve CameraPuzzleScene sahnelerini çalışır hâle getir.
7. Tüm metinleri veri dosyalarından oku.
8. Kod içinde sabit görev metni kullanma.
9. SaveManager ile localStorage tabanlı kayıt sistemi kur.
10. AudioManager için müzik ve efekt API’si oluştur.
11. Kamera bulmacasını tamamla.
12. Her aşamadan sonra uygulamayı çalıştır, hataları düzelt ve lint kontrolü yap.

Kurallar:
- React kullanma.
- Backend kurma.
- Harici API kullanma.
- Analytics ekleme.
- Reklam ekleme.
- Kullanıcı hesabı oluşturma.
- Kamera, mikrofon, konum veya cihaz izni isteme.
- Kişisel veri toplama.
- Kodda any kullanma.
- Büyük tek dosyalar oluşturma.
- Her sınıfın tek sorumluluğu olsun.
- Mobil cihazlarda dokunmatik hedefleri en az 44px yap.
- Tüm butonlar klavye ile de çalışabilsin.
- Renk dışında ikon ve metin ile durum belirt.

İlk hedef: Ana menüden başlayan, brifing ekranına geçen ve kamera kartlarını doğru sıraya dizerek tamamlanan oynanabilir bir vertical slice oluştur.
```

---

# 32. CLAUDE CODE İÇİN İKİNCİ KOMUT

İlk vertical slice tamamlandıktan sonra:

```text
Şimdi TEŞKİLAT_GÖLGE_PROTOKOL_GDD.md dosyasındaki Operasyon Kayıp Sinyal görevini tamamla.

Eklenmesi gereken sahneler:
- ContradictionScene
- SignalScene
- SpecialistScene
- RouteScene
- DecisionScene
- ResultScene

Görev akışı:
Briefing → Camera Puzzle → Contradiction → Signal Analysis → Specialist Selection → Route Planning → Final Decision → Result

Her sahne:
- Mobil uyumlu olsun.
- Yeniden başlatılabilsin.
- State kaybı yaşamadan sonraki sahneye geçsin.
- Kullanıcıya açık geri bildirim versin.
- Erişilebilirlik ayarlarına uyumlu olsun.

Sonuç ekranında şu metrikler gösterilsin:
- Gizlilik
- Doğruluk
- Sivil Güvenliği

Üç farklı sonuç üret:
- Sessiz Başarı
- Kontrollü Başarı
- Operasyon Deşifre Oldu

Kod tamamlandıktan sonra:
- npm run build
- npm run lint
- varsa testleri çalıştır
- mobil görünüm hatalarını düzelt
- tüm console error ve warning kayıtlarını temizle
```

---

# 33. CLAUDE CODE İÇİN SES KOMUTU

```text
Oyuna veri odaklı bir AudioManager ekle.

İstenen durumlar:
- idle
- investigation
- suspicion
- critical
- success
- failure

Özellikler:
- Crossfade
- Music on/off
- SFX on/off
- Ses seviyesi kontrolü
- Ayarları localStorage içinde saklama
- Mobil tarayıcı autoplay kısıtlarına uyum
- Sahne değişiminde müziğin kesilmemesi
- Aynı müziğin üst üste başlamaması

Geçici ses dosyaları yoksa sessiz fallback ile çalışsın.
AudioManager hiçbir durumda uygulamayı çökertmesin.
```

---

# 34. CLAUDE CODE İÇİN QA KOMUTU

```text
Projeyi hackathon demosu seviyesinde QA kontrolünden geçir.

Kontrol listesi:
- 360x640 ekranda taşma var mı?
- 390x844 ekranda butonlar erişilebilir mi?
- Masaüstünde oyun alanı düzgün ortalanıyor mu?
- Tüm sahneler geri ve ileri çalışıyor mu?
- Yeniden oynama düzgün çalışıyor mu?
- localStorage kapalıysa oyun çöküyor mu?
- Ses dosyası yüklenmezse oyun çöküyor mu?
- Klavye ile tüm ana aksiyonlar yapılabiliyor mu?
- Renk körü kullanıcılar için bilgi yalnızca renkle mi veriliyor?
- Hızlı art arda tıklamada sahne iki kez açılıyor mu?
- Ekran döndürmede yerleşim bozuluyor mu?
- Build hatası var mı?
- Console warning var mı?
- Kullanılmayan asset var mı?
- Büyük asset yüklemeyi yavaşlatıyor mu?

Bulduğun her problemi düzelt.
Sonunda QA_REPORT.md oluştur ve yapılan düzeltmeleri yaz.
```

---

# 35. KABUL KRİTERLERİ

## Ana menü

- Oyun başlatılabiliyor.
- Ses ayarları açılabiliyor.
- Gizlilik metni okunabiliyor.

## Brifing

- Görev amacı açık.
- İleri butonu çalışıyor.
- Metin mobil ekrana sığıyor.

## Kamera bulmacası

- Kartlar seçilebiliyor.
- Doğru sıra algılanıyor.
- Yanlış seçim açıklanıyor.
- İpucu çalışıyor.

## Çelişki bulmacası

- Tek seçenek seçiliyor.
- Doğru cevap açıklanıyor.
- Yanlış cevapta ipucu var.

## Sinyal analizi

- Üç hedef karşılaştırılıyor.
- Yanlış pozitif açıklanıyor.
- Seçim sonucu net.

## Uzman seçimi

- Uzman yetenekleri görülebiliyor.
- Seçim görev sonucunu etkiliyor.

## Rota

- Riskli ve güvenli yollar ayrılıyor.
- En kısa yolun her zaman en iyi olmadığı gösteriliyor.

## Final

- Üç seçenek var.
- Seçimin sonucu farklılaşıyor.
- Sonuç ekranı doğru metriği gösteriyor.

---

# 36. QA KONTROL LİSTESİ

## Fonksiyonel

- [ ] Tüm sahneler açılıyor
- [ ] Geri tuşu kontrollü çalışıyor
- [ ] Yeniden başlatma çalışıyor
- [ ] Doğru sonuç hesaplanıyor
- [ ] Yanlış seçimler açıklanıyor
- [ ] Kayıt yükleniyor
- [ ] Kayıt sıfırlanıyor

## Mobil

- [ ] Dikey görünüm düzgün
- [ ] Dokunmatik hedefler yeterli
- [ ] Metin taşmıyor
- [ ] Alt çubuk içeriği kapatmıyor
- [ ] Ekran döndürme bozmuyor

## Ses

- [ ] Müzik aç/kapat
- [ ] Efekt aç/kapat
- [ ] Ses sahne geçişinde bozulmuyor
- [ ] Ses yüklenmezse oyun devam ediyor

## Erişilebilirlik

- [ ] Büyük yazı
- [ ] Yüksek kontrast
- [ ] Renk dışında işaret
- [ ] Klavye desteği
- [ ] Altyazı

## Gizlilik

- [ ] Ağ isteği yok
- [ ] Analytics yok
- [ ] Çerez yok
- [ ] Kullanıcı hesabı yok
- [ ] İzin talebi yok

## Performans

- [ ] İlk açılış hızlı
- [ ] Asset boyutları optimize
- [ ] Hafıza sızıntısı yok
- [ ] Sahne geçişinde eski nesneler temizleniyor

---

# 37. RİSKLER VE ÖNLEMLER

## Risk: Scope büyümesi

Önlem:

- Tek görev
- Üç ana mini oyun
- Tek final
- P0 dışı özellikleri sona bırakma

## Risk: Görsel kalite düşük kalabilir

Önlem:

- Tutarlı UI sistemi
- Az ama iyi animasyon
- Güçlü ses tasarımı
- Stilize dosya ve harita yaklaşımı

## Risk: Oyun fazla metin ağırlıklı olabilir

Önlem:

- Metinleri 1-3 cümleyle sınırla
- Bilgiyi kartlara böl
- Görsel işaret kullan

## Risk: Bulmacalar fazla kolay olabilir

Önlem:

- Yanlış hedef
- Çelişkili bilgi
- Zaman sıralaması
- Uzman etkisi

## Risk: Bulmacalar fazla zor olabilir

Önlem:

- Kademeli ipucu
- İlk görevde öğretici tasarım
- Kritik bilgileri vurgulama

## Risk: Marka onayı

Önlem:

- Geçici özgün asset
- Oyuncu yüzü kullanmama
- Lisans notu

---

# 38. DEMO GÜNÜ HAZIRLIK LİSTESİ

- [ ] İnternetsiz çalışan build
- [ ] Yedek laptop
- [ ] Yedek telefon
- [ ] Sessiz ortam için kulaklık
- [ ] Sesli sunum için hoparlör testi
- [ ] Demo reset butonu
- [ ] 3 dakikalık kısa demo rotası
- [ ] 8 dakikalık tam demo rotası
- [ ] Video yedek kaydı
- [ ] QR kod
- [ ] Gizlilik ekranı
- [ ] İki farklı final hazır
- [ ] Jüri sorularına cevap dokümanı

---

# 39. JÜRİDEN GELEBİLECEK SORULAR

## “Neden aksiyon oyunu değil?”

Çünkü Teşkilat’ın ayırt edici yönü yalnızca çatışma değil, istihbarat, ekip koordinasyonu ve doğru karar verme baskısıdır. Ayrıca bu yaklaşım daha geniş yaş kitlesine ulaşır ve mobilde daha erişilebilirdir.

## “Oyuncu neden tekrar oynasın?”

Alternatif kararlar, farklı uzman kombinasyonları, gizli belgeler ve daha iyi operasyon raporu için.

## “Gelir modeli yok mu?”

Bu proje doğrudan gelir değil, marka etkileşimi, platform sadakati ve içerik evrenini genişletme amacı taşır. Reklamsız oluşu ürünün güven değerini artırır.

## “Veri toplamadan ölçüm nasıl yapılır?”

Hackathon sürümünde ölçüm yapılmaz. Ürün sürümünde yalnızca anonim ve toplu görev sayaçları değerlendirilebilir.

## “Yeni içerik eklemek zor mu?”

Hayır. Görevler veri dosyalarından tanımlanır. Yeni görev eklemek için ana oyun motorunu değiştirmek gerekmez.

---

# 40. GELECEK SÜRÜMLER

- Haftalık operasyonlar
- Sezonluk hikâye dosyaları
- İki kişilik ortak karar modu
- QR kodla bölüm içi gizli belge açma
- tabii içi görev bağlantıları
- Çoklu dil
- Tablet masa modu
- Öğretici medya okuryazarlığı görevleri
- Dezenformasyon tespiti görevleri

---

# 41. SON KARAR

Bu projenin başarısı, çok fazla özellik eklemekten değil, şu üç şeyi kusursuz yapmaktan geçer:

1. **Gerçekten iyi bir görev**
2. **Gerilimi yükselten ses tasarımı**
3. **Kararın sonucunu hissettiren final**

Hackathon demosu tamamlandığında oyuncu şunu söylemelidir:

> “Sadece doğru cevabı bulmadım. Operasyonu ben yönettim.”

