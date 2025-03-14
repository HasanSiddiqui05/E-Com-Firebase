import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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
const auth = getAuth(app);

let quant = document.getElementById("quan");
let count = 0;

async function dataFetch() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); 

    if (!productId) {
        console.error("Product ID not found in URL");
        return;
    }

    try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const product = productSnap.data();

            document.getElementById("image").src = product.image;
            document.getElementById("product-title").textContent = product.name;
            document.getElementById("product-description").textContent = product.description;
            document.getElementById("product-price").textContent = `Price: $${product.price}`;
            document.getElementById("product-category").textContent = `${product.category.toUpperCase()}`;

        } else {
            console.error("Product not found in Firestore");
        }
    } catch (error) {
        console.error("Error fetching product details from Firestore:", error);
    }
}

dataFetch();

document.querySelector(".inc").addEventListener("click", () => {
    count++;
    quant.innerHTML = count;
});

document.querySelector(".dec").addEventListener("click", () => {
    if (count > 0) {
        count--;
        quant.innerHTML = count;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".addCartBtn button").addEventListener("click", addToCart);

    document.querySelector(".logo").addEventListener("click", redirectToHome);

    document.querySelector(".inc").addEventListener("click", inc);
    document.querySelector(".dec").addEventListener("click", dec);
});

async function addToCart() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); 
    const quantity = count; 

    if (quantity > 0) {
        const user = auth.currentUser;

        if (user) {
            const userId = user.uid;

            try {
                const cartItem = {
                    userId: userId,
                    productId: productId,
                    quantity: quantity,
                    timestamp: new Date()
                };

                await addDoc(collection(db, "cart"), cartItem);

                count = 0;
                quant.innerHTML = count;

                console.log("Cart item added to Firestore:", cartItem); 
                alert(`Added ${quantity} item(s) of this Product to the cart.`);
            } catch (error) {
                console.error("Error adding cart item to Firestore:", error);
                alert("Error adding item to cart. Please try again.");
            }
        } else {
            alert("You need to be logged in to add items to the cart.");
        }
    } else {
        alert("Please select a quantity greater than 0.");
    }
}

function redirectToHome() {
    window.location.href = "homePage.html";
}
