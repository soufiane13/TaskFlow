// Remplacez ces valeurs par les vôtres !
const SUPABASE_URL = 'https://nlrihcskrztcqkmfjcxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmloY3Nrcnp0Y3FrbWZqY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxNTgsImV4cCI6MjA3ODY4NDE1OH0.5t1fqQwUWSVdIhrnQUttazBS_MJMwZ-TDcQ2wSggigw';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Récupération des éléments
const btnSignup = document.getElementById('btnSignup');
const message = document.getElementById('message');

// --- Inscription ---
btnSignup.addEventListener('click', async () => {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    //  Auth
    const { data: authData, error: authError } = await _supabase.auth.signUp({
        email: email,
        password: password
    });

    if (authError) {
        message.textContent = "Erreur d'inscription: " + authError.message;
        return;
    }

    // Profil
    const { error: profileError } = await _supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: fullname
    });

    if (profileError) {
        message.textContent = "Erreur création profil: " + profileError.message;
    } else {
        message.textContent = "Inscription réussie ! Vous pouvez maintenant vous connecter.";
        // On redirige vers la page de connexion après 2 secondes
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    }
});