import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

console.log("Firebase connected:", app);
console.log("Firestore connected:", db);

async function fetchProducts() {
    const productsContainer = document.querySelector('.products');
    productsContainer.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productId = doc.id; 

            const productElement = document.createElement('div');
            productElement.classList.add('product', 'col-12', 'col-md-4', 'mb-4');

            const truncatedTitle = product.name.length > 50
                ? product.name.substring(0, 50) + "..."
                : product.name;

            const imageSrc = product.image.startsWith('data:image') 
                ? product.image 
                : `data:image/jpeg;base64,${product.image}`;

            const productLink = document.createElement('a');
            productLink.href = `productPage.html?id=${productId}`;
            productLink.style.textDecoration = 'none'; 
            productLink.style.color = 'inherit'; 

            productLink.innerHTML = `
                <div class="product-img">
                    <img src="${imageSrc}" alt="${product.name}" class="w-100">
                </div>
                <div class="product-details p-3 border rounded">
                    <h6>${truncatedTitle}</h6>
                    <label>Price: $${product.price}</label>
                    <p>Stock: ${product.stock} units</p>
                </div>
            `;

            productElement.appendChild(productLink);
 
            productsContainer.appendChild(productElement);
        });
    } catch (error) {
        console.error("Error fetching data from Firestore:", error);
    }
}

fetchProducts();