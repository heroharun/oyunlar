# QA Raporu — Teşkilat: Gölge Protokol (Sprint 1-4)

Tarih: 2026-07-27 · Test ortamı: Chrome mobil emülasyonu (390×844 @3x dokunmatik, 360×640 @2x)

## Doğrulanan akış
Boot → Preload → Ana Menü → Brifing → Kamera Bulmacası → Çelişki Tespiti →
Sinyal Analizi → Uzman Seçimi → Rota Planlama → Kritik Karar → Operasyon Raporu →
(Tekrar Oyna / Ana Menü)

## Test sonuçları
- ✔ En iyi senaryo (hatasız, teknik+saha, çevre rotası, sinyali bastır) → SESSİZ BAŞARI, 5 rozet, kayıt yazıldı.
- ✔ Kötü senaryo (4 hata, merkez rotası, aracı durdur) → akış sonuna kadar ilerledi; en iyi derece kayıtta korundu.
- ✔ Yanlış seçimler sahne başına açıklamalı geri bildirim veriyor (sert "yanlış" ekranı yok).
- ✔ İpucu sistemi: aşama başına 2 kademeli ipucu, kullanınca sayaç düşüyor.
- ✔ Sahne yeniden başlatma (SIFIRLA) ve tekrar oynama state kaybı olmadan çalışıyor.
- ✔ Klavye: Enter (ilerle/onay) ve 1-4 (seçim) tüm karar sahnelerinde çalışıyor.
- ✔ localStorage kapalıyken SaveManager bellek içi çalışıyor, oyun çökmez (try/catch).
- ✔ Ses: WebAudio sentezi; dosya yok → yükleme hatası olamaz; AudioContext yoksa sessiz devam.
- ✔ 360×640 ve 390×844 ekranlarda taşma yok (Scale.FIT).
- ✔ Build: `tsc --noEmit` strict + vite temiz; ESLint (no-explicit-any) temiz.
- ✔ PWA: manifest.webmanifest, sw.js (önce ağ / çevrimdışı önbellek), 192/512/maskable ikonlar 200 dönüyor.
- ✔ Ağ isteği yok (Phaser paketi hariç, tek origin), analytics yok, izin talebi yok.

## Bulunan ve düzeltilen hatalar
1. Sonuç ekranı istatistik satırı 390px'te taşıyordu → 11px + wordWrap.
2. "Süre: 0 sn" — sahne saati (scene.time.now) sahne başında 0 → `game.getTime()` kullanıldı.
3. ChoiceCard `w/h` alan adları Phaser Container ile çakışıyordu → `cardW/cardH`.
4. PWA ikonları yanlış dizine üretilmişti → `public/icons/` altına taşındı.

## Bilinen sınırlar
- Phaser paketi 344 kB gzip (hedef 5 MB'ın çok altında, ancak code-split yapılmadı).
- Seslendirme (gerçek insan sesi) yok; telsiz anonsu altyazı + sentez efektle veriliyor.

## Genişletme Paketi (Bölüm 9, 11, 22 + Sezon Sistemleri) — 2026-07-27
- ✔ Operasyon Dosyaları ekranı: zincir kilidi çalışıyor (kilitli bölüme dokununca uyarı, açığa geçiş).
- ✔ Bölüm 9: kimlik ezberi → 3 sorgu (yanlış cevap şüphe ölçeri +25) → erişim noktası → sezon etkisi (güven/gizlilik riski).
- ✔ Bölüm 11: çelişkili ifade → log sıralama → sızan bilgi; iki güçlü şüpheli oluşuyor (teknik %50, kaynak %35), hain kesinleşmiyor.
- ✔ Bölüm 22: bilgi dağıtımında takas benzersizliği korunuyor; İHA raporu oyuncunun kendi dağıtımına göre dinamik; yanlış işaretleme sayılıyor; hain kaydediliyor.
- ✔ Ortak bölüm raporu: derece damgası + sezon etkisi (kötü artışlar kırmızı) + şüphe tablosu barları + cliffhanger.
- ✔ CampaignState localStorage'da; İlerlemeyi Sıfırla artık sezonu da sıfırlıyor.
- Düzeltilen: uzun brifing metni başlıkla çakışıyordu (kısaltıldı); son bölümde "Sonraki Bölüm" etiketi sızıyordu (init sıfırlama).

## Sezon Tamamlama (21 bölüm) — 2026-07-27
- ✔ 17 ara bölüm (10, 12-21, 23-28) veri odaklı bölüm motoruyla eklendi (info/quiz/order/pick adımları).
- ✔ Bölüm zinciri uçtan uca bot ile koşuldu: ep10 → ep28, aradaki özel sahneler (11, 22) dahil, 21/21 tamamlandı.
- ✔ Perde sekmeli dosya ekranı; açılışta kaldığın perdeye gider; kilit zinciri EPISODE_ORDER üzerinden.
- ✔ Bölüm 28 finali: 4 farklı son (Bedeli Ağır / Derin Gölge / Kusursuz / Sessiz Hesap), seçime göre son metni.
- ✔ Beyaz metinler parlatıldı (#dfe8f2 → #f4f8fd, soluk metin #a9bdd1).
- Düzeltilen: dosya satırlarında uzun başlık-durum çakışması (durum ikinci satıra alındı).
