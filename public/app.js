/**
 * app.js
 * Основной файл JavaScript для Telegram Mini App "MapCost".
 * Содержит логику для инициализации Telegram WebApp, управления картой,
 * пользовательской системой (предприниматели/пользователи) и навигацией между экранами.
 *
 * Структура:
 * - Модуль TelegramWebApp: Управление интеграцией с Telegram Mini App SDK.
 * - Модуль MapSystem: Вся логика, связанная с Яндекс.Картами (инициализация, метки, фильтры, геолокация).
 * - Модуль UserSystem: Управление данными пользователей и предпринимателей (регистрация, профиль, авторизация).
 * - Модуль ModalSystem: Управление модальными окнами для отображения деталей заведений.
 * - Модуль LocationPickerModal: Управление модальным окном для выбора местоположения на карте.
 * - Модуль Navigation: Управление переключением между экранами приложения и историей навигации.
 * - Главная инициализация: Запуск всех модулей при загрузке DOM.
 */

// ========================================================
// Модуль 1: Инициализация и утилиты Telegram WebApp
// Описание: Отвечает за взаимодействие с Telegram Mini App SDK.
// Позволяет инициализировать приложение, получать параметры темы,
// управлять кнопками (MainButton, BackButton) и показывать уведомления.
// ========================================================
// import { renderCategorySelection } from './src/utils/categoryRenderer.js';

const TelegramWebApp = (() => {
    let WebApp = window.Telegram && window.Telegram.WebApp; // Объект Telegram WebApp SDK

    /**
     * @function init
     * @description Инициализирует Telegram WebApp. Если SDK не найден, создает мок-объект
     * для локальной разработки. Устанавливает параметры темы в CSS переменные
     * и подписывается на событие изменения темы.
     */
    const init = () => {
        // Проверка наличия Telegram WebApp SDK. Если нет, создаем заглушку для локальной разработки.
        if (!WebApp) {
            console.warn("Telegram WebApp SDK не найден. Приложение будет работать в автономном режиме.");
            // Мок-объект WebApp, имитирующий основные функции Telegram.WebApp
            WebApp = {
                initDataUnsafe: {}, // Небезопасные данные инициализации
                initData: '',       // Данные инициализации
                version: '6.0',     // Версия API
                platform: 'unknown',// Платформа
                isExpanded: false,  // Расширено ли приложение на весь экран
                viewportHeight: window.innerHeight, // Высота viewport
                viewportStableHeight: window.innerHeight, // Стабильная высота viewport
                headerColor: '#ffffff', // Цвет заголовка
                backgroundColor: '#ffffff', // Цвет фона
                themeParams: {      // Параметры темы
                    bg_color: '#ffffff',
                    text_color: '#000000',
                    hint_color: '#707579',
                    link_color: '#2481cc',
                    button_color: '#2481cc',
                    button_text_color: '#ffffff',
                    secondary_bg_color: '#f4f4f5',
                },
                isClosingConfirmationEnabled: false, // Включено ли подтверждение закрытия
                onEvent: (eventType, callback) => { /* console.log(`Event ${eventType} fired`); */ }, // Обработчик событий
                offEvent: (eventType, callback) => {}, // Отключение обработчика событий
                sendData: (data) => { console.log("Sending data:", data); }, // Отправка данных в Telegram
                showAlert: (message) => { alert(message); }, // Показ нативного alert
                showConfirm: (message, callback) => { confirm(message) ? callback(true) : callback(false); }, // Показ нативного confirm
                showPopup: (params, callback) => { alert(params.message); callback(null); }, // Показ нативного popup
                ready: () => { console.log("WebApp ready (mocked)"); }, // Имитация готовности
                expand: () => { console.log("WebApp expanded (mocked)"); }, // Имитация расширения
                close: () => { console.log("WebApp closed (mocked)"); }, // Имитация закрытия
                setHeaderColor: (color) => { console.log("Header color set to (mocked):", color); }, // Установка цвета заголовка
                setBackgroundColor: (color) => { console.log("Background color set to (mocked):", color); }, // Установка цвета фона
                MainButton: { // Объект Главной Кнопки
                    text: '',
                    color: '',
                    textColor: '',
                    isVisible: false,
                    isActive: true,
                    isProgressVisible: false,
                    setText: (text) => { WebApp.MainButton.text = text; console.log("MainButton text (mocked):", text); },
                    onClick: (callback) => { /* mock click */ },
                    show: () => { WebApp.MainButton.isVisible = true; console.log("MainButton show (mocked)"); },
                    hide: () => { WebApp.MainButton.isVisible = false; console.log("MainButton hide (mocked)"); },
                    enable: () => { WebApp.MainButton.isActive = true; console.log("MainButton enable (mocked)"); },
                    disable: () => { WebApp.MainButton.isActive = false; console.log("MainButton disable (mocked)"); },
                    showProgress: (leaveActive) => { WebApp.MainButton.isProgressVisible = true; console.log("MainButton showProgress (mocked)"); },
                    hideProgress: () => { WebApp.MainButton.isProgressVisible = false; console.log("MainButton hideProgress (mocked)"); },
                    setParams: (params) => { Object.assign(WebApp.MainButton, params); console.log("MainButton setParams (mocked):", params); }
                },
                BackButton: { // Объект Кнопки Назад
                    isVisible: false,
                    onClick: (callback) => { /* mock click */ },
                    show: () => { WebApp.BackButton.isVisible = true; console.log("BackButton show (mocked)"); },
                    hide: () => { WebApp.BackButton.isVisible = false; console.log("BackButton hide (mocked)"); },
                }
            };
        }

        /**
         * @function applyThemeParams
         * @description Применяет параметры темы Telegram WebApp к CSS переменным
         * и определяет, нужно ли включить темный режим для приложения.
         */
        const applyThemeParams = () => {
            const themeParams = WebApp.themeParams;
            if (themeParams) {
                // Устанавливаем CSS переменные из параметров темы Telegram
                document.documentElement.style.setProperty('--background-color', themeParams.bg_color);
                document.documentElement.style.setProperty('--text-color', themeParams.text_color);
                document.documentElement.style.setProperty('--hint-color', themeParams.hint_color);
                document.documentElement.style.setProperty('--link-color', themeParams.link_color);
                document.documentElement.style.setProperty('--button-color', themeParams.button_color);
                document.documentElement.style.setProperty('--button-text-color', themeParams.button_text_color);
                document.documentElement.style.setProperty('--header-bg-color', themeParams.header_bg_color || themeParams.bg_color); // Если нет header_bg_color, используем bg_color
                document.documentElement.style.setProperty('--secondary-background-color', themeParams.secondary_bg_color);

                // Определяем, является ли тема темной, и добавляем/удаляем класс 'dark-mode' к body.
                // Это позволяет CSS файлу применять специфичные стили для темного режима.
                const bgColor = hexToRgb(themeParams.bg_color);
                if (bgColor && (bgColor.r * 0.299 + bgColor.g * 0.587 + bgColor.b * 0.114) < 186) { // Простой расчет яркости для определения темного режима
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        };

        /**
         * @function hexToRgb
         * @description Вспомогательная функция для конвертации HEX цвета в RGB объект.
         * @param {string} hex - HEX строка цвета (например, "#RRGGBB").
         * @returns {object|null} Объект с компонентами r, g, b или null, если входные данные некорректны.
         */
        const hexToRgb = (hex) => {
            if (!hex || typeof hex !== 'string') return null;
            const bigint = parseInt(hex.slice(1), 16);
            if (isNaN(bigint)) return null;
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return { r, g, b };
        };

        WebApp.ready(); // Сообщаем Telegram о готовности приложения
        WebApp.expand(); // Разворачиваем приложение на весь экран
        applyThemeParams(); // Применяем текущие параметры темы

        // Подписываемся на событие изменения темы в Telegram
        WebApp.onEvent('themeChanged', applyThemeParams);

        console.log("Telegram WebApp initialized.", WebApp);
    };

    /**
     * @function getWebApp
     * @description Возвращает объект Telegram WebApp SDK.
     * @returns {object} Объект WebApp.
     */
    const getWebApp = () => WebApp;

    return {
        init,
        getWebApp
    };
})();

// ========================================================
// КОНСТАНТЫ ПРИЛОЖЕНИЯ: Категории заведений
// Описание: Определяет основные категории заведений и их подкатегории.
// Используется для фильтрации, отображения и выбора при регистрации/добавлении.
// ========================================================
const APP_CATEGORIES = [
    {
        id: 'cafe',
        name: 'Кафе',
        icon: '☕',
        color: '#28a745',
        subcategories: ['Кофейни', 'Кондитерские', 'Десерты']
    },
    {
        id: 'restaurant',
        name: 'Рестораны',
        icon: '🍽️',
        color: '#dc3545',
        subcategories: ['Европейская кухня', 'Азиатская кухня', 'Итальянская кухня', 'Суши']
    },
    {
        id: 'bar',
        name: 'Бары',
        icon: '🍻',
        color: '#007bff',
        subcategories: ['Пабы', 'Коктейль-бары', 'Караоке']
    },
    {
        id: 'fastfood',
        name: 'Фастфуд',
        icon: '🍔',
        color: '#ffc107',
        subcategories: ['Бургеры', 'Пицца', 'Шаурма', 'Хот-доги']
    },
    {
        id: 'shop',
        name: 'Магазины',
        icon: '🛍️',
        color: '#6f42c1',
        subcategories: ['Продукты', 'Одежда', 'Электроника', 'Цветы']
    },
    {
        id: 'service',
        name: 'Услуги',
        icon: '💈',
        color: '#17a2b8',
        subcategories: ['Парикмахерские', 'Салоны красоты', 'Автосервисы']
    }
];

// ========================================================
// Модуль 2: Система Карты (Яндекс.Карты)
// Описание: Управляет инициализацией и поведением Яндекс.Карт,
// отображением заведений, фильтрацией, поиском и геолокацией пользователя.
// ========================================================
const MapSystem = (() => {
    let myMap = null; // Экземпляр карты Яндекс.Карт
    let objectManager = null; // ObjectManager для управления метками и кластерами
    let userGeolocationPlacemark = null; // Метка текущего местоположения пользователя
    let clickPlacemark = null; // Метка, добавляемая пользователем по клику на основной карте
    let establishmentsData = []; // Все загруженные заведения (моковые или с сервера)
    // Объект, хранящий текущие фильтры (категория, поисковый запрос)
    let currentFilters = { category: 'all', search: '' };

    // Моковые данные заведений (в реальном приложении будут загружаться с сервера)
    // Каждое заведение содержит ID, название, описание, категорию, координаты, фото, рейтинг, контакты и отзывы.
    const mockEstablishments = [
        {
            id: 'est1',
            name: 'Кафе "Уют"',
            description: 'Небольшое и уютное кафе с домашней выпечкой.',
            category: 'cafe',
            priceCategory: '$', // Ценовая категория
            coordinates: [55.75, 37.62], // Центр Москвы
            photos: ['https://via.placeholder.com/150/FF0000/FFFFFF?text=Cafe1', 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Cafe2'],
            rating: 4.5,
            contact: 'Тел: +7 (XXX) XXX-XX-XX, Email: cozycafe@example.com',
            reviews: [
                { author: 'Анна К.', text: 'Отличное место для завтрака!', rating: 5 },
                { author: 'Петр С.', text: 'Вкусный кофе, но иногда шумно.', rating: 4 }
            ]
        },
        {
            id: 'est2',
            name: 'Ресторан "Гурман"',
            description: 'Изысканная кухня и превосходный сервис.',
            category: 'restaurant',
            priceCategory: '$$$', // Ценовая категория
            coordinates: [55.78, 37.60], // Север Москвы
            photos: ['https://via.placeholder.com/150/0000FF/FFFFFF?text=Resto1', 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Resto2'],
            rating: 4.8,
            contact: 'Тел: +7 (XXX) YYY-YY-YY, Сайт: gourmet.ru',
            reviews: [
                { author: 'Елена В.', text: 'Незабываемый ужин, все на высшем уровне.', rating: 5 },
                { author: 'Дмитрий Л.', text: 'Цены кусаются, но оно того стоит.', rating: 4 }
            ]
        },
        {
            id: 'est3',
            name: 'Магазин "Продукты 24/7"',
            description: 'Круглосуточный магазин с широким ассортиментом.',
            category: 'shop',
            priceCategory: '$', // Ценовая категория
            coordinates: [55.73, 37.65], // Юго-Восток Москвы
            photos: ['https://via.placeholder.com/150/00FF00/FFFFFF?text=Shop1'],
            rating: 3.9,
            contact: 'Тел: +7 (XXX) ZZZ-ZZ-ZZ',
            reviews: [
                { author: 'Олег П.', text: 'Удобно, что работает всегда.', rating: 4 }
            ]
        },
        {
            id: 'est4',
            name: 'Пекарня "Свежий Хлеб"',
            description: 'Всегда свежий хлеб и ароматная выпечка.',
            category: 'cafe',
            priceCategory: '$$', // Ценовая категория
            coordinates: [55.74, 37.58],
            photos: ['https://via.placeholder.com/150/FFFF00/000000?text=Bakery1'],
            rating: 4.7,
            contact: 'Тел: +7 (XXX) AAA-AA-AA',
            reviews: [
                { author: 'Мария И.', text: 'Лучший хлеб в городе!', rating: 5 }
            ]
        }
    ];

    /**
     * @function getPlacemarkIcon
     * @description Возвращает параметры для кастомной иконки метки в зависимости от категории заведения.
     * @param {string} category - Категория заведения (e.g., 'cafe', 'restaurant', 'shop').
     * @param {boolean} isFavorite - Флаг, указывающий, является ли заведение избранным.
     * @returns {object} Объект с настройками иконки для Yandex Maps API.
     */
    const getPlacemarkIcon = (category, isFavorite) => {
        let color = '#007bff'; // Дефолтный цвет (синий)
        let iconHref = `https://raw.githubusercontent.com/yandex/yandex-maps-api-demos/master/js/svg/pin_circle_blue.svg`;

        if (isFavorite) {
            color = '#ffc107'; // Золотой/желтый для избранных
            iconHref = `https://raw.githubusercontent.com/yandex/yandex-maps-api-demos/master/js/svg/pin_circle_yellow.svg`; // Специальная иконка для избранных
        } else {
            switch (category) {
                case 'cafe':
                    color = '#28a745'; // Зеленый для кафе
                    break;
                case 'restaurant':
                    color = '#dc3545'; // Красный для ресторанов
                    break;
                case 'shop':
                    color = '#ffc107'; // Желтый для магазинов
                    break;
                default:
                    color = TelegramWebApp.getWebApp().themeParams.button_color || '#007bff'; // Цвет кнопки из темы
                    break;
            }
        }

        return {
            iconLayout: 'default#image',
            iconImageHref: iconHref,
            iconImageSize: [30, 30],
            iconImageOffset: [-15, -15],
            iconColor: color
        };
    };

    /**
     * @function initMap
     * @description Инициализирует Яндекс.Карту в контейнере '#map-container'.
     * Добавляет элементы управления, ObjectManager для меток и обработчики событий.
     */
    const initMap = () => {
        const tryInit = (attempt = 1) => {
            if (typeof window.ymaps === 'undefined') {
                if (attempt <= 10) {
                    // Ждём загрузку скрипта Яндекс.Карт и пробуем снова
                    setTimeout(() => tryInit(attempt + 1), 300);
                } else {
                    console.error("Яндекс.Карты API не загрузился.");
                    const container = document.getElementById('map-container');
                    if (container) {
                        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#cc0000;font-weight:bold;">Не удалось загрузить карту. Проверьте подключение и API‑ключ.</div>';
                    }
                }
                return;
            }

            window.ymaps.ready(() => {
            const containerId = document.getElementById('map') ? 'map' : 'map-container';
            myMap = new ymaps.Map(containerId, {
                center: [55.76, 37.64], // Начальный центр карты (Москва)
                zoom: 10, // Начальный уровень зума
                controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'] // Элементы управления на карте
            }, {
                suppressMapOpenBlock: true, // Скрываем блок "Открыть в Картах"
                // Для темной темы карты можно использовать свойство `mapType`
                // и создавать свои слои, если это поддерживается, или стилизовать через CSS как сейчас.
                // yandex#map - стандартная схема, можно попробовать спутник или гибрид
                // mapType: 'yandex#satellite'
            });
            window.myMap = myMap; // Делаем карту доступной глобально для отладки или других модулей

            // Инициализация ObjectManager для меток и кластеров
            // ObjectManager автоматически управляет кластеризацией меток при изменении зума.
            objectManager = new ymaps.ObjectManager({
                clusterize: true, // Включить кластеризацию
                gridSize: 64, // Размер сетки кластеризации
                clusterDisableClickZoom: false, // Отключить зум при клике на кластер
                clusterHasBalloon: true // Кластеры также будут иметь всплывающие окна
            });
            myMap.geoObjects.add(objectManager); // Добавляем ObjectManager на карту

            loadEstablishments(); // Загружаем и отображаем заведения на карте

            // Обработчик клика по метке (или кластеру)
            objectManager.objects.events.add(['click'], (e) => {
                const objectId = e.get('objectId');
                const object = objectManager.objects.getById(objectId);
                // Проверяем, что это не кластер, а отдельная метка заведения
                if (object.properties.isCluster) return; // Если это кластер, игнорируем клик

                // Находим полное описание заведения по ID метки
                const establishment = establishmentsData.find(est => est.id === object.properties.establishmentId);
                if (establishment) {
                    ModalSystem.showEstablishmentDetails(establishment); // Показываем модальное окно с деталями
                }
            });

            // Добавление/перемещение пользовательской метки по клику на карте
            myMap.events.add('click', (e) => {
                const coords = e.get('coords');
                if (!clickPlacemark) {
                    clickPlacemark = new ymaps.Placemark(coords, { hintContent: 'Выбранная точка' }, { draggable: true });
                    myMap.geoObjects.add(clickPlacemark);
                } else {
                    clickPlacemark.geometry.setCoordinates(coords);
                }
                const coordsInput = document.getElementById('est-coords');
                if (coordsInput) {
                    coordsInput.value = coords.map(v => v.toFixed(6)).join(', ');
                }
            });

            // Обработчик изменения области просмотра карты (для динамической подгрузки данных, если необходимо)
            myMap.events.add('boundschange', (e) => {
                // console.log("Map bounds changed:", e.get('newBounds'));
                // Здесь можно реализовать логику подгрузки заведений в видимой области карты
            });

            console.log("Yandex Map initialized.");
        });
        };

        tryInit();
    };

    /**
     * @function loadEstablishments
     * @description Загружает данные о заведениях. В текущей реализации использует моковые данные.
     * В реальном приложении здесь будет AJAX запрос к API сервера.
     * После загрузки данных вызывает `applyFilters` для их отображения на карте.
     */
    const loadEstablishments = async () => {
        // В реальном приложении: const response = await fetch('/api/establishments');
        // const data = await response.json();
        // establishmentsData = data;
        establishmentsData = mockEstablishments; // Используем моковые данные для примера
        applyFilters(); // Отображаем все заведения после загрузки
    };

    /**
     * @function applyFilters
     * @description Применяет текущие фильтры (категория, поисковый запрос) к списку заведений
     * и обновляет метки на карте через ObjectManager.
     */
    const applyFilters = () => {
        if (!objectManager) {
            return;
        }
        objectManager.removeAll(); // Очищаем все существующие метки на карте

        // Фильтруем заведения на основе текущих фильтров
        let establishmentsToDisplay = establishmentsData;

        const currentUser = UserSystem.getProfile();
        const favoriteCategories = currentUser ? UserSystem.getFavoriteCategories() : [];
        const favoriteEstablishments = currentUser ? UserSystem.getFavoriteEstablishments() : [];

        establishmentsToDisplay = establishmentsToDisplay.filter(est => {
            const matchesCategory = currentFilters.category === 'all' || est.category === currentFilters.category;
            const matchesSearch = est.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                est.description.toLowerCase().includes(currentFilters.search.toLowerCase());
            const matchesFavoriteCategory = favoriteCategories.length === 0 || favoriteCategories.includes(est.category);
            return matchesCategory && matchesSearch && matchesFavoriteCategory;
        });

        // Приоритетное отображение избранных заведений
        establishmentsToDisplay.sort((a, b) => {
            const aIsFavorite = favoriteEstablishments.includes(a.id);
            const bIsFavorite = favoriteEstablishments.includes(b.id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return 0;
        });

        // Формируем GeoJSON объекты для ObjectManager
        const features = establishmentsToDisplay.map(est => ({
            id: est.id,
            type: 'Feature',
            geometry: { type: 'Point', coordinates: est.coordinates },
            properties: {
                balloonContentHeader: est.name,
                balloonContentBody: `Категория: ${est.category}<br>Рейтинг: ${est.rating}`,
                clusterCaption: est.name,
                hintContent: est.name,
                establishmentId: est.id
            },
            options: getPlacemarkIcon(est.category, UserSystem.isFavoriteEstablishment(est.id))
        }));
        objectManager.add(features); // Добавляем отфильтрованные метки на карту
    };

    /**
     * @function updateFilters
     * @description Обновляет текущие фильтры и вызывает `applyFilters` для перерисовки карты.
     * @param {object} newFilters - Объект с новыми параметрами фильтра (например, { category: 'cafe' }).
     */
    const updateFilters = (newFilters) => {
        currentFilters = { ...currentFilters, ...newFilters }; // Объединяем старые и новые фильтры
        applyFilters(); // Применяем обновленные фильтры
    };

    /**
     * @function getUserGeolocation
     * @description Определяет текущее местоположение пользователя с помощью Yandex Maps Geolocation API
     * и центрирует карту на этой точке, добавляя метку.
     * Выводит уведомления через TelegramWebApp.
     */
    const getUserGeolocation = () => {
        if (!myMap) {
            console.error("Карта не инициализирована.");
            return;
        }
        TelegramWebApp.getWebApp().showAlert("Определяем ваше местоположение...");
        ymaps.geolocation.get({
            provider: 'browser', // Используем геолокацию браузера
            mapStateAutoApply: true // Автоматически центрировать карту на найденном местоположении
        }).then(function (result) {
            result.geoObjects.options.set('preset', 'islands#darkVioletDotIcon'); // Устанавливаем стиль метки геолокации
            result.geoObjects.each(geoObject => {
                // Удаляем предыдущую метку геолокации, если она существует
                if (userGeolocationPlacemark) {
                    myMap.geoObjects.remove(userGeolocationPlacemark);
                }
                userGeolocationPlacemark = geoObject; // Сохраняем новую метку
                myMap.geoObjects.add(userGeolocationPlacemark); // Добавляем метку на карту
                myMap.setCenter(geoObject.geometry.getCoordinates(), 14); // Центрируем карту на пользователе с зумом 14
            });
            TelegramWebApp.getWebApp().showAlert("Ваше местоположение определено!");
            // После получения геолокации можно применить фильтр "рядом со мной"
            // Здесь потребуется более сложная логика фильтрации заведений по расстоянию от пользователя.
        }, function (err) {
            TelegramWebApp.getWebApp().showAlert('Ошибка: ' + err.message);
            console.error("Ошибка при получении геолокации:", err);
        });
    };

    /**
     * @function getEstablishments
     * @description Возвращает текущий список всех заведений.
     * @returns {Array<object>} Массив объектов заведений.
     */
    const getEstablishments = () => establishmentsData;

    /**
     * @function addEstablishment
     * @description Добавляет новое заведение в список и обновляет карту.
     * В реальном приложении это также отправит данные на сервер.
     * @param {object} newEst - Объект нового заведения.
     * @returns {object} Добавленное заведение с присвоенным ID.
     */
    const addEstablishment = (newEst) => {
        // В реальном приложении: отправка на сервер через API
        newEst.id = 'est' + (establishmentsData.length + 1); // Простой генератор ID для мока
        establishmentsData.push(newEst); // Добавляем в локальный массив
        applyFilters(); // Обновляем карту, чтобы отобразить новое заведение
        return newEst;
    };

    /**
     * @function updateEstablishment
     * @description Обновляет существующее заведение в списке и на карте.
     * В реальном приложении это также отправит обновленные данные на сервер.
     * @param {object} updatedEst - Объект обновленного заведения (должен содержать `id`).
     * @returns {boolean} True, если заведение найдено и обновлено, иначе false.
     */
    const updateEstablishment = (updatedEst) => {
        // В реальном приложении: отправка на сервер через API
        const index = establishmentsData.findIndex(est => est.id === updatedEst.id);
        if (index !== -1) {
            establishmentsData[index] = updatedEst; // Обновляем данные в локальном массиве
            applyFilters(); // Обновляем карту, чтобы отобразить изменения
            return true;
        }
        return false;
    };

    /**
     * @function deleteEstablishment
     * @description Удаляет заведение из списка и с карты по его ID.
     * В реальном приложении это также отправит запрос на удаление на сервер.
     * @param {string} id - ID заведения для удаления.
     * @returns {boolean} True, если заведение удалено, иначе false.
     */
    const deleteEstablishment = (id) => {
        // В реальном приложении: отправка на сервер через API
        const initialLength = establishmentsData.length;
        establishmentsData = establishmentsData.filter(est => est.id !== id); // Удаляем из локального массива
        if (establishmentsData.length < initialLength) {
            applyFilters(); // Обновляем карту
            return true;
        }
        return false;
    };

    return {
        initMap,
        loadEstablishments,
        updateFilters,
        getUserGeolocation,
        getEstablishments,
        addEstablishment,
        updateEstablishment,
        deleteEstablishment
    };
})();

// ========================================================
// Модуль 3: Система Пользователей (Предприниматели/Пользователи)
// Описание: Управляет состоянием текущего пользователя (обычный или предприниматель),
// а также функциями регистрации, авторизации и обновления профиля предпринимателя.
// ========================================================
const UserSystem = (() => {
    let currentUser = null; // null: обычный пользователь, { type: 'business', ... }: предприниматель

    // Моковые данные предпринимателя. Включают ID, тип, название, категорию, описание, логотип,
    // местоположение, контактное лицо, email и список заведений.
    const mockBusinessProfile = {
        id: 'biz1',
        type: 'business',
        businessName: 'Моя Компания',
        businessCategory: 'food', // Категория бизнеса
        businessDescription: 'Мы предлагаем лучшие блюда в городе!', // Описание бизнеса
        businessLogo: 'https://via.placeholder.com/100/0000FF/FFFFFF?text=Logo', // URL логотипа
        businessLocation: [55.76, 37.64], // Координаты местоположения
        contactPerson: 'Иванов Иван',
        email: 'ivanov@mycompany.com',
        establishments: [ // Список заведений предпринимателя
            { id: 'est1', name: 'Кафе "Уют"' },
            { id: 'est2', name: 'Ресторан "Гурман"' }
        ],
        // Добавлено для ФНС верификации
        inn: '7700000000', // Моковый ИНН
        isVerified: false,
        fnsData: null,
        // Добавлено для категорий и избранного
        favoriteCategories: [],
        favoriteEstablishments: []
    };

    // Ключи для localStorage
    const LS_KEY_CURRENT_USER = 'mapcost_current_user';

    /**
     * @function loadUserData
     * @description Загружает данные пользователя из localStorage.
     * @returns {object|null} Данные пользователя или null, если нет сохраненных данных.
     */
    const loadUserData = () => {
        try {
            const data = localStorage.getItem(LS_KEY_CURRENT_USER);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Ошибка при загрузке данных пользователя из localStorage:", e);
            return null;
        }
    };

    /**
     * @function saveUserData
     * @description Сохраняет данные пользователя в localStorage.
     * @param {object} data - Объект данных пользователя для сохранения.
     */
    const saveUserData = (data) => {
        try {
            localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(data));
        } catch (e) {
            console.error("Ошибка при сохранении данных пользователя в localStorage:", e);
        }
    };

    /**
     * @function init
     * @description Инициализирует модуль UserSystem. Загружает профиль пользователя из localStorage.
     */
    const init = () => {
        const savedUser = loadUserData();
        if (savedUser) {
            currentUser = savedUser;
            console.log("Пользователь загружен из localStorage:", currentUser);
        } else {
            // Если нет сохраненного пользователя, инициализируем как обычного пользователя
            currentUser = { type: 'regular', favoriteCategories: [], favoriteEstablishments: [] };
            saveUserData(currentUser);
            console.log("Инициализирован новый обычный пользователь.", currentUser);
        }
    };

    /**
     * @function loginBusiness
     * @description Имитирует вход предпринимателя в систему. Устанавливает `currentUser`
     * на моковые данные, выводит уведомление, переходит на экран профиля
     * и обновляет его. В реальном приложении здесь будет логика авторизации через API.
     */
    const loginBusiness = () => {
        // В реальном приложении: логика авторизации (например, запрос к серверу)
        currentUser = { ...mockBusinessProfile }; // Клонируем мок-профиль, чтобы избежать мутации
        TelegramWebApp.getWebApp().showAlert("Вы вошли как предприниматель!");
        Navigation.goToScreen('business-profile-screen'); // Переход на экран профиля
        updateProfileScreen(currentUser); // Обновление UI экрана профиля
    };

    /**
     * @function logoutBusiness
     * @description Выходит из режима предпринимателя. Сбрасывает `currentUser`,
     * выводит уведомление и возвращает на главный экран карты.
     */
    const logoutBusiness = () => {
        currentUser = null; // Сбрасываем текущего пользователя
        TelegramWebApp.getWebApp().showAlert("Вы вышли из режима предпринимателя.");
        Navigation.goToScreen('main-map-screen'); // Возвращаемся на главный экран карты
    };

    /**
     * @function registerBusiness
     * @description Имитирует регистрацию нового предпринимателя.
     * Принимает данные формы, устанавливает их как `currentUser`,
     * выводит уведомление и переходит на экран профиля.
     * В реальном приложении будет отправлять данные на сервер.
     * @param {object} businessData - Объект с данными регистрации предпринимателя.
     */
    const registerBusiness = async (businessData) => {
        console.log("Attempting to register business:", businessData);
        try {
            // В реальном приложении:
            // const response = await fetch('/api/register-business', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(businessData)
            // });
            // const result = await response.json();

            // if (response.ok) {
            //     currentUser = { type: 'business', ...result, establishments: [] }; // Предполагаем, что новый бизнес пока без заведений
            currentUser = {
                type: 'business',
                ...businessData,
                id: 'biz' + (Math.floor(Math.random() * 1000) + 2),
                establishments: []
            }; // Мок-регистрация
            TelegramWebApp.getWebApp().showAlert("Предприниматель успешно зарегистрирован!");
            Navigation.goToScreen('business-profile-screen');
            updateProfileScreen(currentUser);
            // } else {
            //     TelegramWebApp.getWebApp().showAlert(`Ошибка регистрации: ${result.message || response.statusText}`);
            // }
        } catch (error) {
            console.error("Ошибка при регистрации предпринимателя:", error);
            TelegramWebApp.getWebApp().showAlert("Произошла ошибка при регистрации.");
        }
    };

    /**
     * @function updateBusinessProfile
     * @description Имитирует обновление профиля предпринимателя.
     * Принимает новые данные, обновляет `currentUser`, выводит уведомление
     * и переходит на экран профиля.
     * В реальном приложении будет отправлять данные на сервер.
     * @param {object} profileData - Объект с обновленными данными профиля.
     */
    const updateBusinessProfile = async (profileData) => {
        console.log("Attempting to update business profile:", profileData);
        // В реальном приложении: AJAX запрос к API для обновления профиля
        try {
            // const response = await fetch('/api/update-business-profile', { /* ... */ });
            // const result = await response.json();
            // if (response.ok) {
            currentUser = { ...currentUser, ...profileData }; // Обновляем моковый профиль
            TelegramWebApp.getWebApp().showAlert("Профиль успешно обновлен!");
            Navigation.goToScreen('business-profile-screen');
            updateProfileScreen(currentUser);
            saveUserData(currentUser); // Сохраняем обновленный профиль
            // } else { /* ... */ }
        } catch (error) {
            console.error("Ошибка при обновлении профиля:", error);
            TelegramWebApp.getWebApp().showAlert("Произошла ошибка при обновлении профиля.");
        }
    };

    /**
     * @function getProfile
     * @description Возвращает объект текущего пользователя (или null).
     * @returns {object|null} Объект `currentUser`.
     */
    const getProfile = () => currentUser;

    /**
     * @function updateProfileScreen
     * @description Обновляет элементы интерфейса на экране профиля предпринимателя
     * на основе данных переданного профиля. Отображает название, контакты, email
     * и динамически формирует список заведений. Включает отображение статуса верификации ИНН.
     * @param {object} profile - Объект профиля предпринимателя.
     */
    const updateProfileScreen = (profile) => {
        if (profile && profile.type === 'business') {
            // Обновляем текстовые поля информацией из профиля
            document.getElementById('profile-business-name').innerText = profile.businessName || 'N/A';
            document.getElementById('profile-business-category').innerText = profile.businessCategory || 'Не указана'; // Категория
            document.getElementById('profile-business-description').innerText = profile.businessDescription || 'Нет описания'; // Описание
            document.getElementById('profile-contact-person').innerText = profile.contactPerson || 'N/A';
            document.getElementById('profile-email').innerText = profile.email || 'N/A';
            document.getElementById('profile-business-location').innerText = profile.businessLocation ? profile.businessLocation.join(', ') : 'Не указано'; // Местоположение

            // Обновляем статус верификации ИНН
            const innVerificationStatusElement = document.getElementById('profile-inn-verification-status');
            if (innVerificationStatusElement) {
                if (profile.isVerified) {
                    innVerificationStatusElement.innerText = 'Верифицирован через ФНС';
                    innVerificationStatusElement.classList.remove('warning', 'error');
                    innVerificationStatusElement.classList.add('success');
                } else if (profile.inn) {
                    innVerificationStatusElement.innerText = 'Не верифицирован (ИНН указан, но не проверен или есть ошибки)';
                    innVerificationStatusElement.classList.remove('success', 'error');
                    innVerificationStatusElement.classList.add('warning');
                } else {
                    innVerificationStatusElement.innerText = 'ИНН не указан';
                    innVerificationStatusElement.classList.remove('success', 'warning');
                    innVerificationStatusElement.classList.add('error');
                }
                innVerificationStatusElement.style.display = 'block';
            }

            // Обновляем список заведений предпринимателя
            const establishmentListContainer = document.querySelector('.establishment-list');
            establishmentListContainer.innerHTML = '<h4>Мои заведения:</h4>'; // Очищаем и добавляем заголовок
            if (profile.establishments && profile.establishments.length > 0) {
                const ul = document.createElement('ul');
                profile.establishments.forEach(est => {
                    const li = document.createElement('li');
                    li.innerText = est.name; // Можно добавить кнопки для редактирования/удаления
                    ul.appendChild(li);
                });
                establishmentListContainer.appendChild(ul);
            } else {
                const p = document.createElement('p');
                p.innerText = 'У вас пока нет заведений.';
                establishmentListContainer.appendChild(p);
            }
        }

        // Обновляем UI для любимых категорий (если экран "favorite-categories-screen" активен)
        if (Navigation.getCurrentScreenId() === 'favorite-categories-screen') {
            renderCategorySelection('favorite-categories-list', profile, addFavoriteCategory, removeFavoriteCategory, MapSystem.applyFilters);
        }

        // Обновляем UI для избранных заведений (если экран "favorites" активен)
        if (Navigation.getCurrentScreenId() === 'favorites-screen' && profile.favoriteEstablishments) {
            const favoriteEstablishmentsContainer = document.getElementById('favorite-establishments-list');
            if (favoriteEstablishmentsContainer) {
                favoriteEstablishmentsContainer.innerHTML = ''; // Очищаем
                if (profile.favoriteEstablishments.length > 0) {
                    profile.favoriteEstablishments.forEach(estId => {
                        const establishment = MapSystem.getEstablishments().find(e => e.id === estId);
                        if (establishment) {
                            const div = document.createElement('div');
                            div.classList.add('favorite-establishment-item');
                            div.innerHTML = `
                                <span class="name">${establishment.name}</span>
                                <span class="category">${establishment.category}</span>
                                <button class="telegram-button small-button view-details-button" data-id="${establishment.id}">Подробнее</button>
                                <button class="telegram-button small-button remove-favorite-button" data-id="${establishment.id}">❌</button>
                            `;
                            div.querySelector('.view-details-button').addEventListener('click', () => {
                                ModalSystem.showEstablishmentDetails(establishment);
                            });
                            div.querySelector('.remove-favorite-button').addEventListener('click', () => {
                                removeFavoriteEstablishment(establishment.id);
                                updateProfileScreen(currentUser); // Обновляем список избранного
                                MapSystem.applyFilters(); // Обновляем карту
                            });
                            favoriteEstablishmentsContainer.appendChild(div);
                        }
                    });
                } else {
                    favoriteEstablishmentsContainer.innerHTML = '<p>У вас пока нет избранных заведений.</p>';
                }
            }
        }
    };

    /**
     * @function addFavoriteCategory
     * @description Добавляет категорию в список любимых категорий пользователя.
     * @param {string} categoryId - ID категории для добавления.
     */
    const addFavoriteCategory = (categoryId) => {
        if (currentUser && !currentUser.favoriteCategories.includes(categoryId)) {
            currentUser.favoriteCategories.push(categoryId);
            saveUserData(currentUser);
            console.log(`Категория ${categoryId} добавлена в избранное.`);
        }
    };

    /**
     * @function removeFavoriteCategory
     * @description Удаляет категорию из списка любимых категорий пользователя.
     * @param {string} categoryId - ID категории для удаления.
     */
    const removeFavoriteCategory = (categoryId) => {
        if (currentUser) {
            currentUser.favoriteCategories = currentUser.favoriteCategories.filter(id => id !== categoryId);
            saveUserData(currentUser);
            console.log(`Категория ${categoryId} удалена из избранного.`);
        }
    };

    /**
     * @function isFavoriteCategory
     * @description Проверяет, является ли категория любимой для текущего пользователя.
     * @param {string} categoryId - ID категории для проверки.
     * @returns {boolean} True, если категория является любимой, иначе false.
     */
    const isFavoriteCategory = (categoryId) => {
        return currentUser && currentUser.favoriteCategories.includes(categoryId);
    };

    /**
     * @function addFavoriteEstablishment
     * @description Добавляет заведение в список избранных заведений пользователя.
     * @param {string} establishmentId - ID заведения для добавления.
     */
    const addFavoriteEstablishment = (establishmentId) => {
        if (currentUser && !currentUser.favoriteEstablishments.includes(establishmentId)) {
            currentUser.favoriteEstablishments.push(establishmentId);
            saveUserData(currentUser);
            TelegramWebApp.getWebApp().showAlert("Заведение добавлено в избранное!");
            console.log(`Заведение ${establishmentId} добавлено в избранное.`);
        }
    };

    /**
     * @function removeFavoriteEstablishment
     * @description Удаляет заведение из списка избранных заведений пользователя.
     * @param {string} establishmentId - ID заведения для удаления.
     */
    const removeFavoriteEstablishment = (establishmentId) => {
        if (currentUser) {
            currentUser.favoriteEstablishments = currentUser.favoriteEstablishments.filter(id => id !== establishmentId);
            saveUserData(currentUser);
            TelegramWebApp.getWebApp().showAlert("Заведение удалено из избранного.");
            console.log(`Заведение ${establishmentId} удалено из избранного.`);
        }
    };

    /**
     * @function isFavoriteEstablishment
     * @description Проверяет, находится ли заведение в списке избранных у текущего пользователя.
     * @param {string} establishmentId - ID заведения для проверки.
     * @returns {boolean} True, если заведение в избранном, иначе false.
     */
    const isFavoriteEstablishment = (establishmentId) => {
        return currentUser && currentUser.favoriteEstablishments.includes(establishmentId);
    };

    /**
     * @function getFavoriteCategories
     * @description Возвращает список ID любимых категорий текущего пользователя.
     * @returns {Array<string>} Массив ID любимых категорий.
     */
    const getFavoriteCategories = () => {
        return currentUser ? [...currentUser.favoriteCategories] : [];
    };

    /**
     * @function getFavoriteEstablishments
     * @description Возвращает список ID избранных заведений текущего пользователя.
     * @returns {Array<string>} Массив ID избранных заведений.
     */
    const getFavoriteEstablishments = () => {
        return currentUser ? [...currentUser.favoriteEstablishments] : [];
    };

    /**
     * @function verifyInn
     * @description Отправляет запрос на сервер для проверки ИНН через API ФНС (DaData.ru).
     * Обновляет статус верификации и отображает данные компании на основе ответа.
     * @param {string} inn - ИНН для проверки.
     * @param {HTMLElement} statusDisplayElement - Элемент для отображения статуса верификации.
     * @param {HTMLElement} companyDataDisplayElement - Элемент для отображения данных компании.
     * @returns {Promise<object|null>} Объект с результатом проверки или null в случае ошибки.
     */
    const verifyInn = async (inn, statusDisplayElement, companyDataDisplayElement) => {
        statusDisplayElement.style.display = 'block';
        statusDisplayElement.className = 'verification-status-message';
        statusDisplayElement.innerText = 'Проверка ИНН...';
        companyDataDisplayElement.style.display = 'none';

        try {
            const response = await fetch('/api/fns/verify-inn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inn })
            });
            const result = await response.json();

            if (response.ok) {
                statusDisplayElement.classList.add(result.status);
                statusDisplayElement.innerText = result.message;
                if (result.company) {
                    document.getElementById('fns-company-name').innerText = result.company.name;
                    document.getElementById('fns-ogrn').innerText = result.company.ogrn;
                    document.getElementById('fns-address').innerText = result.company.address;
                    document.getElementById('fns-okved').innerText = result.company.okved;
                    document.getElementById('fns-status').innerText = result.company.state;
                    companyDataDisplayElement.style.display = 'flex';
                } else {
                    companyDataDisplayElement.style.display = 'none';
                }
                return result;
            } else {
                statusDisplayElement.classList.add('error');
                statusDisplayElement.innerText = result.message || 'Ошибка при проверке ИНН.';
                return null;
            }
        } catch (error) {
            console.error('Ошибка при запросе к API ФНС:', error);
            statusDisplayElement.classList.add('error');
            statusDisplayElement.innerText = 'Ошибка сети или сервера при проверке ИНН.';
            return null;
        }
    };

    return {
        registerBusiness,
        getProfile,
        updateProfileScreen,
        loginBusiness,
        logoutBusiness,
        updateBusinessProfile,
        verifyInn,
        addFavoriteCategory,
        removeFavoriteCategory,
        isFavoriteCategory,
        addFavoriteEstablishment,
        removeFavoriteEstablishment,
        isFavoriteEstablishment,
        getFavoriteCategories,
        getFavoriteEstablishments
    };
})();

// ========================================================
// Модуль 5: Модальные окна (для детальной информации о заведении)
// Описание: Управляет отображением модального окна с детальной информацией о заведении,
// включая название, описание, категорию, рейтинг, контакты, фотографии и отзывы.
// Также обрабатывает действия "Построить маршрут" и "Удалить заведение".
// ========================================================
const ModalSystem = (() => {
    const modal = document.getElementById('establishment-modal'); // Главное модальное окно деталей заведения
    const closeButton = modal.querySelector('.close-button'); // Кнопка закрытия модального окна
    const buildRouteButton = document.getElementById('build-route-button'); // Кнопка "Построить маршрут"
    const deleteEstablishmentButton = document.getElementById('delete-establishment-button'); // Кнопка "Удалить заведение"
    const addToFavoritesButton = document.getElementById('add-to-favorites-button'); // Кнопка "Добавить в избранное"
    let currentEstablishment = null; // Текущее заведение, которое отображается в модальном окне

    /**
     * @function showEstablishmentDetails
     * @description Показывает модальное окно с детальной информацией о заведении.
     * Заполняет поля модального окна данными из объекта заведения, загружает фотографии
     * и отзывы, а также управляет видимостью кнопки "Удалить заведение"
     * в зависимости от того, является ли текущий пользователь владельцем.
     * @param {object} establishment - Объект заведения с полной информацией.
     */
    const showEstablishmentDetails = (establishment) => {
        currentEstablishment = establishment; // Сохраняем текущее заведение для использования в других функциях

        // Заполняем элементы модального окна данными заведения
        document.getElementById('modal-establishment-name').innerText = establishment.name;
        document.getElementById('modal-establishment-description').innerText = establishment.description;
        document.getElementById('modal-establishment-category').innerText = establishment.category;
        document.getElementById('modal-establishment-price-category').innerText = establishment.priceCategory || 'Не указана'; // Ценовая категория
        document.getElementById('modal-establishment-rating').innerText = establishment.rating;
        document.getElementById('modal-establishment-contact').innerText = establishment.contact;

        // Загрузка и отображение фотографий заведения
        const photosContainer = modal.querySelector('.modal-photos');
        photosContainer.innerHTML = ''; // Очищаем контейнер от предыдущих фото
        establishment.photos.forEach(photoUrl => {
            const img = document.createElement('img');
            img.src = photoUrl;
            img.alt = establishment.name;
            photosContainer.appendChild(img);
        });

        // Загрузка и отображение отзывов о заведении
        const reviewsContainer = modal.querySelector('.modal-reviews');
        reviewsContainer.innerHTML = '<h4>Отзывы:</h4>'; // Очищаем и добавляем заголовок
        if (establishment.reviews && establishment.reviews.length > 0) {
            establishment.reviews.forEach(review => {
                const p = document.createElement('p');
                p.innerHTML = `<span class="review-author">${review.author}</span> (Рейтинг: ${review.rating}): ${review.text}`;
                reviewsContainer.appendChild(p);
            });
        } else {
            const p = document.createElement('p');
            p.innerText = 'Отзывов пока нет.';
            reviewsContainer.appendChild(p);
        }

        modal.classList.add('active'); // Активируем (показываем) модальное окно
        TelegramWebApp.getWebApp().BackButton.show(); // Показываем кнопку "Назад" Telegram WebApp

        // Управляем видимостью кнопки "Удалить заведение".
        // Она видна только если текущий пользователь является предпринимателем
        // и это заведение принадлежит ему.
        const currentUser = UserSystem.getProfile();
        if (currentUser && currentUser.type === 'business' && currentUser.establishments.some(e => e.id === establishment.id)) {
            deleteEstablishmentButton.style.display = 'block'; // Показываем кнопку
            addToFavoritesButton.style.display = 'none'; // Скрываем кнопку "Добавить в избранное" для владельца
        } else {
            deleteEstablishmentButton.style.display = 'none'; // Скрываем кнопку
            // Показываем кнопку "Добавить в избранное" для обычных пользователей
            addToFavoritesButton.style.display = 'block';
            // Обновляем текст и состояние кнопки избранного
            if (UserSystem.isFavoriteEstablishment(establishment.id)) {
                addToFavoritesButton.innerText = '⭐ Удалить из избранного';
                addToFavoritesButton.classList.add('active-favorite');
            } else {
                addToFavoritesButton.innerText = '⭐ Добавить в избранное';
                addToFavoritesButton.classList.remove('active-favorite');
            }
        }
    };

    /**
     * @function hideEstablishmentDetails
     * @description Скрывает модальное окно с детальной информацией о заведении.
     * Также управляет видимостью кнопки "Назад" Telegram WebApp.
     */
    const hideEstablishmentDetails = () => {
        modal.classList.remove('active'); // Деактивируем (скрываем) модальное окно
        // Если текущий экран не главный экран карты, то показываем кнопку "Назад" Telegram.
        // В противном случае - скрываем.
        if (Navigation.getCurrentScreenId() !== 'main-map-screen') {
            TelegramWebApp.getWebApp().BackButton.show();
        } else {
            TelegramWebApp.getWebApp().BackButton.hide();
        }
        currentEstablishment = null; // Сбрасываем текущее заведение
    };

    // Обработчик кнопки "Построить маршрут"
    // Открывает Яндекс.Карты в браузере для построения маршрута до заведения.
    buildRouteButton.addEventListener('click', () => {
        if (currentEstablishment) {
            const coords = currentEstablishment.coordinates.join(',');
            const url = `https://yandex.ru/maps/?rtext=~${coords}&rtt=auto`; // URL для построения маршрута
            TelegramWebApp.getWebApp().openLink(url); // Открываем ссылку через Telegram WebApp
        }
    });

    // Обработчик кнопки "Удалить заведение"
    // Показывает подтверждение пользователю, затем удаляет заведение через MapSystem
    // и обновляет профиль предпринимателя.
    deleteEstablishmentButton.addEventListener('click', () => {
        if (currentEstablishment) {
            TelegramWebApp.getWebApp().showConfirm(`Вы уверены, что хотите удалить заведение \"${currentEstablishment.name}\"?`, (confirmed) => {
                if (confirmed) {
                    const deleted = MapSystem.deleteEstablishment(currentEstablishment.id); // Удаляем из MapSystem
                    if (deleted) {
                        // Также нужно удалить заведение из списка предпринимателя
                        const currentUser = UserSystem.getProfile();
                        if (currentUser && currentUser.type === 'business') {
                            currentUser.establishments = currentUser.establishments.filter(e => e.id !== currentEstablishment.id);
                            UserSystem.updateProfileScreen(currentUser); // Обновляем UI профиля предпринимателя
                        }
                        TelegramWebApp.getWebApp().showAlert("Заведение успешно удалено!");
                        hideEstablishmentDetails(); // Скрываем модальное окно
                    } else {
                        TelegramWebApp.getWebApp().showAlert("Ошибка при удалении заведения.");
                    }
                }
            });
        }
    });

    // Обработчик кнопки "Добавить/Удалить из избранного"
    addToFavoritesButton.addEventListener('click', () => {
        if (currentEstablishment) {
            if (UserSystem.isFavoriteEstablishment(currentEstablishment.id)) {
                UserSystem.removeFavoriteEstablishment(currentEstablishment.id);
                addToFavoritesButton.innerText = '⭐ Добавить в избранное';
                addToFavoritesButton.classList.remove('active-favorite');
            } else {
                UserSystem.addFavoriteEstablishment(currentEstablishment.id);
                addToFavoritesButton.innerText = '⭐ Удалить из избранного';
                addToFavoritesButton.classList.add('active-favorite');
            }
            // Обновляем карту и экран избранных заведений
            MapSystem.applyFilters();
            UserSystem.updateProfileScreen(UserSystem.getProfile()); // Обновить экран избранных заведений
        }
    });

    // Закрытие модального окна по клику на кнопку закрытия (крестик)
    closeButton.addEventListener('click', hideEstablishmentDetails);

    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideEstablishmentDetails();
        }
    });

    return {
        showEstablishmentDetails,
        hideEstablishmentDetails
    };
})();

// ========================================================
// Модуль 6: Модальное окно выбора местоположения (LocationPickerModal)
// Описание: Предоставляет интерактивную карту в модальном окне для выбора
// конкретных координат. Используется в формах регистрации бизнеса и
// добавления/редактирования заведений.
// ========================================================
const LocationPickerModal = (() => {
    const modal = document.getElementById('location-picker-modal'); // Модальное окно выбора местоположения
    const closeButton = document.getElementById('close-location-picker'); // Кнопка закрытия модального окна
    const confirmButton = document.getElementById('confirm-location-button'); // Кнопка "Подтвердить"
    const cancelButton = document.getElementById('cancel-location-button'); // Кнопка "Отмена"
    const selectedCoordsDisplay = document.getElementById('selected-coords'); // Элемент для отображения выбранных координат
    const pickerMapContainer = document.getElementById('picker-map-container'); // Контейнер для карты внутри модального окна

    let pickerMap = null; // Экземпляр карты для выбора местоположения
    let pickerPlacemark = null; // Перетаскиваемая метка на карте
    let confirmCallback = null; // Callback-функция, вызываемая при подтверждении выбора

    /**
     * @function initPickerMap
     * @description Инициализирует новую карту Яндекс.Карт внутри модального окна выбора местоположения.
     * Размещает перетаскиваемую метку на указанных координатах и обновляет
     * отображение координат при ее перемещении.
     * @param {Array<number>} initialCoords - Начальные координаты для центрирования карты и размещения метки.
     */
    const initPickerMap = (initialCoords) => {
        if (pickerMap) {
            pickerMap.destroy(); // Уничтожаем предыдущую карту, если она была, для предотвращения утечек памяти
        }
        pickerMap = new ymaps.Map(pickerMapContainer, {
            center: initialCoords || [55.76, 37.64], // Дефолтный центр Москвы или переданные координаты
            zoom: 12, // Уровень зума
            controls: ['zoomControl', 'geolocationControl'] // Элементы управления
        });

        // Создаем перетаскиваемую метку
        pickerPlacemark = new ymaps.Placemark(pickerMap.getCenter(), {
            hintContent: 'Перетащите для выбора местоположения' // Подсказка при наведении
        }, {
            draggable: true, // Метка может быть перетаскиваемой
            preset: 'islands#blueDotIcon' // Пресет иконки
        });
        pickerMap.geoObjects.add(pickerPlacemark); // Добавляем метку на карту
        // Отображаем начальные координаты
        selectedCoordsDisplay.innerText = pickerPlacemark.geometry.getCoordinates().map(c => c.toFixed(6)).join(', ');

        // Обработчик события "dragend" (окончание перетаскивания метки)
        pickerPlacemark.events.add('dragend', () => {
            const coords = pickerPlacemark.geometry.getCoordinates();
            selectedCoordsDisplay.innerText = coords.map(c => c.toFixed(6)).join(', '); // Обновляем отображение координат
        });

        // Обработчик события "click" по карте
        pickerMap.events.add('click', (e) => {
            const coords = e.get('coords'); // Получаем координаты клика
            pickerPlacemark.geometry.setCoordinates(coords); // Перемещаем метку в точку клика
            selectedCoordsDisplay.innerText = coords.map(c => c.toFixed(6)).join(', '); // Обновляем отображение координат
        });
    };

    /**
     * @function show
     * @description Показывает модальное окно выбора местоположения и инициализирует карту.
     * @param {Array<number>} currentCoords - Координаты для начального центрирования карты.
     * @param {function(Array<number>): void} callback - Callback-функция, которая будет вызвана
     * с выбранными координатами при подтверждении выбора.
     */
    const show = (currentCoords, callback) => {
        confirmCallback = callback; // Сохраняем callback-функцию
        modal.classList.add('active'); // Показываем модальное окно
        TelegramWebApp.getWebApp().BackButton.show(); // Показываем кнопку "Назад" Telegram
        if (typeof ymaps === 'undefined') {
            // Подстрахуемся, если API ещё не подгружен
            const wait = () => (typeof ymaps === 'undefined') ? setTimeout(wait, 200) : ymaps.ready(() => initPickerMap(currentCoords));
            wait();
        } else {
            ymaps.ready(() => initPickerMap(currentCoords)); // Инициализируем карту после открытия модального окна
        }
    };

    /**
     * @function hide
     * @description Скрывает модальное окно выбора местоположения и уничтожает экземпляр карты.
     */
    const hide = () => {
        modal.classList.remove('active'); // Скрываем модальное окно
        if (pickerMap) {
            pickerMap.destroy(); // Уничтожаем карту, чтобы освободить ресурсы
            pickerMap = null;
        }
        TelegramWebApp.getWebApp().BackButton.hide(); // Скрываем кнопку "Назад" Telegram
    };

    // Обработчики событий для кнопок модального окна
    closeButton.addEventListener('click', hide); // Закрытие по крестику
    cancelButton.addEventListener('click', hide); // Закрытие по кнопке "Отмена"

    // Обработчик кнопки "Подтвердить"
    confirmButton.addEventListener('click', () => {
        if (pickerPlacemark && confirmCallback) {
            const coords = pickerPlacemark.geometry.getCoordinates(); // Получаем выбранные координаты
            confirmCallback(coords); // Вызываем callback с координатами
        }
        hide(); // Скрываем модальное окно
    });

    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hide();
        }
    });

    return {
        show,
        hide
    };
})();

// ========================================================
// Модуль 4: Навигация между Экранами и UI/UX
// Описание: Управляет переключением между различными экранами приложения,
// историей навигации для кнопки "Назад", а также обработкой событий
// для всех интерактивных элементов интерфейса (кнопок, форм, полей ввода).
// ========================================================
const Navigation = (() => {
    const screens = document.querySelectorAll('.app-screen'); // Все элементы экранов приложения
    const navButtons = document.querySelectorAll('.nav-button'); // Все кнопки нижней навигации
    let currentScreenId = 'main-map-screen'; // ID текущего активного экрана (по умолчанию - карта)
    const navigationHistory = []; // Стек для хранения истории переходов между экранами
    let isAddingOrEditing = false; // Флаг, указывающий, находится ли пользователь в процессе добавления/редактирования формы

    /**
     * @function goToScreen
     * @description Переключает активный экран приложения. Обрабатывает подтверждение
     * при наличии несохраненных изменений в формах, закрывает модальные окна,
     * обновляет историю навигации и UI кнопок.
     * @param {string} targetScreenId - ID экрана, на который нужно перейти.
     * @param {object|null} data - Опциональные данные для передачи на целевой экран (например, объект для редактирования).
     */
    const goToScreen = (targetScreenId, data = null) => {
        // Если открыто модальное окно выбора местоположения, закрываем его перед переходом
        if (document.getElementById('location-picker-modal').classList.contains('active')) {
            LocationPickerModal.hide();
        }
        // Проверка на несохраненные изменения в форме перед переходом
        if (isAddingOrEditing && !confirm("У вас есть несохраненные изменения. Вы уверены, что хотите уйти?")) {
            return; // Отменяем переход
        }
        isAddingOrEditing = false; // Сбрасываем флаг после обработки или отмены

        // Если модальное окно деталей заведения активно, закрываем его перед переходом
        if (document.getElementById('establishment-modal').classList.contains('active')) {
            ModalSystem.hideEstablishmentDetails();
            // Важно: не возвращаемся сразу, так как нам нужно продолжить навигацию после закрытия модального окна.
        }

        if (targetScreenId === currentScreenId) return; // Если уже на целевом экране, ничего не делаем

        // Добавляем текущий экран в историю навигации, если это не экран формы
        if (currentScreenId !== 'add-edit-establishment-screen' && currentScreenId !== 'edit-business-profile-screen' && currentScreenId !== 'business-registration-screen') {
            navigationHistory.push(currentScreenId);
        }
        currentScreenId = targetScreenId; // Обновляем ID текущего экрана

        // Скрываем все экраны и деактивируем все навигационные кнопки
        screens.forEach(screen => screen.classList.remove('active'));
        navButtons.forEach(btn => btn.classList.remove('active'));

        // Активируем целевой экран и соответствующую навигационную кнопку
        document.getElementById(targetScreenId).classList.add('active');
        const activeButton = document.querySelector(`.nav-button[data-target-screen="${targetScreenId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Дополнительная логика для конкретных экранов после перехода
        if (targetScreenId === 'main-map-screen') {
            if (window.myMap) {
                window.myMap.container.fitToViewport(); // Перерисовываем карту, чтобы она занимала всю доступную область
            }
            TelegramWebApp.getWebApp().BackButton.hide(); // Скрываем кнопку "Назад" на главном экране
        } else if (targetScreenId === 'business-profile-screen') {
            const profile = UserSystem.getProfile();
            if (profile) UserSystem.updateProfileScreen(profile); // Обновляем информацию профиля предпринимателя
            TelegramWebApp.getWebApp().BackButton.show(); // Показываем кнопку "Назад"
        } else if (targetScreenId === 'add-edit-establishment-screen') {
            prepareEstablishmentForm(data); // Подготавливаем форму для добавления/редактирования заведения
            TelegramWebApp.getWebApp().BackButton.show();
        } else if (targetScreenId === 'edit-business-profile-screen') {
            prepareEditProfileForm(); // Подготавливаем форму для редактирования профиля предпринимателя
            TelegramWebApp.getWebApp().BackButton.show();
        } else if (targetScreenId === 'business-registration-screen') {
             // Очищаем форму регистрации при переходе на нее
             document.querySelector('.registration-form').reset();
             document.getElementById('business-logo-preview').innerHTML = '';
             document.getElementById('business-location').value = '';
             // Очищаем данные ФНС при переходе на форму регистрации
             document.getElementById('inn-verification-status').style.display = 'none';
             document.getElementById('fns-company-data').style.display = 'none';
             document.getElementById('inn').value = ''; // Очищаем поле ИНН
             isAddingOrEditing = true; // Устанавливаем флаг, так как это форма, требующая сохранения
             TelegramWebApp.getWebApp().BackButton.show();
        }
        else if (targetScreenId === 'favorite-categories-screen') {
            const profile = UserSystem.getProfile();
            if (profile) UserSystem.updateProfileScreen(profile); // Обновляем информацию профиля (включая категории)
            TelegramWebApp.getWebApp().BackButton.show();
        }
        else if (targetScreenId === 'favorite-establishments-screen') {
            const profile = UserSystem.getProfile();
            if (profile) UserSystem.updateProfileScreen(profile); // Обновляем информацию профиля (включая избранное)
            TelegramWebApp.getWebApp().BackButton.show();
        }
        else {
            TelegramWebApp.getWebApp().BackButton.show();
        }

        console.log("Navigated to:", targetScreenId);
    };

    /**
     * @function goBack
     * @description Обрабатывает нажатие кнопки "Назад" (как системной Telegram, так и в приложении).
     * Закрывает открытые модальные окна, подтверждает несохраненные изменения в формах,
     * или возвращается на предыдущий экран из истории навигации. Если истории нет, закрывает Mini App.
     */
    const goBack = () => {
        // Если открыто модальное окно выбора местоположения, сначала закрываем его
        if (document.getElementById('location-picker-modal').classList.contains('active')) {
            LocationPickerModal.hide();
            return;
        }
        // Проверка на несохраненные изменения в форме перед возвратом
        if (isAddingOrEditing && !confirm("У вас есть несохраненные изменения. Вы уверены, что хотите уйти?")) {
            return; // Отменяем возврат
        }

        // Если модальное окно деталей заведения открыто, сначала закрываем его
        const modal = document.getElementById('establishment-modal');
        if (modal.classList.contains('active')) {
            ModalSystem.hideEstablishmentDetails();
            return; // Не делаем навигацию, просто закрыли модальное окно
        }

        // Если есть предыдущие экраны в истории, переходим на них
        if (navigationHistory.length > 0) {
            const prevScreenId = navigationHistory.pop(); // Получаем ID предыдущего экрана
            goToScreen(prevScreenId); // Переходим на предыдущий экран
        } else {
            TelegramWebApp.getWebApp().close(); // Если истории нет, закрываем Mini App
        }
    };

    /**
     * @function prepareEstablishmentForm
     * @description Подготавливает форму для добавления или редактирования заведения.
     * Сбрасывает форму, устанавливает текст кнопки сохранения и заполняет поля,
     * если передан объект существующего заведения для редактирования.
     * @param {object|null} establishment - Объект заведения для редактирования или null для нового.
     */
    const prepareEstablishmentForm = (establishment = null) => {
        isAddingOrEditing = true; // Устанавливаем флаг, что форма активна
        const form = document.querySelector('.establishment-form');
        form.reset(); // Сбрасываем все поля формы
        // Изменяем текст кнопки сохранения в зависимости от режима (добавление/редактирование)
        document.getElementById('save-establishment-button').innerText = establishment ? '✅ Сохранить изменения' : '✅ Добавить заведение';
        document.getElementById('est-photos-preview').innerHTML = ''; // Очищаем предпросмотр фото

        if (establishment) {
            // Если передан объект заведения, заполняем поля формы его данными
            form.dataset.editId = establishment.id; // Сохраняем ID заведения в data-атрибуте формы
            document.getElementById('est-name').value = establishment.name;
            document.getElementById('est-description').value = establishment.description;
            document.getElementById('est-category').value = establishment.category;
            document.getElementById('est-price-category').value = establishment.priceCategory || ''; // Ценовая категория
            document.getElementById('est-coords').value = establishment.coordinates.join(', ');
            document.getElementById('est-contact').value = establishment.contact;
            // Для фотографий: нужна более сложная логика предзагрузки и удаления существующих фото
            establishment.photos.forEach(photoUrl => {
                const img = document.createElement('img');
                img.src = photoUrl;
                document.getElementById('est-photos-preview').appendChild(img);
            });
        } else {
            delete form.dataset.editId; // Удаляем data-атрибут, если это новая запись
        }
    };

    /**
     * @function prepareEditProfileForm
     * @description Подготавливает форму для редактирования профиля предпринимателя.
     * Заполняет поля формы текущими данными из профиля пользователя.
     */
    const prepareEditProfileForm = () => {
        isAddingOrEditing = true; // Устанавливаем флаг, что форма активна
        const profile = UserSystem.getProfile(); // Получаем текущий профиль предпринимателя
        document.getElementById('edit-business-logo-preview').innerHTML = ''; // Очищаем предпросмотр лого

        if (profile) {
            // Заполняем поля формы данными из профиля
            document.getElementById('edit-business-name').value = profile.businessName || '';
            document.getElementById('edit-business-category').value = profile.businessCategory || ''; // Категория
            document.getElementById('edit-business-description').value = profile.businessDescription || ''; // Описание
            document.getElementById('edit-contact-person').value = profile.contactPerson || '';
            document.getElementById('edit-email').value = profile.email || '';
            document.getElementById('edit-business-location').value = profile.businessLocation ? profile.businessLocation.join(', ') : ''; // Местоположение
            if (profile.businessLogo) {
                const img = document.createElement('img');
                img.src = profile.businessLogo;
                document.getElementById('edit-business-logo-preview').appendChild(img);
            }
        }
    };

    /**
     * @function getCurrentScreenId
     * @description Возвращает ID текущего активного экрана.
     * @returns {string} ID текущего экрана.
     */
    const getCurrentScreenId = () => currentScreenId;

    /**
     * @function setupEventListeners
     * @description Настраивает все обработчики событий для интерактивных элементов UI:
     * навигационные кнопки, поисковую строку, кнопки фильтров, кнопку геолокации,
     * кнопки действий в профиле предпринимателя, формы регистрации/редактирования,
     * а также кнопки внутри модальных окон. Включает клиентскую валидацию форм и
     * предпросмотр загружаемых изображений.
     */
    const setupEventListeners = () => {
        // ====================================
        // ОБЩИЕ ОБРАБОТЧИКИ НАВИГАЦИИ
        // ====================================

        // Обработчики для навигационных кнопок в нижней панели
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetScreenId = e.currentTarget.dataset.targetScreen; // Получаем ID целевого экрана из data-атрибута
                if (targetScreenId) {
                    goToScreen(targetScreenId); // Переключаемся на выбранный экран
                }
            });
        });

        // Обработчик системной кнопки "Назад" Telegram WebApp
        TelegramWebApp.getWebApp().BackButton.onClick(goBack);

        // ====================================
        // ЭКРАН ПОЛЬЗОВАТЕЛЯ (main-map-screen)
        // ====================================

        // Поиск заведений: обновляет фильтры карты при вводе текста в поисковую строку
        document.getElementById('search-input').addEventListener('input', (e) => {
            const query = e.target.value;
            MapSystem.updateFilters({ search: query });
        });

        // Фильтрация по категориям: обновляет фильтры карты и активное состояние кнопок
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                // Снимаем активное состояние со всех кнопок фильтров
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                const current = e.currentTarget;
                current.classList.add('active'); // Устанавливаем активное состояние на текущую кнопку
                const category = current.dataset.category; // Получаем категорию из data-атрибута
                MapSystem.updateFilters({ category: category }); // Обновляем фильтры карты
            });
        });

        // Кнопка "Рядом со мной": вызывает функцию геолокации карты
        document.getElementById('geolocation-button').addEventListener('click', MapSystem.getUserGeolocation);

        // ============================================
        // ЭКРАН ПРЕДПРИНИМАТЕЛЯ (business-profile-screen)
        // ============================================

        // Кнопка "Редактировать профиль": переходит на экран редактирования профиля
        document.getElementById('edit-profile-button').addEventListener('click', () => {
            goToScreen('edit-business-profile-screen');
        });

        // Кнопка "Добавить заведение": переходит на форму добавления нового заведения
        document.getElementById('add-establishment-button').addEventListener('click', () => {
            goToScreen('add-edit-establishment-screen', null); // null означает добавление нового заведения
        });

        // Кнопка "Назад к карте" (выход из бизнес-режима): вызывает функцию выхода предпринимателя
        document.getElementById('back-to-map-button').addEventListener('click', () => {
            UserSystem.logoutBusiness(); // Выход из бизнес-режима
        });

        // Кнопка "Статистика": (пока только alert, в будущем - переход на экран статистики)
        document.getElementById('view-stats-button').addEventListener('click', () => {
            TelegramWebApp.getWebApp().showAlert("Функционал статистики в разработке!");
        });

        // Кнопка "Уведомления": (пока только alert, в будущем - переход на экран настроек уведомлений)
        document.getElementById('notification-settings-button').addEventListener('click', () => {
            TelegramWebApp.getWebApp().showAlert("Настройки уведомлений в разработке!");
        });

        // ====================================
        // ФОРМА РЕГИСТРАЦИИ ПРЕДПРИНИМАТЕЛЯ
        // ====================================

        // Обработчик отправки формы регистрации предпринимателя
        document.querySelector('.registration-form').addEventListener('submit', async (e) => {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            const businessName = document.getElementById('business-name').value.trim();
            const businessCategory = document.getElementById('business-category').value;
            const businessDescription = document.getElementById('business-description').value.trim();
            const contactPerson = document.getElementById('contact-person').value.trim();
            const email = document.getElementById('email').value.trim();
            const businessLogoInput = document.getElementById('business-logo');
            const businessLocationStr = document.getElementById('business-location').value.trim();

            // Клиентская валидация формы
            if (!businessName || !businessCategory || !contactPerson || !email || !businessLocationStr) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, заполните все обязательные поля формы.");
                return;
            }
            if (!validateEmail(email)) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, введите корректный Email.");
                return;
            }
            const businessLocation = businessLocationStr.split(',').map(c => parseFloat(c.trim()));
            if (businessLocation.length !== 2 || isNaN(businessLocation[0]) || isNaN(businessLocation[1])) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, выберите корректное местоположение на карте.");
                return;
            }

            let businessLogoUrl = '';
            if (businessLogoInput.files.length > 0) {
                businessLogoUrl = URL.createObjectURL(businessLogoInput.files[0]); // Имитация загрузки логотипа
            }

            TelegramWebApp.getWebApp().MainButton.showProgress(false); // Показываем индикатор загрузки
            // Создаем объект с данными для регистрации бизнеса
            const businessData = { businessName, businessCategory, businessDescription, contactPerson, email, businessLogo: businessLogoUrl, businessLocation };
            await UserSystem.registerBusiness(businessData); // Вызываем функцию регистрации
            TelegramWebApp.getWebApp().MainButton.hideProgress(); // Скрываем индикатор загрузки
            isAddingOrEditing = false; // Сбрасываем флаг после успешной отправки
        });

        // Кнопка "Выбрать на карте" для регистрации бизнеса: открывает модальное окно выбора местоположения
        document.getElementById('select-location-on-map').addEventListener('click', () => {
            const currentCoordsStr = document.getElementById('business-location').value;
            const currentCoords = currentCoordsStr ? currentCoordsStr.split(',').map(c => parseFloat(c.trim())) : null;
            LocationPickerModal.show(currentCoords, (selectedCoords) => {
                document.getElementById('business-location').value = selectedCoords.map(c => c.toFixed(6)).join(', ');
            });
        });

        // Предпросмотр логотипа для регистрации бизнеса
        document.getElementById('business-logo').addEventListener('change', (e) => {
            const previewContainer = document.getElementById('business-logo-preview');
            previewContainer.innerHTML = ''; // Очищаем предыдущий предпросмотр
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file); // Читаем файл как URL данных
            }
        });

        // ================================================
        // ФОРМА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ ЗАВЕДЕНИЯ
        // ================================================

        // Обработчик отправки формы добавления/редактирования заведения
        document.querySelector('.establishment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const establishmentId = form.dataset.editId; // Получаем ID заведения, если это режим редактирования

            const name = document.getElementById('est-name').value.trim();
            const description = document.getElementById('est-description').value.trim();
            const category = document.getElementById('est-category').value;
            const priceCategory = document.getElementById('est-price-category').value;
            const coordsStr = document.getElementById('est-coords').value.trim();
            const contact = document.getElementById('est-contact').value.trim();
            const photosInput = document.getElementById('est-photos');

            // Клиентская валидация формы
            if (!name || !category || !coordsStr) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, заполните обязательные поля: Название, Категория, Координаты.");
                return;
            }

            const coords = coordsStr.split(',').map(c => parseFloat(c.trim()));
            if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, введите корректные координаты (например: 55.75, 37.62).");
                return;
            }

            // Имитация загрузки фото (в реальном приложении это будет загрузка на сервер)
            const photoUrls = [];
            for (const file of photosInput.files) {
                photoUrls.push(URL.createObjectURL(file));
            }
            // Если есть уже существующие фото, их тоже нужно учитывать.
            // Здесь упрощенно: только новые фото.

            // Создаем объект с данными заведения
            const establishmentData = {
                id: establishmentId, // Будет null, если это новое заведение
                name,
                description,
                category,
                priceCategory,
                coordinates: coords,
                contact,
                photos: photoUrls,
                rating: 0, // Новое заведение начинается с 0 рейтинга
                reviews: []
            };

            TelegramWebApp.getWebApp().MainButton.showProgress(false);
            let success = false;
            if (establishmentId) {
                // Режим редактирования
                success = MapSystem.updateEstablishment(establishmentData);
            } else {
                // Режим добавления
                const newEst = MapSystem.addEstablishment(establishmentData);
                // Добавить новое заведение в список предпринимателя
                const currentUser = UserSystem.getProfile();
                if (currentUser && currentUser.type === 'business') {
                    currentUser.establishments.push({ id: newEst.id, name: newEst.name });
                    UserSystem.updateProfileScreen(currentUser); // Обновляем UI профиля
                }
                success = true;
            }
            TelegramWebApp.getWebApp().MainButton.hideProgress();

            if (success) {
                TelegramWebApp.getWebApp().showAlert("Заведение успешно сохранено!");
                goToScreen('business-profile-screen'); // Возвращаемся в профиль предпринимателя
            } else {
                TelegramWebApp.getWebApp().showAlert("Ошибка при сохранении заведения.");
            }
            isAddingOrEditing = false; // Сбрасываем флаг после успешной отправки
        });

        // Кнопка "Отмена" для формы заведения: возвращает в профиль предпринимателя
        document.getElementById('cancel-establishment-button').addEventListener('click', () => {
            goToScreen('business-profile-screen');
        });

        // Кнопка "Получить текущие координаты" для формы заведения: использует Geolocation API браузера
        document.getElementById('get-current-coords').addEventListener('click', async () => {
            TelegramWebApp.getWebApp().showAlert("Получение координат...");
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
                });
                const { latitude, longitude } = position.coords;
                document.getElementById('est-coords').value = `${latitude}, ${longitude}`;
                TelegramWebApp.getWebApp().showAlert("Координаты получены!");
            } catch (error) {
                console.error("Ошибка при получении текущих координат:", error);
                TelegramWebApp.getWebApp().showAlert("Не удалось получить текущие координаты.");
            }
        });

        // Предпросмотр фотографий для заведения
        document.getElementById('est-photos').addEventListener('change', (e) => {
            const previewContainer = document.getElementById('est-photos-preview');
            previewContainer.innerHTML = ''; // Очищаем предыдущий предпросмотр
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });

        // ================================================
        // ФОРМА РЕДАКТИРОВАНИЯ ПРОФИЛЯ ПРЕДПРИНИМАТЕЛЯ
        // ================================================

        // Обработчик отправки формы редактирования профиля предпринимателя
        document.querySelector('.edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const businessName = document.getElementById('edit-business-name').value.trim();
            const businessCategory = document.getElementById('edit-business-category').value;
            const businessDescription = document.getElementById('edit-business-description').value.trim();
            const contactPerson = document.getElementById('edit-contact-person').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const businessLogoInput = document.getElementById('edit-business-logo');
            const businessLocationStr = document.getElementById('edit-business-location').value.trim();

            // Клиентская валидация формы
            if (!businessName || !businessCategory || !contactPerson || !email || !businessLocationStr) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, заполните все обязательные поля формы.");
                return;
            }
            if (!validateEmail(email)) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, введите корректный Email.");
                return;
            }
            const businessLocation = businessLocationStr.split(',').map(c => parseFloat(c.trim()));
            if (businessLocation.length !== 2 || isNaN(businessLocation[0]) || isNaN(businessLocation[1])) {
                TelegramWebApp.getWebApp().showAlert("Пожалуйста, выберите корректное местоположение на карте.");
                return;
            }

            // Сохраняем старый логотип, если новый не выбран, иначе имитируем загрузку нового
            let businessLogoUrl = UserSystem.getProfile().businessLogo || '';
            if (businessLogoInput.files.length > 0) {
                businessLogoUrl = URL.createObjectURL(businessLogoInput.files[0]);
            }

            TelegramWebApp.getWebApp().MainButton.showProgress(false);
            // Обновляем профиль предпринимателя
            await UserSystem.updateBusinessProfile({ businessName, businessCategory, businessDescription, contactPerson, email, businessLogo: businessLogoUrl, businessLocation });
            TelegramWebApp.getWebApp().MainButton.hideProgress();
            isAddingOrEditing = false; // Сбрасываем флаг после успешной отправки
        });

        // Кнопка "Отмена" для формы редактирования профиля: возвращает в профиль предпринимателя
        document.getElementById('cancel-edit-profile-button').addEventListener('click', () => {
            goToScreen('business-profile-screen');
        });

        // Кнопка "Выбрать на карте" для редактирования профиля бизнеса: открывает модальное окно выбора местоположения
        document.getElementById('select-edit-business-location-on-map').addEventListener('click', () => {
            const currentCoordsStr = document.getElementById('edit-business-location').value;
            const currentCoords = currentCoordsStr ? currentCoordsStr.split(',').map(c => parseFloat(c.trim())) : null;
            LocationPickerModal.show(currentCoords, (selectedCoords) => {
                document.getElementById('edit-business-location').value = selectedCoords.map(c => c.toFixed(6)).join(', ');
            });
        });

        // Предпросмотр логотипа для редактирования профиля бизнеса
        document.getElementById('edit-business-logo').addEventListener('change', (e) => {
            const previewContainer = document.getElementById('edit-business-logo-preview');
            previewContainer.innerHTML = '';
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });

        // ====================================
        // ЭКРАН ВХОДА В БИЗНЕС-РЕЖИМ
        // ====================================
        document.getElementById('login-business-button').addEventListener('click', () => {
            UserSystem.loginBusiness(); // Вызов функции входа предпринимателя
        });

        // ====================================
        // ОБРАБОТЧИКИ ДЛЯ ВЕРИФИКАЦИИ ИНН
        // ====================================
        const innInput = document.getElementById('inn');
        const verifyInnButton = document.getElementById('verify-inn-button');
        const innVerificationStatusElement = document.getElementById('inn-verification-status');
        const fnsCompanyDataElement = document.getElementById('fns-company-data');

        verifyInnButton.addEventListener('click', async () => {
            const inn = innInput.value.trim();
            if (!inn) {
                TelegramWebApp.getWebApp().showAlert('Пожалуйста, введите ИНН для проверки.');
                return;
            }
            if (!/^\d{10}$|^\d{12}$/.test(inn)) {
                TelegramWebApp.getWebApp().showAlert('Некорректный формат ИНН. ИНН должен состоять из 10 или 12 цифр.');
                return;
            }

            TelegramWebApp.getWebApp().MainButton.showProgress(false);
            const result = await UserSystem.verifyInn(inn, innVerificationStatusElement, fnsCompanyDataElement);
            TelegramWebApp.getWebApp().MainButton.hideProgress();

            if (result && result.status === 'success') {
               fnsCompanyDataElement.dataset.isVerified = 'true';
               fnsCompanyDataElement.dataset.fnsData = JSON.stringify(result.company);
            } else {
               fnsCompanyDataElement.dataset.isVerified = 'false';
               fnsCompanyDataElement.dataset.fnsData = '';
            }
        });

        // Очистка статуса при изменении ИНН
        innInput.addEventListener('input', () => {
           innVerificationStatusElement.style.display = 'none';
           fnsCompanyDataElement.style.display = 'none';
           fnsCompanyDataElement.dataset.isVerified = 'false';
           fnsCompanyDataElement.dataset.fnsData = '';
        });

         // ====================================
         // ЭКРАН ВХОДА В БИЗНЕС-РЕЖИМ
         // ====================================
         document.getElementById('login-business-button').addEventListener('click', () => {
             UserSystem.loginBusiness(); // Вызов функции входа предпринимателя
         });

    };

    /**
     * @function validateEmail
     * @description Вспомогательная функция для клиентской валидации формата Email.
     * @param {string} email - Строка с Email для проверки.
     * @returns {boolean} True, если Email соответствует формату, иначе false.
     */
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    return {
        goToScreen,
        goBack,
        setupEventListeners,
        getCurrentScreenId
    };
})();

// ========================================================
// Модуль 7: Система Персональных Рекомендаций (Placeholder)
// Описание: В будущем будет предоставлять персонализированные рекомендации
// заведений на основе любимых категорий, избранного и истории пользователя.
// Сейчас это заглушка для демонстрации структуры.
// ========================================================
const RecommendationSystem = (() => {
    /**
     * @function getRecommendations
     * @description Возвращает список рекомендованных заведений для текущего пользователя.
     * В текущей реализации возвращает моковые данные.
     * @returns {Array<object>} Массив рекомендованных заведений.
     */
    const getRecommendations = () => {
        const currentUser = UserSystem.getProfile();
        if (!currentUser) return [];

        console.log("Generating recommendations for user:", currentUser);
        // TODO: Реализовать логику персонализированных рекомендаций на основе:
        // - UserSystem.getFavoriteCategories()
        // - UserSystem.getFavoriteEstablishments()
        // - Истории посещений/взаимодействий пользователя (будет реализовано позднее)

        // Моковые рекомендации
        return [
            { id: 'rec1', name: 'Рекомендованное Кафе', description: 'Популярное место рядом с вами.' },
            { id: 'rec2', name: 'Новый Ресторан', description: 'Откройте для себя что-то новое!' }
        ];
    };

    return {
        getRecommendations
    };
})();

// ========================================================
// Модуль: NotificationSystem - Управление push-уведомлениями
// Описание: Отвечает за подписку/отписку от уведомлений и управление
// модальным окном настроек уведомлений.
// ========================================================
const NotificationSystem = (() => {
    const notificationSettingsModal = document.getElementById('notification-settings-modal');
    const closeNotificationSettingsButton = document.getElementById('close-notification-settings');
    const closeNotificationSettingsModalButton = document.getElementById('close-notification-settings-button');
    const notificationToggle = document.getElementById('notification-toggle');
    const notificationStatusMessage = document.getElementById('notification-status-message');
    const notificationSettingsOpenButton = document.getElementById('notification-settings-button');

    // Функция для отправки запроса на подписку
    async function subscribeToNotifications(userId) {
        try {
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (data.success) {
                console.log('Подписка на уведомления успешна:', data.message);
                notificationStatusMessage.textContent = 'Вы подписаны на уведомления.';
            } else {
                console.error('Ошибка подписки на уведомления:', data.message);
                notificationStatusMessage.textContent = 'Ошибка при подписке на уведомления.';
            }
        } catch (error) {
            console.error('Ошибка сети при подписке:', error);
            notificationStatusMessage.textContent = 'Ошибка сети. Попробуйте позже.';
        }
        updateToggleButton();
    }

    // Функция для отправки запроса на отписку
    async function unsubscribeFromNotifications(userId) {
        try {
            const response = await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (data.success) {
                console.log('Отписка от уведомлений успешна:', data.message);
                notificationStatusMessage.textContent = 'Вы отписаны от уведомлений.';
            } else {
                console.error('Ошибка отписки от уведомлений:', data.message);
                notificationStatusMessage.textContent = 'Ошибка при отписке от уведомлений.';
            }
        } catch (error) {
            console.error('Ошибка сети при отписке:', error);
            notificationStatusMessage.textContent = 'Ошибка сети. Попробуйте позже.';
        }
        updateToggleButton();
    }

    // Функция для проверки статуса подписки
    async function checkNotificationStatus(userId) {
        try {
            const response = await fetch(`/api/notifications/status?userId=${userId}`);
            const data = await response.json();
            return data.subscribed;
        } catch (error) {
            console.error('Ошибка проверки статуса уведомлений:', error);
            return false;
        }
    }

    // Обновление состояния переключателя и сообщения
    async function updateToggleButton() {
        const currentUser = UserSystem.getCurrentUser();
        if (currentUser && currentUser.id) {
            const isSubscribed = await checkNotificationStatus(currentUser.id);
            notificationToggle.checked = isSubscribed;
            notificationToggle.disabled = false; // Разблокировать переключатель
            notificationStatusMessage.textContent = isSubscribed ? 'Вы подписаны на уведомления.' : 'Вы не подписаны на уведомления.';
        } else {
            notificationToggle.checked = false;
            notificationStatusMessage.textContent = 'Войдите, чтобы управлять уведомлениями.';
            notificationToggle.disabled = true; // Заблокировать переключатель, если пользователь не авторизован
        }
    }

    // Настройка модального окна уведомлений
    const setupNotificationModal = () => {
        if (notificationSettingsOpenButton) {
            notificationSettingsOpenButton.addEventListener('click', async () => {
                notificationSettingsModal.classList.add('active');
                await updateToggleButton(); // Обновить состояние при открытии
            });
        }

        if (closeNotificationSettingsButton) {
            closeNotificationSettingsButton.addEventListener('click', () => {
                notificationSettingsModal.classList.remove('active');
            });
        }

        if (closeNotificationSettingsModalButton) {
            closeNotificationSettingsModalButton.addEventListener('click', () => {
                notificationSettingsModal.classList.remove('active');
            });
        }

        if (notificationToggle) {
            notificationToggle.addEventListener('change', async (e) => {
                const currentUser = UserSystem.getCurrentUser();
                if (!currentUser || !currentUser.id) {
                    console.warn('Пользователь не авторизован для изменения настроек уведомлений.');
                    e.target.checked = false; // Откатить изменение, если нет пользователя
                    notificationStatusMessage.textContent = 'Войдите, чтобы управлять уведомлениями.';
                    return;
                }

                if (e.target.checked) {
                    await subscribeToNotifications(currentUser.id);
                } else {
                    await unsubscribeFromNotifications(currentUser.id);
                }
            });
        }
    };

    const init = () => {
        setupNotificationModal();
    };

    return {
        init,
        subscribeToNotifications,
        unsubscribeFromNotifications,
        checkNotificationStatus
    };
})();

// ========================================================
// Главная инициализация приложения
// Описание: Точка входа в приложение. Выполняет начальную инициализацию
// всех модулей после полной загрузки DOM.
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    TelegramWebApp.init(); // Инициализация Telegram WebApp
    UserSystem.init(); // Инициализация системы пользователей
    MapSystem.initMap(); // Инициализация системы карты
    Navigation.setupEventListeners(); // Настройка всех обработчиков событий
    NotificationSystem.init(); // Инициализация системы уведомлений

    // Активируем экран карты по умолчанию при загрузке приложения
    Navigation.goToScreen('main-map-screen');

    // Пример: при изменении темы Telegram обновляем карту (если необходимо)
    TelegramWebApp.getWebApp().onEvent('themeChanged', () => {
        if (window.myMap) {
            // Здесь можно добавить логику для переключения стилей карты
            // или перерисовки элементов, если они зависят от темы.
            console.log("Theme changed, map might need update.");
        }
    });

    // Пример использования системы рекомендаций (в будущем можно отображать на отдельном экране)
    const recommendations = RecommendationSystem.getRecommendations();
    if (recommendations.length > 0) {
        console.log("Рекомендованные заведения:", recommendations);
    }
});
