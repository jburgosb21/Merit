const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3e0Ix4sJACOduGvQ_wVw4Fw57"; 
const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Al cargar la web, llenamos la lista de Validadores
document.addEventListener('DOMContentLoaded', fetchValidators);

async function fetchValidators() {
    const { data, error } = await _merit.from('profiles').select('id, email').eq('role', 'validador');
    const list = document.getElementById('validator-list');
    if (error) return list.innerHTML = '<option>Error al cargar</option>';
    
    list.innerHTML = '<option value="">-- Elige un Validador --</option>';
    data.forEach(v => {
        let opt = document.createElement('option');
        opt.value = v.id;
        opt.text = v.email;
        list.appendChild(opt);
    });
}

async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const valId = document.getElementById('validator-list').value;

    if (!valId) return alert("Debes elegir un Validador.");

    const { error } = await _merit.auth.signUp({
        email, password,
        options: { data: { validator_id: valId } }
    });

    if (error) alert(error.message);
    else alert("¡Registrado! Revisa tu email.");
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    if (error) alert("Error de acceso.");
    else loadProfile(data.user.id);
}

async function loadProfile(userId) {
    const { data: profile } = await _merit.from('profiles').select('*').eq('id', userId).single();
    
    document.getElementById('user-role').innerText = profile.role.toUpperCase();
    document.getElementById('user-xp').innerText = profile.xp;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('my-id').innerText = profile.id;

    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
        fetchAspirants(profile.id);
    }
    
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

async function fetchAspirants(valId) {
    const { data } = await _merit.from('profiles').select('*').eq('validator_id', valId);
    const sel = document.getElementById('user-selector');
    sel.innerHTML = '<option value="">Selecciona Aspirante</option>';
    data.forEach(a => {
        let opt = document.createElement('option');
        opt.value = a.id;
        opt.text = `${a.email} (XP: ${a.xp})`;
        sel.appendChild(opt);
    });
}

async function assignXP() {
    const targetId = document.getElementById('user-selector').value;
    const points = parseInt(document.getElementById('difficulty').value);
    
    const { data: target } = await _merit.from('profiles').select('xp').eq('id', targetId).single();
    let newXP = target.xp + points;
    let newLvl = Math.floor(newXP / 100) + 1;

    await _merit.from('profiles').update({ xp: newXP, level: newLvl }).eq('id', targetId);
    alert("¡Puntos otorgados!");
    loadProfile((await _merit.auth.getUser()).data.user.id);
}

async function signOut() {
    await _merit.auth.signOut();
    location.reload();
}