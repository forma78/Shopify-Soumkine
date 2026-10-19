# Shopify-Soumkine

Тема Shopify для **SOUMKINE by Theo Sumkin** — магазина оригинальных картин. Версия **0.4.0**.

## Что где

| Путь | Что это |
|---|---|
| `soumkine-theme/` | Исходники темы 0.4.0 |
| `SOUMKINE-theme-setup.md` | Установка и настройка темы |
| `IMAGE 2026-…jpg`, `image*.jpg`, `cover_40x40*.jpg` | Фото картин |
| `commission-images/` | Картинки для страницы *Open for commissions* |
| `soumkine-preview/` | Скриншоты темы |
| `signature_sumkin*` | Логотип и подпись (SVG, PNG, AI) |
| `soumkine-atelier-video.mp4` | Видео мастерской в H.264 — его загружать в Shopify |
| `header_video_2_2x_noaudio.mp4` | Исходник того же видео |
| `*SOUMKINE-actual.pdf` | Снимки магазина до новой темы |

## Установка

Готовый `soumkine-theme-0.4.zip` лежит в релизе [v0.4.0](../../releases/tag/v0.4.0).
Shopify Admin → **Online Store → Themes → Add theme → Upload zip file**. Дальше — по `SOUMKINE-theme-setup.md`.

Собрать zip из исходников:

```sh
cd soumkine-theme && zip -r ../soumkine-theme-0.4.zip . -x '.*'
```

## Права

Картины, фото, видео, логотип и подпись — © Theo Sumkin, все права защищены.
Шрифты в `soumkine-theme/assets/` (Space Mono, Inter Tight, Antonio) распространяются по лицензии SIL Open Font License.
