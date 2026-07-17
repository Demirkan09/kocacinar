---
name: Koca Çınar Şarküteri
description: Doğal, geleneksel ve premium e-şarküteri tasarım dili
colors:
  primary: "#5e0d0f" # Koyu Bordo / Vişne (Ana marka rengi)
  secondary: "#D4A373" # Sıcak Altın / Kum Sarısı (Vurgu rengi)
  neutral-bg: "#F5F0E6" # Sıcak Krem (Sayfa arka planı)
  surface: "#FBF9F4" # Kırık Beyaz / Açık Krem (Kart ve form arka planları)
  ink: "#3C2F2F" # Koyu Kahve / Toprak (Metin rengi)
typography:
  display:
    fontFamily: "var(--font-sans), Inter, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-sans), Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "16px"
  lg: "32px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
---

## Overview
Koca Çınar Şarküteri tasarım dili; geleneksel zanaatkârlık (artisanal) ile premium modern e-ticareti harmanlar. Soğuk, steril SaaS tasarımları veya düzensiz pazar yeri şablonları yerine; sıcak toprak ve bordo tonlarında, samimi ve güven veren bir görsel kimlik hedeflenir.

## Colors
Tasarımda kullanılan renk paleti tamamen doğal ve geleneksel gıda/çiftlik kimliğine dayanmaktadır:
- **Primary (#5e0d0f)**: Ana Bordo rengi. Marka kimliğini, seçkinliği ve köklülüğü temsil eder. Aksiyon butonları ve önemli vurgularda kullanılır.
- **Secondary (#D4A373)**: Sıcak Kum / Altın sarısı. İkincil aksiyonlar, etiketler ve bordo üzerine yapılan ince detaylarda kullanılır.
- **Neutral-bg (#F5F0E6)**: Sayfa arka plan rengi. Sıcak krem tonuyla soğukluk hissini kırar ve doğallık katar.
- **Surface (#FBF9F4)**: Kartlar ve formlar için hafif daha açık bir krem/kırık beyaz tonu. Katman oluşturmak için kullanılır.
- **Ink (#3C2F2F)**: Metin ve ikonlarda kullanılan koyu toprak rengi. Okunabilirliği yüksek tutmak için kontrast sağlar.

## Typography
Başlıklar ve vurgulu alanlar için kalın, göze çarpan sans-serif yazı tipleri tercih edilmektedir.
- **Display**: `clamp(2rem, 5vw, 3.5rem)` ile akıcı bir şekilde ölçeklenir, `font-black` veya `font-extrabold` ağırlıkta kullanılır.
- **Body**: Rahat okunabilen ve gözü yormayan `line-height: 1.5` yüksekliğinde sans-serif fontlar (`Inter` / `Geist-sans`).

## Elevation
Aşırı gölgelerden ve yapay derinliklerden kaçınılır.
- Katmanlar soft ve yaygın gölgelerle (`shadow-[0_20px_50px_rgba(0,0,0,0.05)]`) veya yalnızca renk farkıyla ayrıştırılır.
- Düz kart düzenlerinde ince bir sınır çizgisi (`border border-[#D4A373]/10`) tercih edilir.

## Components
- **Butonlar**: Köşeleri yumuşatılmış (`rounded-2xl` veya `rounded-xl`) ve bordo arka planlıdır. Hover durumunda sıcak sarıya (`#D4A373`) pürüzsüz geçiş yapar.
- **Kartlar**: Geniş köşe yuvarlaklığına (`rounded-[2.5rem]` veya `rounded-3xl`) sahip, kırık beyaz arka planlı kutulardır.
- **Girdiler (Inputs)**: Hafif sarımsı kırık beyaz arka plan (`bg-[#FBF9F4]`) ve ince sınır çizgisine sahiptir. Odaklanıldığında (`focus`) secondary renkte halka edinir.

## Do's and Don'ts
### Do's
- Sayfa arka planlarında ve kartlarda her zaman sıcak krem/kırık beyaz kombinasyonlarını (`#F5F0E6` ve `#FBF9F4`) kullanın.
- Sayısal ve parasal verilerde ondalık hatalarını önlemek için mutlaka `.toFixed(2)` kullanın.
- İstemci tarafında `useSearchParams` kullanan tüm sayfaları `<Suspense>` bloğu içine alın.
- Butonlarda ve geçişlerde yumuşak animasyonlar (`transition-all duration-300`) uygulayın.

### Don'ts
- Siyah (`#000000`) veya soğuk griler (`#f3f4f6`) kullanmayın. Metinler için her zaman koyu kahve/toprak tonu olan `#3C2F2F` kullanın.
- Ürün görsellerini hover durumunda kesinlikle hareket ettirmeyin veya boyutlandırmayın (görseller üzerinde animasyon yasağı).
- Kart kenarlarında kalın ve renkli dikey çizgiler (`border-left` dikey vurgu) kullanmaktan kaçının.
