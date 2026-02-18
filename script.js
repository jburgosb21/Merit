const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3eOlk4sJACOduGvQ_wVw4Fw57"; 

const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUserData = null;

document.addEventListener('DOMContentLoaded', getValidators);

async function getValidators() {
    const { data } = await _merit.from('profiles').select('id, email').eq('role', 'validador');
    const list = document.getElementById('validator-list');
    list.innerHTML = '<option value="">-- Elige un Validador --</option>';
    data?.forEach(v => {
        list.innerHTML += `<option value="${v.id}">${v.email}</option>`;
    });
}

async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const valId = document.getElementById('validator-list').value;
    if (!valId) return alert("Selecciona un mentor.");

    const { error } = await _merit.auth.signUp({
        email, password,
        options: { data: { validator_id: valId } }
    });
    if (error) alert(error.message);
    else alert("Registro listo. Verifica tu email.");
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    if (error) alert("Credenciales incorrectas.");
    else checkProfile(data.user.id);
}

async function checkProfile(uid) {
    const { data: profile } = await _merit.from('profiles').select('*').eq('id', uid).single();
    if (!profile) return alert("Perfil no encontrado.");
    
    currentUserData = profile;
    document.getElementById('user-role').innerText = profile.role;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('user-xp').innerText = profile.xp;

    // Mostrar quién es el validador
    if (profile.validator_id) {
        const { data: v } = await _merit.from('profiles').select('email').eq('id', profile.validator_id).single();
        document.getElementById('mentor-display').innerText = v ? v.email : "Desconocido";
    } else {
        document.getElementById('mentor-display').innerText = "Tú eres el líder";
    }

    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
        loadMyAspirants(uid);
        loadPendingTasks(uid);
    } else {
        document.getElementById('aspirante-panel').style.display = 'block';
    }
    
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// Lógica Aspirante: Enviar Tarea
async function sendTask() {
    const desc = document.getElementById('task-desc').value;
    if (!desc) return alert("Escribe la tarea.");

    const { error } = await _merit.from('tasks').insert({
        aspirante_id: currentUserData.id,
        validator_id: currentUserData.validator_id,
        description: desc
    });

    if (error) alert("Error al enviar");
    else {
        alert("Tarea enviada para validación.");
        document.getElementById('task-desc').value = "";
    }
}

// Lógica Validador: Ver Tareas de sus Aspirantes
async function loadPendingTasks(valId) {
    const { data } = await _merit.from('tasks')
        .select('*, profiles(email)')
        .eq('validator_id', valId)
        .eq('status', 'pendiente');

    const list = document.getElementById('task-list');
    list.innerHTML = data?.length ? "" : "No hay tareas pendientes.";
    data?.forEach(t => {
        list.innerHTML += `<li style="margin-bottom:5px; color:#ccc;">
            <strong>${t.profiles.email}:</strong> ${t.description}
        </li>`;
    });
}

async function loadMyAspirants(myId) {
    const { data } = await _merit.from('profiles').select('*').eq('validator_id', myId);
    const sel = document.getElementById('user-selector');
    sel.innerHTML = '<option value="">Elige Aspirante para premiar</option>';
    data?.forEach(a => {
        sel.innerHTML += `<option value="${a.id}">${a.email}</option>`;
    });
}

async function assignXP() {
    const target = document.getElementById('user-selector').value;
    const pts = parseInt(document.getElementById('difficulty').value);
    if (!target) return alert("Selecciona a alguien.");

    const { data: current } = await _merit.from('profiles').select('xp').eq('id', target).single();
    let newXP = (current.xp || 0) + pts;
    let newLvl = Math.floor(newXP / 100) + 1;

    await _merit.from('profiles').update({ xp: newXP, level: newLvl }).eq('id', target);
    
    // Marcar tareas del usuario como completadas
    await _merit.from('tasks').update({ status: 'validada' }).eq('aspirante_id', target).eq('validator_id', currentUserData.id);

    alert("¡Mérito validado y puntos asignados!");
    location.reload(); 
}

function signOut() {
    _merit.auth.signOut();
    location.reload();
}