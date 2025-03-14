import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

document.querySelector(".add-btn button").addEventListener("click", async (e) => {
    e.preventDefault();
  
    const adminUID = sessionStorage.getItem("adminUID");
    if (!adminUID) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "Admin not logged in. Please log in to add products.",
      });
      return;
    }
  
    const productName = document.querySelector("input[type='text']").value.trim();
    const productDescription = document.querySelector("textarea").value.trim();
    const productPrice = parseFloat(document.querySelectorAll("input[type='text']")[1].value.trim());
    const productStock = parseInt(document.querySelector("input[type='number']").value.trim());
    const productCategory = document.querySelector("select").value;
    const productImageFile = document.querySelector("#Uploadbtn").files[0];
  
    // if (!productName || !productDescription || isNaN(productPrice) || isNaN(productStock) || !productCategory || !productImageFile) {
    //   Swal.fire({
    //     icon: "warning",
    //     title: "Missing Fields",
    //     text: "Please fill all the fields and select an image.",
    //   });
    //   return;
    // }
  
    try {
      const reader = new FileReader();
      reader.readAsDataURL(productImageFile);
  
      reader.onload = async () => {
        const base64Image = reader.result;
  
        const docRef = await addDoc(collection(db, "products"), {
          name: productName,
          description: productDescription,
          price: productPrice,
          stock: productStock,
          category: productCategory,
          image: base64Image,
          adminUID: adminUID,
          createdAt: new Date(),
        });
  
        Swal.fire({
          icon: "success",
          title: "Product Added",
          text: `Product added successfully with ID: ${docRef.id}`,
        });
  
        // Reset form fields manually
        document.querySelector("input[type='text']").value = "";
        document.querySelectorAll("input[type='text']")[1].value = "";
        document.querySelector("textarea").value = "";
        document.querySelector("input[type='number']").value = "";
        document.querySelector("select").selectedIndex = 0;
        document.querySelector("#placeholder").src = "";
        document.querySelector("#placeholder").style.display = "none";
        document.querySelector("#Uploadbtn").value = "";
      };
  
      reader.onerror = (error) => {
        Swal.fire({
          icon: "error",
          title: "Image Conversion Failed",
          text: error.message,
        });
      };
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Adding Product",
        text: error.message,
      });
    }
  });
