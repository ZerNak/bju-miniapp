# BJU Mini App

Telegram Mini App для подсчёта калорий и БЖУ. Без своего сервера: данные в `localStorage`, распознавание еды в браузере (TensorFlow.js / Food-101).

## Онлайн (для Telegram)

После деплоя на GitHub Pages:

**https://zernak.github.io/bju-miniapp/**

В [@BotFather](https://t.me/BotFather) укажи этот URL как Web App / Menu Button.

## Локально

```bash
npm install
npm run dev
```

Открой `http://localhost:5173/` (для Telegram нужен HTTPS — используй Pages).

## Стек

Vite · React · TypeScript · `@tensorflow/tfjs` · Telegram WebApp
