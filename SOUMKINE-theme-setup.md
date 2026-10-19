# SOUMKINE — установка темы

## 1. Загрузка
1. Shopify Admin → **Online Store → Themes → Add theme → Upload zip file** → `soumkine-theme-0.4.zip`.
2. Тема появится в библиотеке **неопубликованной**. Нажмите **Customize**, всё проверьте и только потом **Publish**.

## 2. Видео для чёрного блока
1. **Content → Files → Upload** → `soumkine-atelier-video.mp4`.
   Это перекодированная копия `header_video_2_2x_noaudio.mp4`: оригинал в формате MPEG-4 Part 2, его не воспроизводят Chrome и Firefox. Новая копия — в H.264 и начинает играть сразу.
2. В редакторе: секция **Video feature** → поле **Video** → выберите файл.
   Варианты: **Layout** — во всю ширину или «в рамке» на чёрном фоне; **Height** — высота блока; **Darken video** — затемнение.
3. **Playback**:
   - **Autoplay**: *Always* (по умолчанию), *Desktop only* (на телефоне видео ждёт нажатия Play) или *Off*.
   - Видео играет без звука, по кругу и только пока блок на экране. Если посетитель нажал Pause, оно так и остаётся на паузе.
   - **Show play / pause button** — кнопка внизу справа.
   - **Don’t autoplay when the device asks for reduced motion** — по умолчанию выключено, то есть видео стартует, даже если в системе включено «Уменьшить движение».

## 3. Меню (как панель Returns-white-menu)
**Content → Menus → Main menu.** Пункт с вложенными пунктами (например, *Shop*) открывает левую панель:
вложенные пункты показываются крупными заголовками, а их собственные подпункты — мелким моноширинным шрифтом.

```
Shop
  All works
  Chromatic
    Horizon
    Sunset
  Color Field
  Available now
About
For Spaces
Journal
Contact
```
Меню **Footer** выводится в подвале и внизу левой панели.

## 4. Страницы
- About → в карточке страницы выберите шаблон **page.about**: фото-баннер, текст и видео в рамке.
- Contact → шаблон **page.contact**: форма с темами обращения.

## 4a. Open for Commissions (лендинг)
1. **Online Store → Pages** → откройте страницу *Open for commissions* (адрес `/pages/open-for-commissions`).
   Справа в поле **Theme template** выберите **page.commissions**.
2. Весь текст уже в шаблоне. Редактируется в **Customize** — откройте эту страницу в редакторе.
3. **Фото.** В каждой секции *Commission offer* выберите картинки (Main image, Image 2–4). Файлы лежат в папке `commission-images/`:
   - Hotels → `1-hotels-paris-salon.jpg`;
   - Restaurants → `2-restaurants.jpg`;
   - Private Collections → `3-private-blue-911.jpg` как главное фото, `4-…`, `5-…`, `6-…` как дополнительные.
4. **Плашка «Concept — AI-generated image»** (на телефоне — короче, «AI-gen image») стоит на всех фото этих секций.
   Текст — в полях *Image label* и *Image label on phones*. Чтобы убрать плашку с настоящих фото, оставьте поля пустыми.
5. **Меню** (Content → Menus → Main menu), пункт *Open for commissions* → `/pages/open-for-commissions`, вложенные пункты:
   - Bespoke for Hotels → `/pages/open-for-commissions#bespoke-for-hotels`
   - Bespoke for Restaurants → `/pages/open-for-commissions#bespoke-for-restaurants`
   - Bespoke for Private Collections → `/pages/open-for-commissions#bespoke-for-private-collections`

   Левая панель меню откроет сначала сам пункт «Open for commissions», под ним три раздела. Клик по разделу плавно прокручивает страницу к блоку.
6. **Кнопки:**
   - «Choose your space» прокручивают к нужному блоку;
   - кнопки в блоках (Request a hotel proposal и т.д.) прокручивают к форме внизу и сразу выбирают тип проекта.
   Ссылка вида `…/pages/open-for-commissions?project=Hotel#enquire` тоже открывает форму с выбранным типом.
7. **Заявки** приходят на почту магазина (Settings → Notifications / Store details) со всеми полями: тип проекта, формат, количество работ, город, сроки.

## 5. Главная страница
- **Hero collage** — гигантский SOUMKINE с подписью и фото вразброс. Если фото не выбраны, тема сама берёт вторые фото ваших работ (снимки на стене).
  Положение каждого фото настраивается ползунками: ширина, X, Y, слой (перед вордмарком или за ним), параллакс.
- **Scattered collection** — «Latest Works», асимметричная сетка, как у Cascade.
- **Collection slider**, **Video feature**, **Scrolling text**, **Image with text**, **Newsletter**.
  Дополнительно можно добавить **Journal**, **Press**, **Statement**, **Image banner** и **Rich text**.

## 6. Характеристики картины
Блок **Artwork details** на странице товара содержит поля Medium / Size / Year / Edition.
Чтобы у каждой работы были свои значения:
1. **Settings → Custom data → Products** → создайте метаполя, например `custom.dimensions` и `custom.year`.
2. В редакторе нажмите значок «подключить источник» у поля и выберите метаполе.

## 7. Продано
- Вместо цены — только красная точка и **SOLD**, как в галереях. Так и в карточках, и на странице работы.
- В карточках первое фото проданной работы чёрно-белое. При наведении проявляется второе фото в цвете, а если его нет — первое становится цветным.
- Вместо «Add to cart» появляется кнопка **Enquire about a similar work**; ссылка настраивается в блоке **Buy buttons**.
- Настройки: **Theme settings → Product cards → Sold works**.
  - Подпись SOLD можно поменять.
  - Цену можно снова показывать.
  - Ч/б можно выключить или включить и для первого фото на странице работы (по умолчанию выключено).

## 8. Логотип, бренд и шрифты
- Логотип SOUMKINE by Theo Sumkin уже встроен в тему, загружать ничего не нужно. Геометрия взята из `signature_sumkin_logo_ol.svg`: надпись, «by» и подпись — векторные и резкие в любом размере.
- Где что показывается:
  - **шапка** — чистый SOUMKINE, без подписи;
  - **первый экран** — большой SOUMKINE, тоже без подписи;
  - **подвал** — логотип целиком, как в мастере: SOUMKINE / by / подпись по центру.
- **На телефоне** на главной всегда виден один логотип: маленький SOUMKINE в шапке появляется только после того, как большой ушёл за экран.
- Раскладка подписи у **Hero collage** и **Footer** — поле *Signature position*:
  - *Over the wordmark* — подпись поверх надписи;
  - *Under the wordmark* — подпись под надписью;
  - *Centered, as the logo* — точная композиция логотипа по центру.
- **Theme settings → Brand**:
  - *Wordmark*: логотип или текст;
  - своя подпись (по умолчанию — из логотипа);
  - **Header → Logo height** — размер логотипа в шапке.
- Шрифты интерфейса встроены в тему (лицензия OFL): Space Mono — текст и навигация, Inter Tight — заголовки. Circular Std в тему не встраивается: в логотипе он уже переведён в кривые.
- **Theme settings → Typography**: размер текста, капс вкл/выкл.

## Примечание
Если в системе включено «Уменьшить движение» (Accessibility → Reduce motion), отключаются параллакс и плавное появление блоков. Видео при этом играет, если в секции не включена соответствующая галочка.
