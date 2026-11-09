/* Masal Park — Sesli Masal verisi: Külkedisi ve Bayramın En Güzel Hediyesi
   Görseller: masal/kulkedisi/NN.webp, kapak: kapak.webp
   Seslendirme: masal/kulkedisi/ses/{dil}/NN.mp3 (Gemini TTS, arac/sesli-masal-seslendir.mjs --masal sesli-masallar/masal/kulkedisi/veri.js)
   Şimdilik yalnız Türkçe; oynatıcı diğer dillerde metni ve sesi Türkçeye düşürür. */
(function () {
  'use strict';
  var A = ['kb-in-left', 'kb-out-soft', 'kb-in-center'];
  var sahneler = [
    'Bir varmış, bir yokmuş… Evvel zaman içinde, güzel mi güzel bir şehirde iyi kalpli bir kız yaşarmış. Annesini küçük yaşta kaybeden bu kıza, evdekiler sürekli ocak başında iş yaptırdıkları için Külkedisi derlermiş. Külkedisi buna üzülürmüş ama kimseye kötülük etmek istemezmiş. Elinden geldiğince güzel davranır, haksızlık gördüğünde bunun doğru olmadığını söyler ama kalbinde kin büyütmezmiş.',
    'Külkedisi’nin bir üvey annesi ve iki üvey kardeşi varmış. Kardeşleri yeni elbiseleri, güzel eşyaları ve süslü ayakkabılarıyla övünmeyi çok severmiş. Evde yapılacak bir iş olduğunda ise çoğunu Külkedisi’ne bırakırlarmış.',
    'Derken günlerden bir gün Kurban Bayramı gelmiş. Bütün şehir bayram neşesiyle dolmuş; evlerden mis gibi yemek kokuları yükseliyor, meydanda şenlik hazırlanıyormuş. Üvey kardeşler erkenden süslenmişler. “Şehzade de halkla bayramlaşmak için meydana gelecekmiş!” diye heyecanlanmışlar. Külkedisi dayanamayıp sormuş: “Ben de sizinle gelebilir miyim?” Kardeşleri gülmüşler: “Sen mi? Bu eski kıyafetlerle mi?” Üvey annesi mutfaktaki paketleri göstermiş: “Senin daha işlerin var. Şu kurban etlerini mahalledeki ihtiyaç sahiplerine dağıt.”',
    'Külkedisi bir süre pencereden kardeşlerinin arkasından bakmış. Sonra önündeki et paketlerini görmüş ve içinden şöyle demiş: “Ben meydana biraz geç giderim. Belki bu etleri bekleyen birilerinin bayramı, bugün benim sayemde biraz daha güzel olur.” Sepetini koluna takmış, “Bismillah” diyerek yola koyulmuş.',
    'İlk durağı mahallenin yaşlı terzisiymiş. “Bayramınız mübarek olsun teyzeciğim, size kurban eti getirdim.” Terzi teyzenin yüzü aydınlanmış: “Allah kabul etsin güzel kızım.” Sonra Külkedisi’nin eski elbisesini fark etmiş: “Kızım, senin bayramlığın nerede?” Külkedisi mahcup gülümsemiş: “Bu sene olmadı, önemli değil.” Terzi teyze içeri girmiş; elinde sade ve zarif bir bayram elbisesiyle dönmüş. “Bunu bir gün ihtiyacı olan birine vermek için dikmiştim. Ben hastayken dükkânımı toplamama yardım eden sen değil miydin? Şimdi de ben seni sevindirmek istiyorum.” Külkedisi’nin gözleri parlamış: “Allah razı olsun.”',
    'İkinci durağı ayakkabıcıymış. Eti teslim edince ayakkabıcı “Maşallah, ne güzel bir bayramlığın var,” demiş; sonra yıpranmış ayakkabılarını görmüş. “Bu ayakkabılar o güzel bayramlığın altında biraz yorulmuş sanki!” Külkedisi gülmüş: “Olsun, beni meydana kadar götürürler inşallah.” Ayakkabıcı dükkânından zarif bir çift yeni ayakkabı getirmiş: “Bunları da benden bayram hediyesi olarak kabul et. Bugün sen bizi hatırladın, biz de seni sevindirelim.”',
    'Sepetinde son birkaç paket kalmış. Birini, çocuklarıyla yaşayan ihtiyaç sahibi bir anneye götürmüş. Küçük çocuklar et paketini görünce çok sevinmişler. Anneleri: “Allah kabul etsin kızım. Çocuklar bugün et yiyeceklerini duyunca ne kadar sevindiler bir bilsen!” Külkedisi: “Afiyet olsun. Rabbim nice güzel bayramlara ulaştırsın,” demiş.',
    'Tam ayrılacağı sırada kadın, Külkedisi’nin başındaki eski örtüyü fark etmiş. Sandığını açmış, özenle sakladığı güzel bir eşarp çıkarmış: “Benim de sana küçük bir bayram hediyem olsun.” Külkedisi “Olmaz, bunu siz kullanın,” dese de kadın gülümsemiş: “Sen bugün bizim evimizi sevindirdin. Bırak da biz de seni sevindirelim.” Külkedisi hediyeyi kabul etmiş: “Allah razı olsun.”',
    'Eşarbını da taktıktan sonra bayramlığı tamamlanmış. Fakat Külkedisi aynaya bile bakmamış; çünkü aklı hâlâ sepetindeki son paketlerdeymiş. Onları da sahiplerine ulaştırmış. Artık görevi bitmiş ama güneş epey yükselmiş. “Eyvah! Meydandaki eğlenceye geç kalacağım!” deyip hızlı adımlarla yürümeye başlamış.',
    'Tam o sırada arkasından nal sesleri duyulmuş. Mahallenin arabacısı yanına yaklaşmış: “Külkedisi! Bayram günü böyle acele acele nereye gidiyorsun?” Arabacı onu tanımış: “Sen benim kaybettiğim para kesesini bulan kız değil misin? İçinde ne olduğunu gördüğün hâlde bir kuruşuna bile dokunmadan bana getirmiştin.” Külkedisi şaşırmış: “O para zaten sizindi. Benim olmayan bir şeyi almam doğru olmazdı ki.” Arabacı gülümsemiş: “İşte tam da bunu söyleyeceğini biliyordum.”',
    'Arabacı kapıyı açmış: “Haydi bin bakalım. Sen emaneti sahibine ulaştırdın, bugün de ben seni meydana ulaştırayım. Bayram günü insan birbirini sevindirmeyecek de ne zaman sevindirecek?” Atlar taş yollarda ilerlerken Külkedisi düşünmüş: Sabah evden çıkarken eski bir elbisesi ve koca bir sepeti vardı. Şimdi üzerinde güzel bir elbise, ayağında yeni ayakkabılar, başında güzel bir eşarp vardı. Üstelik bunların hiçbirini istememişti; hepsi iyilik yolunda karşısına çıkmıştı.',
    'Meydan rengârenkmiş. Üvey kardeşleri onu uzaktan görünce tanımakta güçlük çekmişler: “Bu… Külkedisi mi?” Külkedisi onlara kızgınlıkla bakmamış; gülümseyerek “Bayramınız mübarek olsun,” demiş. Sonra kalabalığın ötesinde Şehzade’yi görmüş. Şehzade gösterişli bir yerde oturmuyor; kollarını sıvamış, ihtiyaç sahibi ailelere kurban eti dağıtıyormuş. Görevlilerden birinin paketleri yere düşünce Külkedisi hemen koşmuş: “Ben yardım edeyim.” Şehzade sormuş: “Sen eğlenceye gelmedin mi?” “Geldim. Ama yapılacak iş görünce önce yardım edeyim dedim. Eğlenceye sonra da katılabilirim.” Şehzade bu cevabı hiç unutmamış.',
    'Birlikte paketleri dağıtmışlar. Külkedisi yaşlı bir teyzenin ağır paketini taşımış, onu evine kadar geçirmiş. Şehzade bunu uzaktan görmüş.',
    'Sonra ağlayan küçük bir çocuğu güldürmüş; elindeki son ikramı kendisi yemek yerine ona vermiş. Şehzade Külkedisi’nin güzel bayramlığını da fark etmiş elbette. Ama onu asıl etkileyen başka bir güzellikmiş: Külkedisi’nin güzel ahlakı.',
    'Akşam yaklaşınca Külkedisi “Artık eve dönmeliyim, Allah’a emanet olun,” deyip kalabalığın arasından ayrılmış. Şehzade biraz sonra fark etmiş: Adını bile sormamıştı, nerede yaşadığını bilmiyordu. Dağıtım yerinde kalan bir et paketi gözüne ilişmiş; Külkedisi’nin sabah dağıttığı paketlerle aynı şekilde hazırlanmıştı. “Belki bu paketler onu bulmam için bir ipucu verir,” demiş.',
    'Ertesi gün mahalleye gitmiş. Terzi teyze: “Sen Külkedisi’nden bahsediyorsun. Ben hastayken bana yardım etmişti.” Ayakkabıcı: “Elbette tanırım, bayram günü bize de et getirdi.” Arabacı gülmüş: “Kaybettiğim keseyi bulup bir kuruşuna dokunmadan getirdi.” İhtiyaç sahibi anne: “Çocuklarımın bayram sofrasını sevindiren kız mı? Elbette tanıyorum.” Şehzade her kapıda onun başka bir iyiliğini öğreniyormuş. Artık onu bulmak istemesinin sebebi güzel bayramlık değil; bu kızın nasıl biri olduğunu gerçekten merak etmesiymiş.',
    'Sonunda Külkedisi’nin evine ulaşmış. Kapı çalınca üvey kardeşleri koşarak açmışlar; karşılarında Şehzade’yi görünce şaşkınlıktan ne diyeceklerini bilememişler. Külkedisi de kapıya gelmiş. Şehzade gülümsemiş: “Nihayet seni buldum.”',
    'Külkedisi şaşırmış: “Beni mi arıyordunuz?” “Evet. Ama seni ararken senden daha fazlasını buldum. Terzi teyze bir iyiliğini anlattı, ayakkabıcı başka bir iyiliğini, arabacı kesesini geri verdiğini… Seni bulmak için çıktığım her kapıda senin başka bir iyiliğini öğrendim.” Külkedisi mahcup olmuş: “Ben sadece yapmam gerekeni yaptım.” Şehzade gülümsemiş: “Belki de iyiliği güzel yapan budur.”',
    'Üvey kardeşleri bütün konuşmayı duymuşlar. Sabah onun eski kıyafetleriyle alay ettiklerini hatırlayıp başlarını önlerine eğmişler ve özür dilemişler. Külkedisi: “Yaptığınız beni üzmüştü ve doğru değildi. Ama özür dilediğiniz için sizi affediyorum. İnşallah bundan sonra birbirimizi üzmek yerine birbirimizi sevindiririz.”',
    'Günler, aylar, yıllar geçmiş. Külkedisi’nin bayramlığı eskimiş, ayakkabıları eskimiş, eşarbının rengi solmuş; ama güzel ahlakı hiç eskimemiş. Şehzade de halkına hizmet etmeye devam etmiş. Zamanla birbirlerini daha iyi tanımışlar. Şehzade onun merhametini ve dürüstlüğünü, Külkedisi de Şehzade’nin halkını ve ihtiyaç sahiplerini düşünmesini sevmiş. Vakti geldiğinde evlenmişler ve çok mutlu olmuşlar.',
    'Fakat hikâyemiz burada bitmemiş. Bir Kurban Bayramı sabahı sarayın önünde yine arabalar hazırlanmış; içleri et paketleri ve hediyelerle doluymuş. Çünkü Külkedisi ile Şehzade kendilerine bir bayram geleneği edinmişler: Önce paylaşmak, sonra eğlenmek. Mahalle mahalle dolaşıp çocukları sevindirmişler, yaşlıların bayramını kutlamışlar. Külkedisi artık çok iyi biliyormuş: İyilik, karşılığında bir şey kazanmak için yapılmaz. Ve insanın üzerindeki en güzel bayramlık, güzel ahlakıdır. Gökten üç elma düşmüş: Biri iyilik yapanlara, biri iyiliği unutmayanlara, biri de bayram sevincini paylaşanlara…'
  ];
  var S = {
    id: 'kulkedisi',
    slug: 'kulkedisi',
    base: 'masal/kulkedisi/',
    cover: 'kapak.webp',
    ageRange: '5-10',
    theme: { tint: '#4a2a5a' },
    title: { tr: 'Külkedisi' },
    subtitle: { tr: 'Bayramın En Güzel Hediyesi' },
    description: { tr: 'Bayram sabahı eski kıyafetleriyle yola çıkan Külkedisi, kurban etlerini dağıtırken en güzel bayramlığı bulur: güzel ahlakı.' },
    lessons: {
      tr: [
        'İyiliği karşılık beklemeden yaparız.',
        'Emanete sahip çıkarız; bizim olmayana dokunmayız.',
        'Bayramda önce paylaşır, sonra eğleniriz.',
        'Özür dileyeni affederiz.',
        'En güzel bayramlık güzel ahlaktır.'
      ]
    },
    scenes: sahneler.map(function (m, i) {
      var n = (i < 9 ? '0' : '') + (i + 1);
      return { id: 'sc-' + n, image: n + '.webp', audio: 'ses/{lang}/' + n + '.mp3', animation: A[i % 3], narration: { tr: m } };
    })
  };
  (window.MasalPark = window.MasalPark || { stories: [] }).stories.push(S);
})();
