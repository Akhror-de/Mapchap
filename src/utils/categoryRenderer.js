export const categories = [
  {
    id: "auto_services",
    name: "Автоуслуги",
    icon: "🚗",
    color: "#FF6B35",
    subcategories: [
      { id: "car_repair", name: "Автосервисы", icon: "🔧" },
      { id: "car_wash", name: "Автомойки", icon: "💦" },
      { id: "tire_fitting", name: "Шиномонтажи", icon: "⚙️" },
      { id: "auto_parts", name: "Автозапчасти", icon: "🔩" },
      { id: "car_dismantling", name: "Авторазборки", icon: "♻️" }
    ]
  },
  {
    id: "medicine_health",
    name: "Медицина и здоровье",
    icon: "🏥",
    color: "#4CAF50",
    subcategories: [
      { id: "medical_centers", name: "Медицинские центры", icon: "⚕️" },
      { id: "dentistry", name: "Стоматологии", icon: "🦷" },
      { id: "pharmacies", name: "Аптеки", icon: "💊" },
      { id: "vet_clinics", name: "Ветеринарные клиники", icon: "🐾" },
      { id: "optics", name: "Оптики", icon: "👓" }
    ]
  },
  {
    id: "shopping_stores",
    name: "Торговля и магазины",
    icon: "🛍️",
    color: "#FFC107",
    subcategories: [
      { id: "grocery_stores", name: "Продуктовые магазины", icon: "🍎" },
      { id: "clothing_shoes", name: "Одежда и обувь", icon: "👕" },
      { id: "electronics", name: "Электроника и техника", icon: "📱" },
      { id: "building_materials", name: "Строительные магазины", icon: "🏗️" },
      { id: "flower_shops", name: "Цветочные магазины", icon: "💐" }
    ]
  },
  {
    id: "public_catering",
    name: "Общественное питание",
    icon: "🍽️",
    color: "#FF5722",
    subcategories: [
      { id: "coffee_shops", name: "Кофейни", icon: "☕" },
      { id: "restaurants", name: "Рестораны", icon: "🍝" },
      { id: "bars_pubs", name: "Бары и пабы", icon: "🍻" },
      { id: "fast_food", name: "Фастфуд", icon: "🍔" },
      { id: "confectioneries", name: "Кондитерские", icon: "🍰" }
    ]
  },
  {
    id: "services_household",
    name: "Услуги и быт",
    icon: "🏠",
    color: "#607D8B",
    subcategories: [
      { id: "beauty_salons", name: "Салоны красоты", icon: "💅" },
      { id: "dry_cleaning", name: "Химчистки", icon: "👕" },
      { id: "appliance_repair", name: "Ремонт техники", icon: "🔌" },
      { id: "laundries", name: "Прачечные", icon: "🧺" },
      { id: "photo_services", name: "Фотоуслуги", icon: "📸" }
    ]
  },
  {
    id: "entertainment_leisure",
    name: "Развлечения и отдых",
    icon: "🎉",
    color: "#9C27B0",
    subcategories: [
      { id: "cinemas", name: "Кинотеатры", icon: "🎬" },
      { id: "gyms", name: "Спортивные залы", icon: "🏋️" },
      { id: "swimming_pools", name: "Бассейны", icon: "🏊" },
      { id: "libraries", name: "Библиотеки", icon: "📚" },
      { id: "amusement_parks", name: "Парки развлечений", icon: "🎡" }
    ]
  }
];

export function renderCategorySelection(containerId, profile, addFavoriteCategory, removeFavoriteCategory, applyMapFilters) {
    const favoriteCategoriesContainer = document.getElementById(containerId);
    if (!favoriteCategoriesContainer) return;

    favoriteCategoriesContainer.innerHTML = ''; // Очищаем

    categories.forEach(category => {
        // Основная категория
        const mainCategoryDiv = document.createElement('div');
        mainCategoryDiv.classList.add('main-category-item');
        mainCategoryDiv.innerHTML = `
            <h3>${category.icon} ${category.name}</h3>
        `;
        favoriteCategoriesContainer.appendChild(mainCategoryDiv);

        // Подкатегории
        const subcategoriesGrid = document.createElement('div');
        subcategoriesGrid.classList.add('subcategory-grid');
        mainCategoryDiv.appendChild(subcategoriesGrid);

        category.subcategories.forEach(subcategory => {
            const subcategoryDiv = document.createElement('div');
            subcategoryDiv.classList.add('category-item');
            subcategoryDiv.innerHTML = `
                <input type="checkbox" id="fav-cat-${subcategory.id}" value="${subcategory.id}" ${profile.favoriteCategories && profile.favoriteCategories.includes(subcategory.id) ? 'checked' : ''}>
                <label for="fav-cat-${subcategory.id}">${subcategory.icon} ${subcategory.name}</label>
            `;
            subcategoryDiv.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    addFavoriteCategory(subcategory.id);
                } else {
                    removeFavoriteCategory(subcategory.id);
                }
                applyMapFilters();
            });
            subcategoriesGrid.appendChild(subcategoryDiv);
        });
    });
}

