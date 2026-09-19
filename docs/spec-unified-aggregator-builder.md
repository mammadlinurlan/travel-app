# Spec: Vahid Axtarış Aqreqatoru + Tur Paketi Builder

Status: Draft — seniorun rəyindən (bax aşağıda) sonra yazılıb.
Bu sənəd mövcud kod bazasına (`domain/`, `providers/`, `features/`, `app/api/`)
əlavə/dəyişiklik kimi düşünülüb, sıfırdan yenidən yazma kimi yox.

## 1. Kontekst — nə üçün bu sənəd yazılır

Seniorun əsas iradı: hazırkı sistem "bizim öz mock/real provayderlərimizdən
paket yaradan axtarış" kimi işləyir, amma istənilən məhsul "istifadəçinin
adətən getdiyi mövcud sistemləri (Booking, Airbnb, uçuş saytları və s.)
**bir yerdə, bir dəfəyə** axtarıb, nəticələri **mənbəyə görə qruplaşdırılmış**
şəkildə göstərən" bir aqreqator olmalıdır. Üstəlik axtarış səslə/yazı ilə/AI
ilə doldurula bilməlidir, nəticədən sonra "build" düyməsi ilə avtomatik
3 hazır təklif (ən ucuz / ən sərfəli / premium) çıxmalıdır, bundan başqa
tur agenti özü də drag-and-drop ilə paketi əl ilə qura bilməlidir (uçuş bunu
seç, otel bunu seç və s.).

Bunların böyük hissəsi artıq domain modelində var (`package-engine.ts`,
`ranking.ts` → Cheapest/Best Value/Premium; `PackageCustomizer` → seçimlə
recalculation). Əskik olan üç şey:

1. Nəticələrin **"öz sistemimiz" deyil, "hər bir xarici mənbə üçün ayrı-ayrı"**
   göstərilməsi (mənbə = provayder: Booking-tipli otel mənbəyi, Airbnb-tipli,
   uçuş mənbəyi və s.), ayrı-ayrı kartlar/tablar şəklində.
2. **Səslə axtarış** girişi (mövcud `NaturalLanguageInput` mətn/AI üçün var,
   səs yoxdur).
3. **Drag-and-drop manual builder** ekranı — agent üçün sərbəst
   uçuş+otel+transfer seçib özü paket düzəltdiyi kətan (canvas).

## 2. Məqsəd (Goals)

- İstifadəçi (son müştəri və ya tur agenti) bir dəfə axtarış edir (mətn, səs
  və ya AI ilə doldurulmuş forma) və sistem **paralel olaraq bir neçə xarici/daxili
  mənbəni** sorğulayır.
- Nəticələr mənbəyə görə qruplaşdırılıb göstərilir: "bu mənbədə bunlar var,
  bu qiymətlərlə".
- "Paket qur" (build) düyməsi avtomatik 3 hazır təklif yaradır: **Ən ucuz**,
  **Ən sərfəli (best value)**, **Premium**. (Bu, mövcud `ranking.ts`-in
  `RecommendationBadge` məntiqinin təkrarı — yenidən yazılmır, üstünə mənbə
  qarışıq inventory qəbul edir.)
- Tur agenti bundan əlavə **əl ilə** də paket qura bilir: drag-and-drop ilə
  bir uçuş, bir otel, bir transfer seçib öz paketini yaradır, qiymət canlı
  hesablanır.

## 3. Məqsəd olmayan (Non-goals)

- Booking.com / Airbnb-nin real API-larına inteqrasiya bu spec-in əhatəsində
  DEYİL (onların çoxu üçüncü tərəf agentlərə açıq API vermir — bax "Açıq
  suallar"). Bu spec provayder interfeysini "çoxlu mənbə" üçün genişləndirir;
  hansı mənbələrin real, hansının mock olacağı ayrıca qərardır (mövcud
  `TRAVEL_PROVIDER_MODE` mock/live sxemi ilə eyni prinsip).
- Ödəniş/rezervasiya axını bu spec-də yoxdur.
- Çoxdilli/tam lokalizasiya bu spec-in mövzusu deyil (mövcud `lib/i18n`
  strukturu istifadə olunur).

## 4. İstifadəçi axını (User flow)

1. **Axtarış girişi** — mövcud landing search formu üstünə: mətn sahəsi
   (mövcud), **mikrofon düyməsi** (səs → mətn → AI parse, mövcud
   `/api/ai/parse-trip` axınına səs transkripsiyası əlavə olunur), forma
   sahələri (mövcud `TripSearchForm`).
2. **Axtarış icra olunur** — sistem bütün aktiv mənbələri (provayderləri)
   paralel çağırır. Mövcud `SearchProgress` komponenti mənbə adlarını
   göstərəcək şəkildə genişlənir ("Booking.com yoxlanılır…", "Airbnb
   yoxlanılır…", "Uçuşlar yoxlanılır…").
3. **Aqreqasiya nəticəsi** — nəticə ekranı iki rejimli:
   - **Mənbəyə görə görünüş** (yeni): hər mənbə üçün ayrı bölmə/tab,
     içində o mənbənin öz nəticələri (öz qiyməti, öz linki/detalı).
   - **Birləşmiş görünüş** (mövcud `PackageResults` grid-i) — bütün
     mənbələrdən gələn inventory bir yerə yığılıb mövcud filter/sort ilə.
4. **"Paket qur" (Build)** — düymə basılanda mövcud `package-engine.ts` +
   `ranking.ts` işə düşür, nəticədən 3 kart çıxır: Ən ucuz / Ən sərfəli /
   Premium (mövcud `RecommendationBadge` dəyərləri).
5. **Manual Builder (yeni ekran)** — agent "Özüm qurmaq istəyirəm" seçəndə
   açılır: solda inventory siyahısı (uçuşlar, otellər, transferlər — mənbəyə
   görə filtrlənə bilən), sağda boş "paket kətanı" (canvas) 3 slot ilə
   (Uçuş / Otel / Transfer). Sürüşdürüb buraxma (drag-and-drop) ilə slotlar
   doldurulur, qiymət hər dəyişiklikdə canlı yenidən hesablanır (mövcud
   `useRecalculatePackage` axını ilə eyni backend).

## 5. Funksional tələblər

### 5.1 Çoxmənbəli axtarış
- `domain/travel/types.ts`-ə mövcud provayder nəticələrinə **`source`**
  sahəsi əlavə olunur (məs. `source: { id: "booking", label: "Booking.com",
  kind: "hotel" }`), beləliklə eyni domain modeli həm daxili mock/real
  provayderlər, həm də gələcək xarici mənbələr üçün işləyir.
- `providers/` altında hər mənbə üçün ayrı adapter (mövcud struktur: `hotels/`,
  `flights/`, `transfers/` altında `*-provider.ts` faylları) — interfeys
  dəyişmir, sadəcə hər provayderin qaytardığı obyektə `source` metadatası
  əlavə olunur.
- Axtarış API-si (`/api/trips/search`) bütün aktiv provayderləri
  `Promise.allSettled` ilə paralel çağırır (bir mənbə fail olsa belə
  digərləri qayıdır — mövcud "budget fallback" mesaj mexanizmi ilə eyni
  ruhda, "bu mənbə cavab vermədi" xəbərdarlığı əlavə olunur).

### 5.2 Səslə axtarış
- Brauzerin `SpeechRecognition` / `webkitSpeechRecognition` API-si ilə
  səs → mətn (server tərəfi lazım deyil, browser-native; fallback: mətn
  sahəsi). Transkript mövcud `NaturalLanguageInput` → `/api/ai/parse-trip`
  axınına eyni cür ötürülür — AI parse məntiqi dəyişmir, yalnız giriş
  mənbəsi (yazı/səs) fərqlənir.

### 5.3 Avtomatik build (3 təklif)
- Mövcud `ranking.ts` məntiqi dəyişmədən saxlanılır, sadəcə indi girişi
  bir yox, bir neçə mənbədən gələn qarışıq inventory olur.
- Nəticə: `cheapest`, `bestValue`, `premium` (mövcud adlandırma).

### 5.4 Manual (drag-and-drop) builder
- Yeni komponent qrupu, məs. `features/builder/`:
  - `BuilderCanvas.tsx` — 3 slot (Flight/Hotel/Transfer), hər slotun
    üstünə buraxma (drop) qəbul edir.
  - `InventoryPanel.tsx` — solda sürüklənə bilən (`draggable`) kartlar,
    mənbəyə görə filtr.
  - Drag-and-drop: `@dnd-kit/core` (yüngül, əlçatan, mövcud stack — React 19,
    Framer Motion ilə uyğun; layihədə hazırda drag-and-drop kitabxanası yoxdur,
    bu əlavə asılılıqdır).
- Slot doldurulanda/dəyişəndə mövcud `POST /api/packages/:id/recalculate`
  eyni formatda çağırılır — server-side qiymət, client-sent qiymətə etibar
  edilmir (mövcud qaydaya uyğun).
- Agent paketi "Təklif kimi göndər" edə bilir (mövcud `POST /api/offers`
  axını).

## 6. Açıq suallar (senior/məhsul sahibi ilə aydınlaşdırılmalı)

1. "Booking, Airbnb və s." — bunlar **real API inteqrasiyası** olacaq, yoxsa
   demo/mock mənbələr kimi simulyasiya? (Qeyd: Booking.com/Airbnb-nin
   ictimai partner API-si yoxdur, adətən yalnız təsdiqlənmiş tur
   operatorlarına/OTA-lara açılır — bu, real inteqrasiya olarsa əlavə
   biznes prosesi (partnyorluq müraciəti) tələb edir, mövcud layihədə
   Duffel/LiteAPI üçün olduğu kimi.)
2. Drag-and-drop builder yalnız **agent** (daxili istifadəçi) üçündürmü,
   yoxsa son müştəri də əl ilə paket qura bilməlidir?
3. Səslə axtarış hansı dillərdə dəstəklənməlidir (mövcud `lib/i18n` az/ru/en
   dilləri ilə uyğunlaşdırılmalıdır)?

## 7. Uğur meyarları

- Bir axtarışdan minimum 2 fərqli mənbə üzrə nəticə eyni ekranda görünür.
- "Build" düyməsi 3 fərqli (ən ucuz/sərfəli/premium) paket qaytarır, mövcud
  `ranking.ts` skorlaması ilə üst-üstə düşür.
- Agent drag-and-drop ilə 3 slotu doldurub qiymətin canlı dəyişdiyini görür
  və paketi təklif kimi göndərə bilir.
