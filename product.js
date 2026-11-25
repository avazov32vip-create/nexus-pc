
const products = window.NEXUS_PRODUCTS || [];

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

const product = products.find(item => item.id === productId);

const productImage = document.getElementById("productImage");
const productCategory = document.getElementById("productCategory");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productSpecs = document.getElementById("productSpecs");
const addButton = document.getElementById("addProductToCart");

function formatPrice(price) {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

function showProduct() {
    if (!product) {
        document.querySelector(".product-detail").innerHTML = `
            <div class="product-not-found">
                <h1>Товар не найден</h1>
                <p>Возможно, такой товар не существует.</p>
                <a href="index.html#catalog" class="btn btn-primary">
                    Вернуться в каталог
                </a>
            </div>
        `;

        document.title = "Товар не найден — NEXUS PC";
        return;
    }

    document.title = product.name + " — NEXUS PC";

    productImage.src = product.image;
    productImage.alt = product.name;

    productCategory.textContent = product.categoryName;
    productName.textContent = product.name;
    productDescription.textContent = product.description;
    productPrice.textContent = formatPrice(product.price);

    productSpecs.innerHTML = product.specs
        .map(spec => `<div class="product-spec-item">${spec}</div>`)
        .join("");
}

function addProductToCart() {
    if (!product) return;

    let cart = [];

    try {
        const savedCart = JSON.parse(localStorage.getItem("nexusCart")) || [];

        if (Array.isArray(savedCart)) {
            cart = savedCart
                .map(item => {
                    if (typeof item === "number") {
                        return { id: item, quantity: 1 };
                    }

                    if (item && typeof item === "object") {
                        return {
                            id: Number(item.id),
                            quantity: Math.max(1, Number(item.quantity) || 1)
                        };
                    }

                    return null;
                })
                .filter(item => item && products.some(p => p.id === item.id));
        }
    } catch (error) {
        console.error("Не удалось прочитать корзину:", error);
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            quantity: 1
        });
    }

    localStorage.setItem("nexusCart", JSON.stringify(cart));

    addButton.textContent = "Добавлено в корзину ✓";

    setTimeout(() => {
        addButton.textContent = "Добавить в корзину";
    }, 1500);
}

if (addButton) {
    addButton.addEventListener("click", addProductToCart);
}

showProduct();
