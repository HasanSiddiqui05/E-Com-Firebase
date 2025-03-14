import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

document.querySelector("button").addEventListener("click", async(e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("pass").value;

    if (!email || !password) {
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please enter both email and password.",
        });
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userId = user.uid; 

        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;  

            if (role === "admin") {
                sessionStorage.setItem("adminUID", user.uid);
                loginConfirm("Admin Login", "adminDashboard.html")
            } else if (role === "user") {
                loginConfirm("User Login", "homepage.html")
                sessionStorage.setItem("userUID", user.uid);
            } else {
                loginError("Access Denied", "You don't have permission to log in.")
            }
        } else {
            loginError("User Not Found", "No account found with this email.")
        }
    } catch (error) {
        loginError("Login Failed", error.message)
    }
})

function loginConfirm(title, locate){
    Swal.fire({
        icon: "success",
        title: title,
        text: "Login Successful",
        timer: 1000,
        showConfirmButton: false,
    }).then(() => {
        window.location.href = locate
    })
}

function loginError(title, err){
    Swal.fire({
        icon: "error",
        title: title,
        text: err    
    })
}