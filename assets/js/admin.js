// Remplacez ces valeurs par les vôtres !
const SUPABASE_URL = 'https://nlrihcskrztcqkmfjcxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmloY3Nrcnp0Y3FrbWZqY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxNTgsImV4cCI6MjA3ODY4NDE1OH0.5t1fqQwUWSVdIhrnQUttazBS_MJMwZ-TDcQ2wSggigw';



const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null; 

// SÉCURITÉ : VÉRIFICATION DU RÔLE ADMIN ---
document.addEventListener('DOMContentLoaded', async () => {
    
    const { data: { session }, error } = await _supabase.auth.getSession();
    if (error) { console.error("Erreur session:", error); return; }
    if (!session) {
        alert("Accès refusé. Veuillez vous connecter.");
        window.location.href = "login.html";
        return;
    }

    currentUser = session.user;
    
    try {
        const { data: profile, error: profileError } = await _supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
        if (profileError) throw profileError;

        if (profile.role !== 'admin') {
            alert("Accès réservé aux administrateurs.");
            window.location.href = "dashboard.html";
        } else {
            console.log("Accès Admin autorisé !");
            initializeAdminPanel();
        }

    } catch (dbError) {
        console.error("Erreur vérification rôle:", dbError);
        alert("ERREUR TROUVÉE: " + dbError.message);
        window.location.href = "dashboard.html";
    }
});

// --- 2. INITIALISATION DU PANNEAU ADMIN ---
function initializeAdminPanel() {
    document.getElementById('userInfo').textContent = `Bonjour, Admin ${currentUser.email}`;

    document.getElementById('btnLogout').addEventListener('click', async () => {
        await _supabase.auth.signOut();
        window.location.href = "login.html";
    });
    
    document.getElementById('btnGoToDashboard').addEventListener('click', () => {
        window.location.href = "dashboard.html";
    });

    // On charge toutes les données admin
    loadAllUsers();
    loadAllTasks();
    loadGeneralStats(); 
}

// ---  LOGIQUE ADMIN : Gérer les Utilisateurs ---
async function loadAllUsers() {
    try {
        const response = await fetch('api/get_all_users_admin.php');
        const users = await response.json();
        if (users.error) {
            alert("Erreur chargement utilisateurs: " + users.error);
        } else {
            displayUsers(users);
        }
    } catch (error) {
        console.error("Erreur fetch all users:", error);
        alert("Impossible de charger les utilisateurs.");
    }
}

function displayUsers(users) {
    const usersListBody = document.getElementById('usersList');
    usersListBody.innerHTML = ''; // Vider la liste

    // On sélectionne le <thead> pour ajouter la colonne 'Actions'
    const tableHead = document.querySelector('#usersTable thead tr');
    //  ne l'ajouter qu'une seule fois
    if (!tableHead.querySelector('.th-actions')) {
        const th = document.createElement('th');
        th.className = 'th-actions';
        th.textContent = 'Actions';
        tableHead.appendChild(th);
    }

    if (users.length === 0) {
        usersListBody.innerHTML = '<tr><td colspan="5">Aucun utilisateur trouvé.</td></tr>';
    } else {
        users.forEach(user => {
            const tr = document.createElement('tr');
            const formattedDate = new Date(user.joined_at).toLocaleDateString('fr-FR');
            
            tr.innerHTML = `
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>
                    <select class="role-select" data-user-id="${user.id}" data-current-role="${user.role}">
                        <option value="utilisateur" ${user.role === 'utilisateur' ? 'selected' : ''}>utilisateur</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
                    </select>
                </td>
                <td>${formattedDate}</td>
                <td class="user-actions">
                    ${user.id !== currentUser.id ? 
                        `<button class="btn-delete-user" data-user-id="${user.id}">Supprimer</button>` : 
                        ' (Vous)' 
                    }
                </td>
            `;
            usersListBody.appendChild(tr);
        });

        
        attachUserActions();
    }
}


function attachUserActions() {
    // 1. Gérer le changement de Rôle
    document.querySelectorAll('.role-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const newRole = e.target.value;
            const userId = e.target.dataset.userId;
            const currentRole = e.target.dataset.currentRole;

            if (newRole === currentRole) return; 

            if (confirm(`Voulez-vous vraiment changer le rôle de cet utilisateur en "${newRole}" ?`)) {
                try {
                    const response = await fetch('api/update_user_role.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId, new_role: newRole })
                    });
                    const result = await response.json();
                    
                    if (result.error) {
                        alert("Erreur: " + result.error);
                        e.target.value = currentRole; // Revenir à l'ancien rôle
                    } else {
                        alert("Rôle mis à jour avec succès !");
                        e.target.dataset.currentRole = newRole; // Mettre à jour le rôle actuel
                    }
                } catch (error) {
                    alert("Erreur API de mise à jour du rôle.");
                    e.target.value = currentRole; // Revenir à l'ancien rôle
                }
            } else {
                e.target.value = currentRole; //  a annulé
            }
        });
    });



    //  Gérer la suppression d'utilisateur
    document.querySelectorAll('.btn-delete-user').forEach(button => {
        button.addEventListener('click', async (e) => {
            const userId = e.target.dataset.userId;
            
            if (confirm("ATTENTION !\nSupprimer cet utilisateur supprimera TOUTES ses tâches, commentaires et partages.\n\nÊtes-vous sûr ?")) {
                try {
                    const response = await fetch('api/delete_user.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId })
                    });
                    const result = await response.json();

                    if (result.error) {
                        alert("Erreur: " + result.error);
                    } else {
                        alert("Utilisateur supprimé avec succès !");
                        loadAllUsers(); // Recharger la liste des utilisateurs
                        loadAllTasks(); // Recharger la liste des tâches 
                    }
                } catch (error) {
                    alert("Erreur API de suppression d'utilisateur.");
                }
            }
        });
    });
}
// --- LOGIQUE ADMIN : Gérer les Tâches ---

async function loadAllTasks() {
    try {
        const response = await fetch('api/get_all_tasks_admin.php');
        const tasks = await response.json();

        if (tasks.error) {
            alert("Erreur chargement de toutes les tâches: " + tasks.error);
        } else {
            displayAllTasks(tasks);
        }
    } catch (error) {
        console.error("Erreur fetch all tasks:", error);
        alert("Impossible de charger toutes les tâches.");
    }
}

function displayAllTasks(tasks) {
    const tasksListDiv = document.getElementById('allTasksList');
    tasksListDiv.innerHTML = ''; // Vider la liste

    if (tasks.length === 0) {
        tasksListDiv.innerHTML = '<p>Aucune tâche dans le système.</p>';
    } else {
        tasks.forEach(task => {
            
            const taskCard = document.createElement('div');
            taskCard.className = `task-card priority-${task.priority}`;
            
            let formattedDate = 'Pas de date limite';
            if (task.due_date) {
                formattedDate = new Date(task.due_date).toLocaleDateString('fr-FR');
            }

            // ajoute le nom du créateur
            taskCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>${task.title}</h4>
                    <span style="font-size: 0.9em; color: #555;">Créée par: <strong>${task.creator_name}</strong></span>
                </div>
                <p>${task.description || 'Pas de description'}</p>
                <div class="task-footer">
                    <span>Priorité: ${task.priority}</span>
                    <span>Statut: ${task.status}</span>
                    <span>Date limite: ${formattedDate}</span>
                </div>
            `;
            // admin  boutons "Supprimer la tâche" 
            tasksListDiv.appendChild(taskCard);
        });
    }
}


// --- LOGIQUE ADMIN : Stats Générales ---

async function loadGeneralStats() {
    try {
        const response = await fetch('api/get_general_stats_admin.php');
        const stats = await response.json();

        if (stats.error) {
            console.error("Erreur chargement stats générales: " + stats.error);
        } else {
            //  remplit les boîtes
            document.getElementById('statTotalUsers').textContent = stats.total_users;
            document.getElementById('statTotalTasks').textContent = stats.total_tasks;
            document.getElementById('statTotalComments').textContent = stats.total_comments;
        }
    } catch (error) {
        console.error("Erreur fetch stats générales:", error);
    }
}