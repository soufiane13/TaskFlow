// Remplacez ces valeurs par les vôtres !
const SUPABASE_URL = 'https://nlrihcskrztcqkmfjcxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmloY3Nrcnp0Y3FrbWZqY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxNTgsImV4cCI6MjA3ODY4NDE1OH0.5t1fqQwUWSVdIhrnQUttazBS_MJMwZ-TDcQ2wSggigw';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Récupération des éléments
const btnLogin = document.getElementById('btnLogin');
const message = document.getElementById('message');

// --- Connexion ---
btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        message.textContent = "Erreur de connexion: " + error.message;
    } else {
        message.textContent = "Connexion réussie ! Redirection...";
        console.log("Connecté:", data.user);
        
    }

    if (error) {
        message.textContent = "Erreur de connexion: " + error.message;
    } else {
        message.textContent = "Connexion réussie ! Redirection...";
        
        window.location.href = "dashboard.html"; 
    }

});