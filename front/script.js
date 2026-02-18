// Configuración extraída de tus capturas
const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK-PZE3e0Ix4sJACOduGvQ_wVw4Fw57"; 

// Inicialización del cliente
const _merit = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Función para registrarse
async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        return alert("Por favor, ingresa email y contraseña.");
    }

    const { data, error } = await _merit.auth.signUp({ email, password });
    
    if (error) {
        alert("Error en el registro: " + error.message);
    } else {
        alert("¡Registro exitoso! Revisa tu correo (y la carpeta de Spam) para confirmar tu cuenta.");
    }
}

// Función para iniciar sesión
async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _merit.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Error al entrar: " + error.message);
    } else {
        showDashboard();
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