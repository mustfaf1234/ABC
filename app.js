
// إعداد Firebase والمكتبات
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import * as jspdf from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
import * as docx from 'https://cdn.jsdelivr.net/npm/docx@7.7.0/build/index.min.js';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCqOK8dAsYVd3G5kv6rFbrkDfLhmgFOXAU",
  authDomain: "flight-scheduler-3daea.firebaseapp.com",
  projectId: "flight-scheduler-3daea",
  storageBucket: "flight-scheduler-3daea.appspot.com",
  messagingSenderId: "1036581965112",
  appId: "1:1036581965112:web:0bd21e436764ea4294c5cd",
  measurementId: "G-ZC0843FNX8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const adminEmail = "AhmedalTalqani@gmail.com";

// مراقبة حالة تسجيل الدخول
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

function showLoginForm() {
  document.getElementById('app').innerHTML = `
    <h2>تسجيل الدخول</h2>
    <input id="email" placeholder="البريد الإلكتروني"><br>
    <input id="password" type="password" placeholder="كلمة المرور"><br>
    <button onclick="login()">دخول</button>
    <div id="output"></div>
  `;
}

window.login = async function (emailParam, passwordParam) {
  const email = emailParam || document.getElementById("email").value;
  const password = passwordParam || document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);
    document.getElementById("output").innerHTML = "<b>تم تسجيل الدخول</b>";
  } catch {
    document.getElementById("output").innerText = "فشل تسجيل الدخول";
  }
};

window.logout = async function () {
  await signOut(auth);
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userPassword");
  showLoginForm();
};

function loadFlightApp() {
  const user = auth.currentUser;
  const isAdmin = user && user.email === adminEmail;
  let formHTML = "";
  for (let i = 1; i <= 5; i++) {
    formHTML += `
      <fieldset style="margin-bottom: 15px;">
        <legend>الرحلة ${i}</legend>
        <input placeholder="رقم الرحلة" id="fltno${i}"><br>
        <input placeholder="ON chocks Time" id="onchocks${i}"><br>
        <input placeholder="Open Door Time" id="opendoor${i}"><br>
        <input placeholder="Start Cleaning Time" id="cleanstart${i}"><br>
        <input placeholder="Complete Cleaning Time" id="cleanend${i}"><br>
        <input placeholder="Ready Boarding Time" id="ready${i}"><br>
        <input placeholder="Start Boarding Time" id="boardingstart${i}"><br>
        <input placeholder="Complete Boarding Time" id="boardingend${i}"><br>
        <input placeholder="Close Door Time" id="closedoor${i}"><br>
        <input placeholder="Off chocks Time" id="offchocks${i}"><br>
        <input placeholder="الاسم" id="name${i}"><br>
        <input placeholder="ملاحظات" id="notes${i}"><br>
        <input type="date" id="date${i}"><br>
      </fieldset>
    `;
  }

  const counterSection = isAdmin ? `<h3>📊 عداد الرحلات بالشهر (للمسؤول)</h3><div id="monthlyCounter"></div>` : "";

  document.getElementById("app").innerHTML = `
    <button onclick="logout()" style="float:left;">🔓 تسجيل الخروج</button>
    <h2>إضافة 5 رحلات</h2>
    ${formHTML}
    <button onclick="saveFlights()">💾 حفظ الرحلات</button>
    <hr>
    <h2>رحلات اليوم</h2>
    <input id="filterName" placeholder="فلترة حسب الاسم" oninput="loadFlights()"><br>
    <button onclick="exportToPDF()">📤 تصدير PDF</button>
    <button onclick="exportToWord()">📄 تصدير Word</button>
    <div id="flightsTable"></div>
    ${counterSection}
  `;

  loadFlights();
}

window.exportToPDF = async function () {
  const snapshot = await getDocs(collection(db, "flights"));
  const { jsPDF } = jspdf;
  const pdf = new jsPDF();
  let y = 10;

  snapshot.forEach((docSnap, index) => {
    const d = docSnap.data();
    const text = `
    ✈️ رحلة ${index + 1}
    الاسم: ${d.name || ""}
    رقم الرحلة: ${d.fltno || ""}
    التاريخ: ${d.date || ""}
    ON: ${d.onchocks || ""}, Open: ${d.opendoor || ""}
    Start Clean: ${d.cleanstart || ""}, End Clean: ${d.cleanend || ""}
    Ready: ${d.ready || ""}, Boarding: ${d.boardingstart || ""} - ${d.boardingend || ""}
    Close: ${d.closedoor || ""}, OFF: ${d.offchocks || ""}
    ملاحظات: ${d.notes || ""}
    -----------------------------`;
    const lines = pdf.splitTextToSize(text, 180);
    pdf.text(lines, 10, y);
    y += lines.length * 8;
    if (y > 270) {
      pdf.addPage();
      y = 10;
    }
  });

  pdf.save("flights.pdf");
};
