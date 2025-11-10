// ADMIN LOGIN HANDLER (works from main website)
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("adminBtn");
  const adminModal = document.getElementById("adminModal");
  const closeModal = document.getElementById("closeModal");
  const loginBtn = document.getElementById("loginBtn");

  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Already logged in — go straight to dashboard
        window.location.href = "admin/index.html";
      } else {
        adminModal.style.display = "block";
      }
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      adminModal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === adminModal) {
      adminModal.style.display = "none";
    }
  });

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        document.getElementById("loginMessage").textContent =
          "Please enter both fields.";
        return;
      }

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.token);
          window.location.href = "admin/index.html";
        } else {
          document.getElementById("loginMessage").textContent =
            data.error || "Invalid credentials.";
        }
      } catch (err) {
        document.getElementById("loginMessage").textContent =
          "Server error. Please try again later.";
      }
    });
  }
});



let token = null;

// DOM elements
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');
const showForgot = document.getElementById('showForgot');
const forgotContainer = document.getElementById('forgotContainer');
const forgotEmail = document.getElementById('forgotEmail');
const sendResetBtn = document.getElementById('sendResetBtn');
const forgotMsg = document.getElementById('forgotMsg');
const resetContainer = document.getElementById('resetContainer');
const resetCode = document.getElementById('resetCode');
const resetNewPassword = document.getElementById('resetNewPassword');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const resetMsg = document.getElementById('resetMsg');
const adminPanel = document.getElementById('adminPanel');
const adminName = document.getElementById('adminName');

const leadersTable = document.getElementById('leadersTable').querySelector('tbody');
const adminActionsHeader = document.getElementById('adminActionsHeader');

// Leader form
const leaderFirst = document.getElementById('leaderFirst');
const leaderLast = document.getElementById('leaderLast');
const leaderPosition = document.getElementById('leaderPosition');
const leaderEmail = document.getElementById('leaderEmail');
const saveLeaderBtn = document.getElementById('saveLeaderBtn');
const cancelLeaderBtn = document.getElementById('cancelLeaderBtn');
const leaderMsg = document.getElementById('leaderMsg');
const editLeaderId = document.getElementById('editLeaderId');

// Change password
const oldPassword = document.getElementById('oldPassword');
const newPassword = document.getElementById('newPassword');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const passwordMsg = document.getElementById('passwordMsg');

// Admin creation
const newAdminUsername = document.getElementById('newAdminUsername');
const newAdminDisplay = document.getElementById('newAdminDisplay');
const newAdminEmail = document.getElementById('newAdminEmail');
const newAdminPassword = document.getElementById('newAdminPassword');
const createAdminBtn = document.getElementById('createAdminBtn');
const adminCreateMsg = document.getElementById('adminCreateMsg');

// Logout
const logoutBtn = document.getElementById('logoutBtn');

// ------------------------
// Helpers
// ------------------------
const headers = () => ({ 'Content-Type':'application/json', 'Authorization': token ? 'Bearer '+token : ''});

function showMessage(el, msg, color='red') {
    el.style.color = color;
    el.textContent = msg;
    setTimeout(()=>{ el.textContent=''; },3500);
}

function fetchLeaders() {
    fetch('/api/leaders', { headers: headers() })
    .then(r=>r.json())
    .then(data=>{
        leadersTable.innerHTML='';
        data.forEach(l=>{
            const tr = document.createElement('tr');
            tr.innerHTML=`<td>${l.first}</td><td>${l.last}</td><td>${l.position}</td><td>${l.email}</td>
            <td class="adminActions hidden">
                <button onclick="editLeader(${l.id},'${l.first}','${l.last}','${l.position}','${l.email}')">Edit</button>
                <button onclick="deleteLeader(${l.id})">Delete</button>
            </td>`;
            leadersTable.appendChild(tr);
        });
        if(token) {
            document.querySelectorAll('.adminActions').forEach(el=>el.classList.remove('hidden'));
            adminActionsHeader.classList.remove('hidden');
        }
    });
}

// ------------------------
// Leader CRUD
// ------------------------
function editLeader(id,first,last,position,email){
    editLeaderId.value=id;
    leaderFirst.value=first;
    leaderLast.value=last;
    leaderPosition.value=position;
    leaderEmail.value=email;
}
cancelLeaderBtn.onclick=()=>{ editLeaderId.value=''; leaderFirst.value=''; leaderLast.value=''; leaderPosition.value=''; leaderEmail.value=''; }

saveLeaderBtn.onclick=()=>{
    const payload = {
        first: leaderFirst.value,
        last: leaderLast.value,
        position: leaderPosition.value,
        email: leaderEmail.value
    };
    if(editLeaderId.value){
        fetch('/api/leaders/'+editLeaderId.value,{method:'PUT', headers:headers(), body:JSON.stringify(payload)})
        .then(r=>r.json()).then(res=>{
            showMessage(leaderMsg,'Leader updated','green'); editLeaderId.value=''; fetchLeaders();
        });
    }else{
        fetch('/api/leaders',{method:'POST', headers:headers(), body:JSON.stringify(payload)})
        .then(r=>r.json()).then(res=>{
            showMessage(leaderMsg,'Leader added','green'); fetchLeaders();
        });
    }
}

// Delete
window.deleteLeader=(id)=>{
    if(!confirm('Delete this leader?')) return;
    fetch('/api/leaders/'+id,{method:'DELETE', headers:headers()}).then(r=>r.json()).then(res=>{
        fetchLeaders();
    });
}

// ------------------------
// Admin login
// ------------------------
adminBtn.onclick=()=>adminModal.classList.toggle('hidden');

loginBtn.onclick=()=>{
    fetch('/api/login',{method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({username:loginUsername.value,password:loginPassword.value})})
    .then(r=>r.json()).then(res=>{
        if(res.token){
            token=res.token;
            adminModal.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            adminName.textContent=res.displayName;
            fetchLeaders();
        }else showMessage(loginMsg,res.error);
    });
}

// ------------------------
// Forgot / Reset Password
// ------------------------
showForgot.onclick=()=>{ forgotContainer.classList.remove('hidden'); resetContainer.classList.remove('hidden'); }

sendResetBtn.onclick=()=>{
    fetch('/api/forgot-password',{method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:forgotEmail.value})})
    .then(r=>r.json()).then(res=>{
        showMessage(forgotMsg,res.message,'green');
    });
}

resetPasswordBtn.onclick=()=>{
    fetch('/api/reset-password',{method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:forgotEmail.value, code:resetCode.value, newPassword:resetNewPassword.value})})
    .then(r=>r.json()).then(res=>{
        if(res.success){ showMessage(resetMsg,'Password reset successful','green'); resetContainer.classList.add('hidden'); forgotContainer.classList.add('hidden'); }
        else showMessage(resetMsg,res.error);
    });
}

// ------------------------
// Change password
// ------------------------
changePasswordBtn.onclick=()=>{
    fetch('/api/change-password',{method:'POST', headers:headers(),
        body:JSON.stringify({oldPassword:oldPassword.value,newPassword:newPassword.value})})
    .then(r=>r.json()).then(res=>{
        if(res.success) showMessage(passwordMsg,'Password changed','green');
        else showMessage(passwordMsg,res.error);
    });
}

// ------------------------
// Create Admin
// ------------------------
createAdminBtn.onclick=()=>{
    const payload = { username:newAdminUsername.value, displayName:newAdminDisplay.value, email:newAdminEmail.value, password:newAdminPassword.value };
    fetch('/api/admins',{method:'POST', headers:headers(), body:JSON.stringify(payload)})
    .then(r=>r.json()).then(res=>{
        if(res.error) showMessage(adminCreateMsg,res.error);
        else showMessage(adminCreateMsg,'Admin created','green');
    });
}

// ------------------------
// Logout
// ------------------------
logoutBtn.onclick=()=>{
    token=null;
    adminPanel.classList.add('hidden');
    loginUsername.value=''; loginPassword.value='';
    adminModal.classList.remove('hidden');
    fetchLeaders();
}

// Initial load
fetchLeaders();

// Elements
const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const forgotContainer = document.getElementById("forgotContainer");
const loginMessage = document.getElementById("loginMessage");
const passwordMessage = document.getElementById("passwordMessage");
const resetMessage = document.getElementById("resetMessage");

// Check token on page load
const token = localStorage.getItem("adminToken");
if (token) showDashboard();

// --- Login ---
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  loginMessage.textContent = "";
  
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("adminToken", data.token);
    showDashboard();
  } else loginMessage.textContent = data.error || "Login failed";
});

// --- Show Dashboard ---
function showDashboard() {
  loginForm.classList.add("hidden");
  forgotContainer.classList.add("hidden");
  dashboard.classList.remove("hidden");
  fetchLeaders();
}

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  dashboard.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// --- Fetch Leaders ---
async function fetchLeaders() {
  const token = localStorage.getItem("adminToken");
  const res = await fetch("/api/leaders", {
    headers: { "Authorization": "Bearer " + token }
  });
  const leaders = await res.json();
  const tbody = document.querySelector("#leadersTable tbody");
  tbody.innerHTML = leaders.map(l => `<tr>
    <td>${l.first}</td>
    <td>${l.last}</td>
    <td>${l.position}</td>
    <td>${l.email}</td>
  </tr>`).join("");
}

// --- Change Password ---
document.getElementById("changePasswordBtn").addEventListener("click", async () => {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const token = localStorage.getItem("adminToken");
  passwordMessage.textContent = "";

  const res = await fetch("/api/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  const data = await res.json();
  passwordMessage.textContent = res.ok ? "Password changed successfully" : data.error;
});

// --- Forgot Password ---
document.getElementById("forgotPasswordBtn").addEventListener("click", () => {
  loginForm.classList.add("hidden");
  forgotContainer.classList.remove("hidden");
});

// --- Send Reset Link ---
document.getElementById("sendResetBtn").addEventListener("click", async () => {
  const email = document.getElementById("resetEmail").value;
  resetMessage.textContent = "";
  const res = await fetch("/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  resetMessage.textContent = data.message || data.error;
});
