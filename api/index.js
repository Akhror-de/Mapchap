const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch'); // Для выполнения HTTP-запросов
const { LRUCache } = require('lru-cache'); // Для кэширования ответов API

const app = express();
const port = process.env.PORT || 3000;

// --- Конфигурация API ФНС (DaData.ru) ---
// В реальном проекте эти данные должны храниться в переменных окружения (например, через .env файл)
const DADATA_API_KEY = process.env.DADATA_API_KEY || '0cda37fe74232b4d3fdaf80b13d5fc1f6b98fcd3'; // Ваш API-ключ DaData
const DADATA_SECRET_KEY = process.env.DADATA_SECRET_KEY || 'your_dadata_secret_key_here'; // Ваш секретный ключ DaData
const DADATA_SUGGESTION_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party';

// --- Кэширование запросов к DaData ---
const cache = new LRUCache({
    max: 100, // Максимальное количество элементов в кэше
    ttl: 1000 * 60 * 60, // Время жизни кэша: 1 час
});

// Настройка CORS для разрешения запросов с любых источников
// В продакшене рекомендуется ограничить домен вашего Telegram Mini App
app.use(cors());

// Для парсинга JSON тел запросов
app.use(bodyParser.json());

// Обслуживание статических файлов из папки 'public'
// Vercel будет использовать эту настройку для статических файлов, но Express также может их обслуживать локально
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API маршрут для проверки ИНН через DaData.ru ---
app.post('/api/fns/verify-inn', async (req, res) => {
    const { inn } = req.body;

    if (!inn) {
        return res.status(400).json({ message: 'ИНН не предоставлен.' });
    }

    // Простая валидация ИНН (на клиенте будет более строгая)
    if (!/^\d{10}$|^\d{12}$/.test(inn)) {
        return res.status(400).json({ message: 'Некорректный формат ИНН.' });
    }

    // Проверяем кэш
    if (cache.has(inn)) {
        console.log(`ИНН ${inn} найден в кэше.`);
        return res.json(cache.get(inn));
    }

    try {
        const response = await fetch(DADATA_SUGGESTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Token ${DADATA_API_KEY}`,
                'X-Secret': DADATA_SECRET_KEY,
            },
            body: JSON.stringify({ query: inn }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Ошибка при запросе к DaData: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ message: 'Ошибка при проверке ИНН через ФНС. Попробуйте позже.', details: errorText });
        }

        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
            const companyData = data.suggestions[0].data;
            const result = {
                status: 'success',
                message: 'Организация найдена.',
                company: {
                    name: companyData.name.full_with_opf || companyData.name.short_with_opf || companyData.name.full || companyData.name.short,
                    ogrn: companyData.ogrn || companyData.ogrnip,
                    address: companyData.address.value,
                    okved: companyData.okved || (companyData.okveds && companyData.okveds[0] && companyData.okveds[0].name),
                    state: companyData.state.status.toLowerCase(), // active, liquidating, liquidated
                },
            };

            // Дополнительная проверка статуса организации
            if (result.company.state !== 'active') {
                result.status = 'warning';
                result.message = 'Организация найдена, но не является действующей.';
            }

            cache.set(inn, result); // Кэшируем результат
            return res.json(result);
        } else {
            const result = {
                status: 'error',
                message: 'Организация с таким ИНН не найдена.',
            };
            cache.set(inn, result); // Кэшируем даже отрицательный результат
            return res.status(404).json(result);
        }
    } catch (error) {
        console.error('Ошибка на сервере при проверке ИНН:', error);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера.', details: error.message });
    }
});

// Пример API маршрута
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from MapCost API!' });
});

// Добавьте свои другие API маршруты здесь
// app.post('/api/calculate-cost', (req, res) => {
//   const { origin, destination } = req.body;
//   // Логика расчета стоимости
//   res.json({ cost: 100 });
// });

// Обработка всех остальных запросов и перенаправление на index.html
// Это важно для одностраничных приложений (SPA), чтобы Vercel router мог работать
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Запуск сервера, если он не является Serverless Function (т.е. локально)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Экспорт приложения для Vercel Serverless Functions
module.exports = app;
