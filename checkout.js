
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutForm = document.getElementById("checkoutForm");
const orderSuccess = document.getElementById("orderSuccess");

let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem("nexusCart") || "[]"
    );

    if (Array.isArray(savedCart)) {
        cart = savedCart.filter(product =>
            product &&
            product.name &&
            Number(product.price) >= 0 &&
            Number(product.quantity) > 0
        );
    }
} catch (error) {
    console.error("Ошибка загрузки корзины:", error);
}

function formatPrice(price) {
    return Number(price).toLocaleString("ru-RU") + " ₽";
}

function renderCheckout() {
    orderSuccess.hidden = true;

    if (cart.length === 0) {
        checkoutItems.innerHTML = `
            <div class="checkout-empty">
                <p>Ваша корзина пока пуста.</p>
                <a href="index.html#catalog">Вернуться в магазин →</a>
            </div>
        `;

        checkoutTotal.textContent = "0 ₽";
        checkoutForm.querySelector("button").disabled = true;
        return;
    }

    checkoutForm.querySelector("button").disabled = false;

    checkoutItems.innerHTML = cart.map(product => `
        <div class="checkout-item">
            <div class="checkout-item-name">
                <span>${product.name}</span>
                <small>Количество: ${product.quantity}</small>
            </div>

            <strong>
                ${formatPrice(product.price * product.quantity)}
            </strong>
        </div>
    `).join("");

    const total = cart.reduce(
        (sum, product) =>
            sum + Number(product.price) * Number(product.quantity),
        0
    );

    checkoutTotal.textContent = formatPrice(total);
}

checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Ваша корзина пуста.");
        return;
    }

    if (!checkoutForm.reportValidity()) {
        return;
    }

    const orderNumber =
        "NX-" + Date.now().toString().slice(-8);

    document.getElementById("orderNumber").textContent =
        "Номер демонстрационного заказа: " + orderNumber;

    checkoutForm.parentElement.hidden = true;
    document.querySelector(".order-summary").hidden = true;

    orderSuccess.hidden = false;

    localStorage.removeItem("nexusCart");
});

renderCheckout();
