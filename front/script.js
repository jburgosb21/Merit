// Configuración de Supabase
const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3e0Ix4sJACOduGvQ_wVw4Fw57"; 

// createClient: Palabra reservada de la librería para establecer el túnel de datos
const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Registro de nuevos usuarios
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) return alert("Ingresa datos.");

    // .signUp: Crea al usuario en el sistema de autenticación de Supabase
    const { data, error } = await _merit.auth.signUp({ email, password });
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("¡Registro enviado! Revisa tu email para activar tu cuenta.");
    }
}

// Inicio de Sesión
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // .signInWithPassword: Valida credenciales y devuelve un 'token' de sesión
    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        // user.id: El identificador único universal (UUID) del usuario
        loadProfile(data.user.id);
    }
}

// Carga datos de la tabla pública 'profiles'
async function loadProfile(userId) {
    // .from('profiles').select('*'): Selecciona todas las columnas de tu tabla
    // .single(): Asegura que solo traiga un objeto, no una lista
    const { data: profile, error } = await _merit
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error al cargar perfil:", error);
        // Si el perfil no existe aún, lo creamos manualmente como respaldo
        return alert("Perfil no encontrado. ¿Confirmaste tu email?");
    }

    // Actualizamos la Interfaz de Usuario (UI) con los datos recibidos
    document.getElementById('user-role').innerText = profile.role.toUpperCase();
    document.getElementById('user-xp').innerText = profile.xp;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('my-id').innerText = profile.id;

    // Lógica de Rol: Si eres 'validador', se muestra el panel secreto
    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
    }

    showDashboard();
}

// Asignar XP (Función exclusiva del Líder)
async function assignXP() {
    const targetId = document.getElementById('target-id').value;
    // .value de un select devuelve el 'value' de la opción marcada
    const pointsToAdd = parseInt(document.getElementById('difficulty').value);

    if (!targetId) return alert("Pega el ID del aspirante.");

    // 1. Buscamos al aspirante para saber cuánta XP tiene actualmente
    const { data: targetProfile, error: fetchError } = await _merit
        .from('profiles')
        .select('xp')
        .eq('id', targetId)
        .single();

    if (fetchError) return alert("ID inválido o usuario no existe.");

    const newXP = targetProfile.xp + pointsToAdd;

    // 2. .update(): Modifica los datos en la base de datos
    // .eq('id', targetId): Es la condición (Solo actualiza donde el ID coincida)
    const { error: updateError } = await _merit
        .from('profiles')
        .update({ xp: newXP })
        .eq('id', targetId);

    if (updateError) {
        alert("Error de permisos: " + updateError.message);
    } else {
        alert(`Mérito otorgado: +${pointsToAdd} XP asignados.`);
        document.getElementById('target-id').value = "";
    }
}

function showDashboard() {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

async function signOut() {
    // .signOut: Cierra la sesión y destruye el token en el navegador
    await _merit.auth.signOut();
    location.reload();
}