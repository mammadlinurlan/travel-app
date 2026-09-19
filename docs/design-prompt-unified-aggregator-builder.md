Aşağıdakı promptu olduğu kimi kopyalayıb dizayn alətinə at (2000 simvoldan az).

---

Premium səyahət platforması üçün 4 ekranlıq axın dizayn et. Məhsul: istifadəçi tək axtarışdan (mətn/səs/AI) bir neçə xarici mənbədə (Booking tipli otel, Airbnb tipli, uçuş) paralel axtarış edir, nəticə mənbəyə görə göstərilir, "Paket Qur" düyməsi 3 avtomatik təklif (Ən ucuz/Ən sərfəli/Premium) yaradır, agent üçün drag-and-drop manual builder də var.

Dizayn sistemi: Navy #102A43, Deep Navy #0B1F33, Warm Ivory #FAF8F3 (bg), Soft Sand #F1EDE4, Gold #C6A15B (yalnız aksent), Text #17212B, Muted #667085, Border #E4E0D8, Success #2F7D5C, Error #B54747. Font: Montserrat. İkon: Phosphor. Hiss: premium, sakit, minimal.

Ekran 1 — Axtarış: hero üzərində mətn input + mikrofon düyməsi (səs, "dinlənilir" animasiyası) + struktur sahələr (təyinat, tarix, sərnişin).

Ekran 2 — Nəticələr: (a) yüklənmə: hər mənbə üçün ayrı progress ("Booking.com", "Airbnb", "Uçuş"); (b) nəticə: tab ilə "Mənbəyə görə" (ayrı bölmə/kart, öz qiyməti) vs "Hamısı birlikdə" (unified grid). Hər kartda mənbə nişanı (badge).

Ekran 3 — Build nəticəsi: 3 kart (Ən ucuz/Ən sərfəli/Premium), Ən sərfəli qızılı haşiyə+"tövsiyə" nişanı ilə. Hər kartda uçuş/otel/transfer xülasəsi, qiymət, "Detallara bax"+"Seç" düymələri.

Ekran 4 — Manual Builder: sol panel — sürüklənə bilən uçuş/otel/transfer kartları, mənbə filtri; sağ panel — 3 slotlu boş kətan (Uçuş/Otel/Transfer), boş slot "buraya sürüşdür" göstərir; canlı qiymət cəmi; "Təklif kimi göndər" CTA.

Hər ekranı masaüstü (≥1280px) və mobil (≈390px) versiyada göstər. Komponentlər shadcn/ui dilinə uyğun (Button, Card, Badge, Tabs, Sheet), yeni ixtira minimum.
