import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvpfgtvtUrwTdWHGcg8QMurf18RnI6xb0",
  authDomain: "ecommerce-project-b557d.firebaseapp.com",
  projectId: "ecommerce-project-b557d",
  storageBucket: "ecommerce-project-b557d.firebasestorage.app",
  messagingSenderId: "307836339619",
  appId: "1:307836339619:web:4f4782b193eda7b7fc8616"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase connected:", app);
console.log("Firestore connected:", db);

document.querySelector("button").addEventListener("click", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("f-name").value.trim();
    const lastName = document.getElementById("l-name").value.trim();
    const phone = "0" + document.getElementById("number").value.trim();
    const address = document.getElementById("address").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("pass").value;
    const confirmPassword = document.getElementById("con-pass").value;

    if (!firstName || !lastName || !phone || !address || !email || !password || !confirmPassword) {
        showError("All fields are required!");
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            phone,
            address,
            email,
            role: "user",
            createdAt: serverTimestamp() 
        });

        Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Sign-up successful!",
            timer: 1000,
            showConfirmButton: false,
        }).then(() => {
            window.location.href = "../index.html";
        });

    } catch (error) {
        showError("Error during sign-up: " + error.message);
    }
});

function showError(message) {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
        confirmButtonColor: "#d33",
    });
}
