const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3eOlk4sJACOduGvQ_wVw4Fw57"; 
const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Ejecutar al cargar la página: Llenar la lista de validadores para el registro
document.addEventListener('DOMContentLoaded', fetchAllValidators);

async function fetchAllValidators() {
    const { data: validators, error } = await _merit
        .from('profiles')
        .select('id, email')
        .eq('role', 'validador');

    const list = document.getElementById('validator-list');
    if (error || !validators) {
        list.innerHTML = '<option value="">Error al cargar</option>';
        return;
    }

    list.innerHTML = '<option value="">-- Elige a tu Mentor --</option>';
    validators.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.text = v.email;
        list.appendChild(opt);
    });
}

async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const valId = document.getElementById('validator-list').value;

    if (!email || !password) return alert("Completa los datos.");
    if (!valId) return alert("Debes seleccionar un Validador para registrarte.");

    const { error } = await _merit.auth.signUp({
        email,
        password,
        options: { data: { validator_id: valId } }
    });

    if (error) alert("Error: " + error.message);
    else alert("¡Registro exitoso! Confirma tu correo.");
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    if (error) alert("Credenciales inválidas");
    else loadProfile(data.user.id);
}

async function loadProfile(userId) {
    const { data: profile, error } = await _merit.from('profiles').select('*').eq('id', userId).single();
    if (error) return alert("Perfil no encontrado.");

    document.getElementById('user-role').innerText = profile.role.toUpperCase();
    document.getElementById('user-xp').innerText = profile.xp;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('my-id').innerText = profile.id;

    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
        fetchMyAspirants(profile.id);
    }
    showDashboard();
}

async function fetchMyAspirants(myId) {
    const { data: aspirants, error } = await _merit
        .from('profiles')
        .select('id, email, xp, level')
        .eq('validator_id', myId);

    const selector = document.getElementById('user-selector');
    selector.innerHTML = '<option value="">-- Elige un Aspirante --</option>';

    if (aspirants && aspirants.length > 0) {
        aspirants.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.text = `${user.email} (Lvl: ${user.level})`;
            selector.appendChild(option);
        });
    } else {
        selector.innerHTML = '<option value="">Sin aspirantes asignados</option>';
    }
}

async function assignXP() {
    const targetId = document.getElementById('user-selector').value;
    const points = parseInt(document.getElementById('difficulty').value);
    if (!targetId) return alert("Selecciona a alguien.");

    const { data: target } = await _merit.from('profiles').select('xp').eq('id', targetId).single();
    
    let totalXP = target.xp + points;
    let newLevel = Math.floor(totalXP / 100) + 1;

    const { error } = await _merit.from('profiles').update({ xp: totalXP, level: newLevel }).eq('id', targetId);

    if (error) alert("Error al asignar");
    else {
        alert("¡Progreso actualizado!");
        const { data } = await _merit.auth.getUser();
        fetchMyAspirants(data.user.id);
    }
}

function showDashboard() {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

async function signOut() {
    await _merit.auth.signOut();
    location.reload();
}