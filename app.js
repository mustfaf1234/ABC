
// إعداد Firebase والمكتبات
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import * as jspdf from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

const firebaseConfig = {
  apiKey: "AIzaSyCqOK8dAsYVd3G5kv6rFbrkDfLhmgFOXAU",
  authDomain: "flight-scheduler-3daea.firebaseapp.com",
  projectId: "flight-scheduler-3daea",
  storageBucket: "flight-scheduler-3daea.appspot.com",
  messagingSenderId: "1036581965112",
  appId: "1:1036581965112:web:0bd21e436764ea4294c5cd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const adminEmail = "AhmedalTalqani@gmail.com";

function showLoginForm() {
  document.getElementById('app').innerHTML = \`
    <h2>تسجيل الدخول</h2>
    <input id="email" placeholder="البريد الإلكتروني"><br>
    <input id="password" type="password" placeholder="كلمة المرور"><br>
    <button onclick="login()">دخول</button>
    <div id="output"></div>
  \`;
}

window.login = async function (emailParam, passwordParam) {
  const email = emailParam || document.getElementById("email")?.value;
  const password = passwordParam || document.getElementById("password")?.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);
    const output = document.getElementById("output");
    if (output) output.innerHTML = "<b>تم تسجيل الدخول</b>";
    loadFlightApp();
  } catch (err) {
    const output = document.getElementById("output");
    if (output) output.innerText = "فشل تسجيل الدخول: " + err.message;
  }
};

window.logout = async function () {
  await signOut(auth);
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userPassword");
  showLoginForm();
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem("userEmail", user.email);
    loadFlightApp();
  } else {
    const savedEmail = localStorage.getItem("userEmail");
    const savedPassword = localStorage.getItem("userPassword");
    if (savedEmail && savedPassword) {
      login(savedEmail, savedPassword);
    } else {
      showLoginForm();
    }
  }
});
