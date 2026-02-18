// Configuración de Supabase
const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3e0Ix4sJACOduGvQ_wVw4Fw57"; 
const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Función de Registro
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) return alert("Ingresa datos.");

    const { data, error } = await _merit.auth.signUp({ email, password });
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("¡Registro enviado! Confirma tu correo para poder entrar.");
    }
}

// Inicio de Sesión
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        // Al entrar, cargamos los datos extendidos del perfil
        loadProfile(data.user.id);
    }
}

// Carga datos desde la tabla 'profiles' que creaste con SQL
async function loadProfile(userId) {
    const { data: profile, error } = await _merit
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error al cargar perfil:", error);
        return;
    }

    // Actualizar UI
    document.getElementById('user-role').innerText = profile.role.toUpperCase();
    document.getElementById('user-xp').innerText = profile.xp;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('my-id').innerText = profile.id;

    // Mostrar panel si es validador
    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
    }

    showDashboard();
}

// Asignar XP a otro usuario (Acción del Líder)
async function assignXP() {
    const targetId = document.getElementById('target-id').value;
    const pointsToAdd = parseInt(document.getElementById('difficulty').value);

    if (!targetId) return alert("Copia y pega el ID del aspirante aquí.");

    // 1. Obtener XP actual del objetivo
    const { data: targetProfile, error: fetchError } = await _merit
        .from('profiles')
        .select('xp')
        .eq('id', targetId)
        .single();

    if (fetchError) return alert("No se encontró al usuario con ese ID.");

    // 2. Sumar puntos
    const newXP = targetProfile.xp + pointsToAdd;

    // 3. Actualizar en Supabase
    const { error: updateError } = await _merit
        .from('profiles')
        .update({ xp: newXP })
        .eq('id', targetId);

    if (updateError) {
        alert("No tienes permisos para realizar esta acción.");
    } else {
        alert(`¡Éxito! Se han otorgado ${pointsToAdd} XP al usuario.`);
        document.getElementById('target-id').value = ""; // Limpiar campo
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