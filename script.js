// Configuración de Conexión
const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3eOlk4sJACOduGvQ_wVw4Fw57"; 

const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Registro
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) return alert("Completa los campos.");

    const { data, error } = await _merit.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message);
    else alert("¡Registro enviado! Revisa tu email para activar la cuenta.");
}

// Inicio de Sesión
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
    else loadProfile(data.user.id);
}

// Carga del perfil y lógica de roles
async function loadProfile(userId) {
    const { data: profile, error } = await _merit
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error cargando perfil:", error);
        return alert("Perfil no encontrado.");
    }

    document.getElementById('user-role').innerText = profile.role.toUpperCase();
    document.getElementById('user-xp').innerText = profile.xp;
    document.getElementById('user-level').innerText = profile.level;
    document.getElementById('my-id').innerText = profile.id;

    // Si eres validador, mostramos el panel y cargamos la lista de otros usuarios
    if (profile.role === 'validador') {
        document.getElementById('validator-panel').style.display = 'block';
        fetchAspirants(); // Función para llenar la lista
    }
    showDashboard();
}

// NUEVA FUNCIÓN: Obtiene la lista de usuarios que no son validadores
async function fetchAspirants() {
    const { data: aspirants, error } = await _merit
        .from('profiles')
        .select('id, email, xp, level')
        .eq('role', 'aspirante'); // Solo trae a los que tienen rol aspirante

    if (error) return console.error("Error cargando lista:", error);

    const selector = document.getElementById('user-selector');
    selector.innerHTML = '<option value="">-- Selecciona un Usuario --</option>';

    aspirants.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        // Mostramos el email y sus stats actuales para que sepas a quién eliges
        option.text = `${user.email} (Nvl: ${user.level} | XP: ${user.xp})`;
        selector.appendChild(option);
    });
}

// Asignación de XP con subida de nivel automática
async function assignXP() {
    const targetId = document.getElementById('user-selector').value;
    const pointsToAdd = parseInt(document.getElementById('difficulty').value);

    if (!targetId) return alert("Por favor, selecciona un aspirante de la lista.");

    // 1. Obtenemos datos del usuario seleccionado
    const { data: target, error: fetchError } = await _merit
        .from('profiles')
        .select('xp, level')
        .eq('id', targetId)
        .single();

    if (fetchError || !target) return alert("No se pudo obtener la información del usuario.");

    // 2. Calculamos nueva XP y Nivel (Subida cada 100 XP)
    let totalXP = target.xp + pointsToAdd;
    let newLevel = Math.floor(totalXP / 100) + 1; 

    // 3. Actualizamos en Supabase
    const { error: updateError } = await _merit
        .from('profiles')
        .update({ 
            xp: totalXP, 
            level: newLevel 
        })
        .eq('id', targetId);

    if (updateError) {
        alert("No tienes permisos suficientes.");
    } else {
        alert(`¡Logro validado! El usuario ahora tiene ${totalXP} XP.`);
        
        // Refrescamos la lista para ver los cambios de inmediato
        fetchAspirants();
        
        // Si te validaste a ti mismo (si fueras aspirante), actualizamos tu vista principal
        const currentUserId = (await _merit.auth.getUser()).data.user.id;
        if (targetId === currentUserId) {
            loadProfile(currentUserId);
        }
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