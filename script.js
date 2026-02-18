// Configuración de Conexión
const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3e0Ix4sJACOduGvQ_wVw4Fw57"; 

// createClient: Crea el enlace de comunicación entre tu web y Supabase
const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// signUp: Registra al usuario en el sistema de Autenticación
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) return alert("Completa los campos.");

    const { data, error } = await _merit.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message);
    else alert("¡Registro enviado! Revisa tu email para activar la cuenta.");
}

// signIn: Inicia sesión y dispara la carga del perfil
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // await: Detiene la ejecución hasta que el servidor responda (promesa)
    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
    else loadProfile(data.user.id);
}

// loadProfile: Busca los datos en la tabla 'profiles' creada por SQL
async function loadProfile(userId) {
    // .from().select().eq(): Busca en la tabla 'profiles' donde el ID coincida
    // .single(): Devuelve un objeto directo en lugar de un arreglo/lista
    const { data: profile, error } = await _merit
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error cargando perfil:", error);
        return alert("Perfil no encontrado. ¿Confirmaste tu correo?");
    }

    // Inyectamos los datos en el HTML (UI)
    document.getElementById('user-role').innerText = profile.role.toUpperCase();
    document.getElementById('user-xp').innerText = profile.xp;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('my-id').innerText = profile.id;

    // Lógica condicional: Si el rol es validador, habilitamos el panel
    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
    }
    showDashboard();
}

// assignXP: Lógica del Líder para otorgar puntos a otros
async function assignXP() {
    const targetId = document.getElementById('target-id').value.trim();
    const points = parseInt(document.getElementById('difficulty').value);

    if (!targetId) return alert("Ingresa el ID del aspirante.");

    // 1. Obtenemos XP actual del objetivo
    const { data: target } = await _merit.from('profiles').select('xp').eq('id', targetId).single();

    if (!target) return alert("Usuario no encontrado.");

    // 2. .update(): Palabra reservada para modificar datos existentes
    const { error } = await _merit
        .from('profiles')
        .update({ xp: target.xp + points })
        .eq('id', targetId);

    if (error) alert("Error de permisos: " + error.message);
    else {
        alert(`¡Puntos asignados! +${points} XP`);
        document.getElementById('target-id').value = "";
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