const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const closeBtn = document.getElementById('closeBtn');
const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');
const leadersTableBody = document.querySelector('#leadersTable tbody');
const adminActionsHeader = document.getElementById('adminActionsHeader');

const leaderFormContainer = document.getElementById('leaderFormContainer');
const leaderFormTitle = document.getElementById('leaderFormTitle');
const leaderFirst = document.getElementById('leaderFirst');
const leaderLast = document.getElementById('leaderLast');
const leaderPosition = document.getElementById('leaderPosition');
const leaderEmail = document.getElementById('leaderEmail');
const saveLeaderBtn = document.getElementById('saveLeaderBtn');
const cancelLeaderBtn = document.getElementById('cancelLeaderBtn');

const passwordFormContainer = document.getElementById('passwordFormContainer');
const oldPassword = document.getElementById('oldPassword');
const newPassword = document.getElementById('newPassword');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const passwordMessage = document.getElementById('passwordMessage');

let token = null;
let editingLeaderId = null;

const adminCreateContainer = document.getElementById('adminCreateContainer');
const newAdminUsername = document.getElementById('newAdminUsername');
const newAdminDisplay = document.getElementById('newAdminDisplay');
const newAdminEmail = document.getElementById('newAdminEmail');
const newAdminPassword = document.getElementById('newAdminPassword');
const createAdminBtn = document.getElementById('createAdminBtn');
const adminCreateMsg = document.getElementById('adminCreateMsg');

createAdminBtn.onclick = async () => {
  const username = newAdminUsername.value.trim();
  const displayName = newAdminDisplay.value.trim();
  const email = newAdminEmail.value.trim();
  const password = newAdminPassword.value.trim();
  if(!username || !displayName || !email || !password){
    adminCreateMsg.textContent = 'All fields are required';
    return;
  }

  try{
    const res = await fetch('/api/admins', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify({ username, displayName, email, password })
    });
    const data = await res.json();
    if(res.ok){
      alert(`Admin ${username} created successfully`);
      newAdminUsername.value='';
      newAdminDisplay.value='';
      newAdminEmail.value='';
      newAdminPassword.value='';
      adminCreateMsg.textContent='';
    } else adminCreateMsg.textContent = data.error;
  } catch(err){
    console.error(err);
    adminCreateMsg.textContent = 'Network error';
  }
};

// Show/hide admin modal
adminBtn.onclick = () => adminModal.style.display = 'block';
closeBtn.onclick = () => adminModal.style.display = 'none';

// Admin login
loginBtn.onclick = async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if(res.ok){
    token = data.token;
    adminModal.style.display = 'none';
    alert(`Welcome ${data.displayName}`);
    loadLeaders(true);
  } else {
    loginMessage.textContent = data.error;
  }
};

// Load leaders
async function loadLeaders(isAdmin=false){
  const url = isAdmin ? '/api/leaders' : '/public/leaders';
  const headers = isAdmin && token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await fetch(url, { headers });
  const data = await res.json();

  leadersTableBody.innerHTML = '';
  adminActionsHeader.style.display = isAdmin ? 'table-cell' : 'none';

  data.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${l.first}</td>
      <td>${l.last}</td>
      <td>${l.position}</td>
      <td>${isAdmin ? l.phone : ''}</td>
      <td>${isAdmin ? `<button onclick="editLeader(${l.id},'${l.first}','${l.last}','${l.position}','${l.phone}')">Edit</button>` : ''}</td>
    `;
    leadersTableBody.appendChild(tr);
  });
}

// Edit leader
window.editLeader = (id, first, last, position, phone) => {
  editingLeaderId = id;
  leaderFormTitle.textContent = 'Edit Leader';
  leaderFirst.value = first;
  leaderLast.value = last;
  leaderPosition.value = position;
  leaderEmail.value = phone;
  leaderFormContainer.style.display = 'block';
};

// Save leader (add/edit)
saveLeaderBtn.onclick = async () => {
  const payload = {
    first: leaderFirst.value,
    last: leaderLast.value,
    position: leaderPosition.value,
    phone: leaderPhone.value
  };
  let url = '/api/leaders';
  let method = 'POST';

  if(editingLeaderId){
    url += `/${editingLeaderId}`;
    method = 'PUT';
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  });

  if(res.ok){
    editingLeaderId = null;
    leaderFormContainer.style.display = 'none';
    loadLeaders(true);
  } else {
    alert('Error saving leader');
  }
};

cancelLeaderBtn.onclick = () => {
  editingLeaderId = null;
  leaderFormContainer.style.display = 'none';
};

// Change password
changePasswordBtn.onclick = async () => {
  const res = await fetch('/api/change-password', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ oldPassword: oldPassword.value, newPassword: newPassword.value })
  });

  const data = await res.json();
  if(res.ok){
    alert('Password changed successfully');
    oldPassword.value = '';
    newPassword.value = '';
  } else {
    passwordMessage.textContent = data.error;
  }
};

// Initial load (public view)
loadLeaders();
