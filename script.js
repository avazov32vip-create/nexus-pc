
/* =========================================
   NEXUS PC BLACK — STORE ENGINE
========================================= */

// КАТАЛОГ ТОВАРОВ

const products = window.NEXUS_PRODUCTS;

// СОСТОЯНИЕ МАГАЗИНА

let cart = loadCart();
let currentSort = "default";

// ЭЛЕМЕНТЫ СТРАНИЦЫ

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const cartCount = document.getElementById("cartCount");
const cartButton = document.getElementById("cartButton");

const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");


// ЗАГРУЗКА КОРЗИНЫ

function loadCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem("nexusCart") || "[]"
        );

        if (!Array.isArray(savedCart)) return [];

        return savedCart
            .map(savedProduct => {
                const originalProduct = products.find(
                    product => product.id === Number(savedProduct.id)
                );

                if (!originalProduct) return null;

                const quantity = Math.floor(Number(savedProduct.quantity));

                if (!Number.isFinite(quantity) || quantity < 1) {
                    return null;
                }

                return {
                    ...originalProduct,
                    quantity
                };
            })
            .filter(Boolean);

    } catch (error) {
        console.error("Ошибка загрузки корзины:", error);
        return [];
    }
}


// ФОРМАТИРОВАНИЕ ЦЕНЫ

function formatPrice(price) {
    return price.toLocaleString("ru-RU") + " ₽";
}


// СОЗДАНИЕ ПАНЕЛИ СОРТИРОВКИ

function createCatalogControls() {
    const toolbar = document.querySelector(".catalog-toolbar");

    if (!toolbar) return;

    const sortFilter = document.createElement("select");

    sortFilter.id = "sortFilter";

    sortFilter.innerHTML = `
        <option value="default">Сначала рекомендуемые</option>
        <option value="cheap">Сначала дешевле</option>
        <option value="expensive">Сначала дороже</option>
        <option value="name">По названию</option>
    `;

    toolbar.appendChild(sortFilter);

    sortFilter.addEventListener("change", () => {
        currentSort = sortFilter.value;
        renderProducts();
    });

    const counter = document.createElement("div");

    counter.id = "productCount";
    counter.className = "product-count";

    toolbar.insertAdjacentElement("afterend", counter);
}


// ПОЛУЧЕНИЕ ОТСОРТИРОВАННЫХ ТОВАРОВ

function getFilteredProducts() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    let result = products.filter(product => {
        const searchableText = [
            product.name,
            product.categoryName,
            product.description,
            ...product.specs
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (currentSort === "cheap") {
        result.sort((a, b) => a.price - b.price);
    }

    if (currentSort === "expensive") {
        result.sort((a, b) => b.price - a.price);
    }

    if (currentSort === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    }

    return result;
}


// ОТОБРАЖЕНИЕ КАТАЛОГА

function renderProducts() {
    const filteredProducts = getFilteredProducts();

    const productCount = document.getElementById("productCount");

    if (productCount) {
        productCount.textContent =
            `НАЙДЕНО ТОВАРОВ: ${filteredProducts.length}`;
    }

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-products">
                <h3>ТОВАРЫ НЕ НАЙДЕНЫ</h3>
                <p>Попробуй изменить поисковый запрос или категорию.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <article class="product-card">

            <div class="product-image-wrap">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >
                <span class="product-badge">
                    ${product.categoryName}
                </span>
            </div>

            <div class="product-info">

                <div class="product-specs">
                    ${product.specs.map(spec => `
                        <span>${spec}</span>
                    `).join("")}
                </div>

                <h3>${product.name}</h3>

                <p class="product-description">
                    ${product.description}
                </p>
                <a
    class="product-details-link"
    href="product.html?id=${product.id}"
>
    ПОДРОБНЕЕ ↗
</a>

                <div class="product-bottom">

                    <div class="product-price-block">
                        <span>СТОИМОСТЬ</span>
                        <strong class="price">
                            ${formatPrice(product.price)}
                        </strong>
                    </div>

                    <button
                        class="add-button"
                        data-product-id="${product.id}"
                    >
                        В КОРЗИНУ +
                    </button>

                </div>

            </div>
        </article>
    `).join("");
}


// ОБНОВЛЕНИЕ КОРЗИНЫ

function updateCart() {
    const totalQuantity = cart.reduce(
        (total, product) => total + product.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, product) =>
            total + product.price * product.quantity,
        0
    );

    cartCount.textContent = totalQuantity;

    cartTotal.textContent = formatPrice(totalPrice);

    localStorage.setItem(
        "nexusCart",
        JSON.stringify(cart)
    );

    renderCart();
}


// ОТОБРАЖЕНИЕ КОРЗИНЫ

function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>ВАША КОРЗИНА ПОКА ПУСТА</p>
                <p>Добавь товары из каталога.</p>
            </div>
        `;

        return;
    }

    cartItems.innerHTML = cart.map(product => `
        <div class="cart-item">

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="cart-item-info">

                <h3>${product.name}</h3>

                <div class="cart-item-price">
                    ${formatPrice(product.price * product.quantity)}
                </div>

                <div class="cart-controls">

                    <button
                        data-action="decrease"
                        data-id="${product.id}"
                        aria-label="Уменьшить количество"
                    >−</button>

                    <span>${product.quantity}</span>

                    <button
                        data-action="increase"
                        data-id="${product.id}"
                        aria-label="Увеличить количество"
                    >+</button>

                    <button
                        class="remove-item"
                        data-action="remove"
                        data-id="${product.id}"
                        aria-label="Удалить товар"
                    >×</button>

                </div>

            </div>

        </div>
    `).join("");
}


// ДОБАВЛЕНИЕ ТОВАРА

function addToCart(productId) {
    const existingProduct = cart.find(
        product => product.id === productId
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        const product = products.find(
            product => product.id === productId
        );

        if (!product) return;

        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
}


// ОТКРЫТИЕ И ЗАКРЫТИЕ КОРЗИНЫ

function openCart() {
    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
}

function closeCart() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
}


// ОБРАБОТКА ДОБАВЛЕНИЯ ТОВАРОВ

productsGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-product-id]");

    if (!button) return;

    const productId = Number(button.dataset.productId);

    addToCart(productId);

    const originalText = button.textContent;

    button.textContent = "ДОБАВЛЕНО ✓";
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 900);
});


// УПРАВЛЕНИЕ КОЛИЧЕСТВОМ В КОРЗИНЕ

cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const productId = Number(button.dataset.id);
    const action = button.dataset.action;

    const product = cart.find(
        item => item.id === productId
    );

    if (!product) return;

    if (action === "increase") {
        product.quantity++;
    }

    if (action === "decrease") {
        product.quantity--;

        if (product.quantity <= 0) {
            cart = cart.filter(
                item => item.id !== productId
            );
        }
    }

    if (action === "remove") {
        cart = cart.filter(
            item => item.id !== productId
        );
    }

    updateCart();
});


// КНОПКА КОРЗИНЫ

cartButton.addEventListener("click", openCart);

document.getElementById("closeCart")
    .addEventListener("click", closeCart);

cartOverlay.addEventListener("click", closeCart);


// ОЧИСТКА КОРЗИНЫ

document.getElementById("clearCart")
    .addEventListener("click", () => {
        cart = [];
        updateCart();
    });


// ОФОРМЛЕНИЕ ЗАКАЗА

document.getElementById("checkoutButton")
    .addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Сначала добавьте товары в корзину.");
            return;
        }

        window.location.href = "checkout.html";
    });


// ПОИСК И ФИЛЬТРАЦИЯ

searchInput.addEventListener("input", renderProducts);

categoryFilter.addEventListener("change", renderProducts);


// КОНТАКТНАЯ ФОРМА

document.getElementById("contactForm")
    .addEventListener("submit", event => {
        event.preventDefault();

        alert(
            "Спасибо! Это демонстрационная форма — отправка пока не подключена."
        );

        event.target.reset();
    });


// ЗАКРЫТИЕ КОРЗИНЫ ПО ESC

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCart();
    }
});


// ЗАПУСК МАГАЗИНА

createCatalogControls();
renderProducts();

updateCart();
