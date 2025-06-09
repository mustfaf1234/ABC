// إعداد Firebase والمكتبات import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js'; import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js'; import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js'; import * as jspdf from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

const firebaseConfig = { apiKey: "AIzaSyCqOK8dAsYVd3G5kv6rFbrkDfLhmgFOXAU", authDomain: "flight-scheduler-3daea.firebaseapp.com", projectId: "flight-scheduler-3daea", storageBucket: "flight-scheduler-3daea.appspot.com", messagingSenderId: "1036581965112", appId: "1:1036581965112:web:0bd21e436764ea4294c5cd" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app); const adminEmail = "AhmedalTalqani@gmail.com";

onAuthStateChanged(auth, (user) => { if (user) { localStorage.setItem("userEmail", user.email); loadFlightApp(); } else { const savedEmail = localStorage.getItem("userEmail"); const savedPassword = localStorage.getItem("userPassword"); if (savedEmail && savedPassword) { login(savedEmail, savedPassword); } else { showLoginForm(); } } });

function showLoginForm() { document.getElementById('app').innerHTML = <h2>تسجيل الدخول</h2> <input id="email" placeholder="البريد الإلكتروني"><br> <input id="password" type="password" placeholder="كلمة المرور"><br> <button onclick="login()">دخول</button> <div id="output"></div>; }

window.login = async function (emailParam, passwordParam) { const email = emailParam || document.getElementById("email").value; const password = passwordParam || document.getElementById("password").value; try { await signInWithEmailAndPassword(auth, email, password); localStorage.setItem("userEmail", email); localStorage.setItem("userPassword", password); document.getElementById("output").innerHTML = "<b>تم تسجيل الدخول</b>"; loadFlightApp(); } catch { document.getElementById("output").innerText = "فشل تسجيل الدخول"; } };

window.logout = async function () { await signOut(auth); localStorage.removeItem("userEmail"); localStorage.removeItem("userPassword"); showLoginForm(); };

function loadFlightApp() { const user = auth.currentUser; const isAdmin = user && user.email === adminEmail;

let formHTML = ""; for (let i = 1; i <= 5; i++) { formHTML += <fieldset> <legend>✈️ الرحلة ${i}</legend> <input id="fltno${i}" placeholder="رقم الرحلة"><br> <input id="onchocks${i}" placeholder="ON chocks Time"><br> <input id="opendoor${i}" placeholder="Open Door Time"><br> <input id="cleanstart${i}" placeholder="Start Cleaning Time"><br> <input id="cleanend${i}" placeholder="Complete Cleaning Time"><br> <input id="ready${i}" placeholder="Ready Boarding Time"><br> <input id="boardingstart${i}" placeholder="Start Boarding Time"><br> <input id="boardingend${i}" placeholder="Complete Boarding Time"><br> <input id="closedoor${i}" placeholder="Close Door Time"><br> <input id="offchocks${i}" placeholder="Off chocks Time"><br> <input id="name${i}" placeholder="الاسم"><br> <input id="notes${i}" placeholder="ملاحظات"><br> <input id="date${i}" type="date"><br> </fieldset>; }

const counterSection = isAdmin ? <div id="monthlyCounter"></div> : "";

document.getElementById("app").innerHTML = <button onclick="logout()">🔓 تسجيل الخروج</button> <h2>إضافة 5 رحلات</h2> ${formHTML} <button onclick="saveFlights()">💾 حفظ الرحلات</button> <hr> <input id="filterName" placeholder="بحث بالاسم" oninput="loadFlights()"> <input id="filterDate" type="date" oninput="loadFlights()"> <div id="flightsTable"></div> <button onclick="exportToPDF()">📤 تصدير PDF</button> ${counterSection};

loadFlights(); }

window.saveFlights = async function () { let savedCount = 0; for (let i = 1; i <= 5; i++) { const data = { fltno: document.getElementById(fltno${i}).value.trim(), onchocks: document.getElementById(onchocks${i}).value.trim(), opendoor: document.getElementById(opendoor${i}).value.trim(), cleanstart: document.getElementById(cleanstart${i}).value.trim(), cleanend: document.getElementById(cleanend${i}).value.trim(), ready: document.getElementById(ready${i}).value.trim(), boardingstart: document.getElementById(boardingstart${i}).value.trim(), boardingend: document.getElementById(boardingend${i}).value.trim(), closedoor: document.getElementById(closedoor${i}).value.trim(), offchocks: document.getElementById(offchocks${i}).value.trim(), name: document.getElementById(name${i}).value.trim(), notes: document.getElementById(notes${i}).value.trim(), date: document.getElementById(date${i}).value.trim(), }; const hasData = Object.values(data).some(val => val); if (hasData) { await addDoc(collection(db, "flights"), data); savedCount++; } } alert(✅ تم حفظ ${savedCount} رحلة); loadFlights(); };

window.loadFlights = async function () { const name = document.getElementById("filterName")?.value.trim(); const date = document.getElementById("filterDate")?.value.trim(); let q = collection(db, "flights");

if (name || date) { const conditions = []; if (name) conditions.push(where("name", "==", name)); if (date) conditions.push(where("date", "==", date)); q = query(collection(db, "flights"), ...conditions); }

const snapshot = await getDocs(q); const { jsPDF } = jspdf; const monthlyCount = {}; let html = <table border="1"><tr><th>تصدير</th><th>حذف</th><th>الاسم</th><th>الرحلة</th><th>التاريخ</th><th>ملاحظات</th></tr>;

snapshot.forEach(docSnap => { const d = docSnap.data(); const id = docSnap.id; const key = ${d.name || "غير معروف"} - ${(d.date || "").slice(0, 7)}; monthlyCount[key] = (monthlyCount[key] || 0) + 1;

html += `<tr>
  <td><button onclick="exportSingleFlightToPDF('${id}')">📤</button></td>
  <td><button onclick="deleteFlight('${id}')">🗑️</button></td>
  <td>${d.name || ""}</td>
  <td>${d.fltno || ""}</td>
  <td>${d.date || ""}</td>
  <td>${d.notes || ""}</td>
</tr>`;

});

html += "</table>"; document.getElementById("flightsTable").innerHTML = html;

const counterDiv = document.getElementById("monthlyCounter"); if (counterDiv) { counterDiv.innerHTML = <h3>📊 العداد الشهري</h3><ul> + Object.entries(monthlyCount).map(([k, v]) => <li>${k} ➤ ${v}</li>).join("") + "</ul>"; } };

window.deleteFlight = async function (id) { if (confirm("هل تريد حذف هذه الرحلة؟")) { await deleteDoc(doc(db, "flights", id)); loadFlights(); } };

window.exportSingleFlightToPDF = async function (id) { const snapshot = await getDocs(collection(db, "flights")); const docSnap = snapshot.docs.find(doc => doc.id === id); if (!docSnap) return;

const d = docSnap.data(); const { jsPDF } = jspdf; const pdf = new jsPDF(); const content = الاسم: ${d.name}\nرقم الرحلة: ${d.fltno}\nON: ${d.onchocks}\nOpen: ${d.opendoor}\nStart Clean: ${d.cleanstart}\nEnd Clean: ${d.cleanend}\nReady: ${d.ready}\nBoarding: ${d.boardingstart} - ${d.boardingend}\nClose: ${d.closedoor}\nOFF: ${d.offchocks}\nالتاريخ: ${d.date}\nملاحظات: ${d.notes}; pdf.text(content, 10, 10); pdf.save(flight_${d.fltno || "unknown"}.pdf); };

window.exportToPDF = async function () { const snapshot = await getDocs(collection(db, "flights")); const { jsPDF } = jspdf; const pdf = new jsPDF(); let y = 10;

snapshot.forEach((docSnap, index) => { const d = docSnap.data(); const content = ✈️ رحلة ${index + 1} الاسم: ${d.name} رقم الرحلة: ${d.fltno} ON: ${d.onchocks} Open: ${d.opendoor} Start Clean: ${d.cleanstart} End Clean: ${d.cleanend} Ready: ${d.ready} Boarding: ${d.boardingstart} - ${d.boardingend} Close: ${d.closedoor} OFF: ${d.offchocks} التاريخ: ${d.date} ملاحظات: ${d.notes}; const lines = pdf.splitTextToSize(content, 180); pdf.text(lines, 10, y); y += lines.length * 10; if (y > 270) { pdf.addPage(); y = 10; } });

pdf.save("flights.pdf"); }; };

