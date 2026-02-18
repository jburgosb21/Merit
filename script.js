const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3e0Ix4sJACOduGvQ_wVw4Fw57"; 

const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

    if (!valId) return alert("Selecciona un mentor antes de registrarte.");

    const { data, error } = await _merit.auth.signUp({
        email, password,
        options: { data: { validator_id: valId } }
    });

    if (error) alert("Error: " + error.message);
    else alert("¡Registro listo! Si el correo no llega, revisa la tabla 'profiles' en Supabase.");
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Credenciales incorrectas.");
    } else {
        checkProfile(data.user.id);
    }
}

async function checkProfile(uid) {
    const { data: profile, error } = await _merit.from('profiles').select('*').eq('id', uid).single();
    
    if (!profile) {
        console.log("No hay perfil para este ID:", uid);
        return alert("Tu usuario existe pero no tiene perfil. ¿Ejecutaste el SQL del paso 1?");
    }

    document.getElementById('user-role').innerText = profile.role;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('user-xp').innerText = profile.xp;

    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
        loadMyAspirants(uid);
    }
    
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

async function loadMyAspirants(myId) {
    const { data } = await _merit.from('profiles').select('*').eq('validator_id', myId);
    const sel = document.getElementById('user-selector');
    sel.innerHTML = '<option value="">Elige Aspirante</option>';
    data?.forEach(a => {
        sel.innerHTML += `<option value="${a.id}">${a.email}</option>`;
    });
}

async function assignXP() {
    const target = document.getElementById('user-selector').value;
    const pts = parseInt(document.getElementById('difficulty').value);
    
    const { data: current } = await _merit.from('profiles').select('xp').eq('id', target).single();
    let newXP = (current.xp || 0) + pts;
    let newLvl = Math.floor(newXP / 100) + 1;

    await _merit.from('profiles').update({ xp: newXP, level: newLvl }).eq('id', target);
    alert("¡Mérito validado!");
    location.reload(); 
}

function signOut() {
    _merit.auth.signOut();
    location.reload();
}