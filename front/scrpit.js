const SUPABASE_URL = "https://kwedbohsgorrwrrtblhg.supabase.co";
const SUPABASE_KEY = "TU_ANON_KEY_AQUI"; // Búscala en Supabase: Settings -> API

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message);
    else alert("Revisa tu email para confirmar registro");
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
    else showDashboard();
}

function showDashboard() {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

async function signOut() {
    await supabase.auth.signOut();
    location.reload();
}