import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvpfgtvtUrwTdWHGcg8QMurf18RnI6xb0",
    authDomain: "ecommerce-project-b557d.firebaseapp.com",
    projectId: "ecommerce-project-b557d",
    storageBucket: "ecommerce-project-b557d.firebasestorage.app",
    messagingSenderId: "307836339619",
    appId: "1:307836339619:web:4f4782b193eda7b7fc8616"  
};
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = sessionStorage.getItem("userUID");

async function fetchCartItems() {
    if (!userId) {
        console.error("User ID not found in session storage");
        return;
    }

    try {
        const cartQuery = query(collection(db, "cart"), where("userId", "==", userId));
        const cartSnapshot = await getDocs(cartQuery);

        const cartItems = [];
        for (const cartDoc of cartSnapshot.docs) {
            const cartItem = cartDoc.data();
            cartItems.push(cartItem);
        }

        console.log("Cart Items:", cartItems);
        return cartItems;
    } catch (error) {
        console.error("Error fetching cart items from Firestore:", error);
        return [];
    }
}

async function fetchProductDetails(productId) {
    try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            return productSnap.data();
        } else {
            console.error("Product not found in Firestore");
            return null;
        }
    } catch (error) {
        console.error("Error fetching product details from Firestore:", error);
        return null;
    }
}

async function renderCartItems() {
    const cartItems = await fetchCartItems();
    const productsContainer = document.querySelector('.cart-cards');
    productsContainer.innerHTML = '';

    for (const cartItem of cartItems) {
        const product = await fetchProductDetails(cartItem.productId);

        if (product) {
            const truncatedDescription = product.description.length > 100
                ? product.description.substring(0, 100) + "..."
                : product.description;

            const productElement = document.createElement('div');
            productElement.classList.add('cart-item');

            productElement.innerHTML = `
                <div class="delete-btn">
                    <img class="remove-btn" data-id="${cartItem.productId}" alt="delete-btn" src="../images/icons8-trash-24.png">
                </div>
                <div class="item-details">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="item-data">
                        <h5>${product.name}</h5>
                        <p>${truncatedDescription}</p>
                        <div class="item-price">
                            <label id="price-${cartItem.productId}">Price: $${(product.price * cartItem.quantity).toFixed(2)}</label>
                            <div class="quantityBtn">
                                <button class="inc" data-id="${cartItem.productId}" data-price="${product.price}">+</button>
                                <span id="quan-${cartItem.productId}">${cartItem.quantity}</span>
                                <button class="dec" data-id="${cartItem.productId}" data-price="${product.price}">-</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            productsContainer.appendChild(productElement);
        }
    }

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.getAttribute('data-id');
            await removeFromCart(productId);
        });
    });

    document.querySelectorAll('.inc').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.getAttribute('data-id');
            const price = parseFloat(event.target.getAttribute('data-price'));
            await inc(productId, price);
        });
    });

    document.querySelectorAll('.dec').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.getAttribute('data-id');
            const price = parseFloat(event.target.getAttribute('data-price'));
            await dec(productId, price);
        });
    });

    finalBill();
}

async function removeFromCart(productId) {
    try {
        const cartQuery = query(collection(db, "cart"), where("userId", "==", userId), where("productId", "==", productId));
        const cartSnapshot = await getDocs(cartQuery);

        for (const cartDoc of cartSnapshot.docs) {
            await deleteDoc(cartDoc.ref);
        }

        console.log("Product removed from cart:", productId);
        renderCartItems();
    } catch (error) {
        console.error("Error removing product from cart:", error);
    }
}

async function updateCartItemQuantity(productId, newQuantity) {
    try {
        const cartQuery = query(collection(db, "cart"), where("userId", "==", userId), where("productId", "==", productId));
        const cartSnapshot = await getDocs(cartQuery);

        for (const cartDoc of cartSnapshot.docs) {
            await updateDoc(cartDoc.ref, { quantity: newQuantity });
        }

        console.log(`Updated cart item for ID ${productId}:`, newQuantity);
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
    }
}

async function inc(productId, price) {
    const quant = document.getElementById(`quan-${productId}`);
    let count = Number(quant.innerHTML);
    count++;
    quant.innerHTML = count;

    await updateCartItemQuantity(productId, count);
    calculateTotal(productId, price);
    finalBill();
}

async function dec(productId, price) {
    const quant = document.getElementById(`quan-${productId}`);
    let count = Number(quant.innerHTML);

    if (count > 0) {
        count--;
        quant.innerHTML = count;

        await updateCartItemQuantity(productId, count);
        calculateTotal(productId, price);
        finalBill();
    }
}

function calculateTotal(pid, price) {
    const quant = Number(document.getElementById(`quan-${pid}`).innerHTML);
    const total = price * quant;
    const priceLabel = document.getElementById(`price-${pid}`);
    priceLabel.innerHTML = `Price: $${total.toFixed(2)}`;
}

function finalBill() {
    let delivery = document.getElementById("delivery");
    let discount = document.getElementById("discount");
    let totalBill = document.getElementById("total-bill");
    let subTotal = document.getElementById("subtotal");
    let totalPrice = 0;

    const priceElements = document.querySelectorAll('[id^="price-"]');
    priceElements.forEach(priceElement => {
        const priceText = priceElement.textContent.replace("Price: $", "").trim();
        totalPrice += parseFloat(priceText);
    });

    subTotal.innerHTML = `$${totalPrice.toFixed(2)}`;

    const deliveryPrice = parseFloat(delivery.textContent.replace("$", "").trim()) || 0;
    const discountPrice = parseFloat(discount.textContent.replace("$", "").trim()) || 0;

    const finalTotal = totalPrice + deliveryPrice - discountPrice;

    totalBill.innerHTML = `$${finalTotal.toFixed(2)}`;

    console.log("Total Price:", totalPrice);
    console.log("Final Bill:", finalTotal);
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".logo").addEventListener("click", redirectToHome);
});

function redirectToHome() {
    window.location.href = "homePage.html";
}

renderCartItems();