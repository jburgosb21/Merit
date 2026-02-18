// Configuración de Conexión
const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3eOlk4sJACOduGvQ_wVw4Fw57"; 

// createClient: Establece el túnel de comunicación con Supabase
const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// signUp: Crea el registro en el sistema de Autenticación
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) return alert("Completa los campos.");

    const { data, error } = await _merit.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message);
    else alert("¡Registro enviado! Revisa tu email para activar la cuenta.");
}

// signIn: Valida credenciales e inicia la carga del perfil
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
    else loadProfile(data.user.id);
}

// loadProfile: Trae la "ficha de personaje" desde la tabla 'profiles'
async function loadProfile(userId) {
    const { data: profile, error } = await _merit
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error cargando perfil:", error);
        return alert("Perfil no encontrado. ¿Confirmaste tu correo o creaste la fila en la tabla profiles?");
    }

    // Inyectamos los datos en el HTML
    document.getElementById('user-role').innerText = profile.role.toUpperCase();
    document.getElementById('user-xp').innerText = profile.xp;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('my-id').innerText = profile.id;

    // Solo el Validador ve el panel de administración
    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
    }
    showDashboard();
}

// assignXP: Lógica central para otorgar puntos y CALCULAR NIVEL
async function assignXP() {
    const targetId = document.getElementById('target-id').value.trim();
    const pointsToAdd = parseInt(document.getElementById('difficulty').value);

    if (!targetId) return alert("Ingresa el ID del aspirante.");

    // 1. Obtenemos datos actuales (XP y Nivel) del objetivo
    const { data: target, error: fetchError } = await _merit
        .from('profiles')
        .select('xp, level')
        .eq('id', targetId)
        .single();

    if (fetchError || !target) return alert("Usuario no encontrado.");

    // 2. Cálculo de nueva XP y nuevo Nivel
    // Definimos que cada 100 XP se sube un nivel
    let totalXP = target.xp + pointsToAdd;
    let newLevel = Math.floor(totalXP / 100) + 1; 

    // 3. Actualizamos la base de datos con los nuevos valores
    const { error: updateError } = await _merit
        .from('profiles')
        .update({ 
            xp: totalXP, 
            level: newLevel 
        })
        .eq('id', targetId);

    if (updateError) {
        alert("Error de permisos: " + updateError.message);
    } else {
        alert(`¡Éxito! +${pointsToAdd} XP asignados. Nivel actual: ${newLevel}`);
        document.getElementById('target-id').value = "";
        
        // Si el usuario que validaste eres tú mismo, actualizamos tu vista
        const currentUserId = (await _merit.auth.getUser()).data.user.id;
        if (targetId === currentUserId) {
            loadProfile(currentUserId);
        }
    }
}

// Funciones de Interfaz
function showDashboard() {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

async function signOut() {
    await _merit.auth.signOut();
    location.reload();
}