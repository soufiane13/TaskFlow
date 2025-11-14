// Remplacez ces valeurs par les vôtres !
const SUPABASE_URL = 'https://nlrihcskrztcqkmfjcxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmloY3Nrcnp0Y3FrbWZqY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxNTgsImV4cCI6MjA3ODY4NDE1OH0.5t1fqQwUWSVdIhrnQUttazBS_MJMwZ-TDcQ2wSggigw';


const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserId = null;
let myStatusChart = null; //  garder une référence au graphique

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', async () => {
    
    const { data: { session }, error } = await _supabase.auth.getSession();
    if (error) { console.error("Erreur session:", error); return; }

    if (!session) {
        alert("Vous devez être connecté.");
        window.location.href = "login.html";
    } else {
        currentUserId = session.user.id;
        document.getElementById('userInfo').textContent = `Bonjour, ${session.user.email}`;

        
        //  vérifie le rôle pour afficher le bouton Admin
        try {
            const { data: profile, error: profileError } = await _supabase
                .from('profiles')
                .select('role')
                .eq('id', currentUserId)
                .single();

            if (profileError) throw profileError;

            // Si l'utilisateur est un admin, on affiche le bouton
            if (profile.role === 'admin') {
                const adminButton = document.getElementById('btnGoToAdmin');
                adminButton.style.display = 'inline-block'; 
                adminButton.addEventListener('click', () => {
                    window.location.href = 'admin.html'; 
                });
            }

        } catch (dbError) {
            console.error("Erreur de vérification du rôle (dashboard):", dbError);
            
        }
        
        
        setupLogout();
        setupTaskForms();
        setupEditModal();
        setupShareModal();
        setupCommentModal();
        loadTasks(); 
        loadStats();
    }
});


// ---  LOGIQUE : Déconnexion ---
function setupLogout() {
    document.getElementById('btnLogout').addEventListener('click', async () => {
        await _supabase.auth.signOut();
        window.location.href = "login.html";
    });
}

// ---  LOGIQUE : CRUD (Create) ---
function setupTaskForms() {
    const form = document.getElementById('formAddTask');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const taskData = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDesc').value,
                due_date: document.getElementById('taskDueDate').value || null,
                priority: document.getElementById('taskPriority').value,
                user_id: currentUserId
            };
            try {
                const result = await apiCall('api/create_task.php', taskData);
                if (result.error) {
                    alert('Erreur création: ' + result.error);
                } else {
                    alert('Tâche ajoutée !');
                    form.reset();
                    loadTasks(); 
                }
            } catch (error) {
                alert("Erreur de connexion API (create).");
            }
        });
    }
}

// ---  LOGIQUE : CRUD (Read) ---
async function loadTasks() {
    if (!currentUserId) return;
    try {
        const response = await fetch(`api/get_tasks.php?user_id=${currentUserId}`);
        const tasks = await response.json();
        if (tasks.error) {
            alert("Erreur chargement tâches: " + tasks.error);
        } else {
            displayTasks(tasks);
        }
    } catch (error) {
        console.error("Erreur fetch tasks:", error);
        alert("Impossible de charger les tâches.");
    }
}

// ---  LOGIQUE : Affichage (Read) + Delete + Liens Modales ---
function displayTasks(tasks) {
    const taskListDiv = document.getElementById('taskList');
    const noTasksMsg = document.getElementById('noTasksMessage');
    let container = document.getElementById('tasks-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'tasks-container';
        taskListDiv.appendChild(container);
    }
    container.innerHTML = ''; 

    if (tasks.length === 0) {
        noTasksMsg.style.display = 'block';
    } else {
        noTasksMsg.style.display = 'none';
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = `task-card priority-${task.priority}`;
            taskCard.dataset.taskId = task.id; 
            
            let formattedDate = 'Pas de date limite';
            let inputDate = '';
            if (task.due_date) {
                const dateObj = new Date(task.due_date);
                formattedDate = dateObj.toLocaleDateString('fr-FR');
                inputDate = dateObj.toISOString().split('T')[0];
            }

            taskCard.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.description || 'Pas de description'}</p>
                <div class="task-footer">
                    <span>Priorité: ${task.priority}</span>
                    <span>Statut: ${task.status}</span>
                    <span>Date limite: ${formattedDate}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-comments">Commentaires</button>
                    <button class="btn-share">Partager</button>
                    <button class="btn-edit">Modifier</button>
                    <button class="btn-delete">Supprimer</button>
                </div>
            `;
            container.appendChild(taskCard);

            // --- Logique Delete ---
            taskCard.querySelector('.btn-delete').addEventListener('click', async () => {
                if (!confirm("Vraiment supprimer cette tâche ?")) return;
                try {
                    const result = await apiCall('api/delete_task.php', { task_id: task.id, user_id: currentUserId });
                    if (result.error) {
                        alert("Erreur suppression: " + result.error);
                    } else {
                        alert("Tâche supprimée !");
                        loadTasks();
                    }
                } catch (error) {
                    alert("Erreur API (delete).");
                }
            });

            // --- Logique Update  ---
            taskCard.querySelector('.btn-edit').addEventListener('click', () => {
                document.getElementById('editTaskId').value = task.id;
                document.getElementById('editTaskTitle').value = task.title;
                document.getElementById('editTaskDesc').value = task.description || '';
                document.getElementById('editTaskDueDate').value = inputDate;
                document.getElementById('editTaskPriority').value = task.priority;
                document.getElementById('editTaskStatus').value = task.status;
                document.getElementById('editModal').style.display = 'flex';
            });

            // --- Logique Partage  ---
            taskCard.querySelector('.btn-share').addEventListener('click', () => {
                document.getElementById('shareTaskId').value = task.id;
                loadUsersForSharing();
            });

            //  Logique Commentaires  **
            taskCard.querySelector('.btn-comments').addEventListener('click', () => {
                //  stocke l'ID de la tâche pour le formulaire
                document.getElementById('commentTaskId').value = task.id;
                // charge les commentaires de cette tâche
                loadComments(task.id);
            });
        });
    }
}

// ---  LOGIQUE : CRUD (Update ) ---
function setupEditModal() {
    const modal = document.getElementById('editModal');
    const closeModalBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('formEditTask');

    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskData = {
            task_id: document.getElementById('editTaskId').value,
            title: document.getElementById('editTaskTitle').value,
            description: document.getElementById('editTaskDesc').value,
            due_date: document.getElementById('editTaskDueDate').value || null,
            priority: document.getElementById('editTaskPriority').value,
            status: document.getElementById('editTaskStatus').value,
            user_id: currentUserId
        };

        try {
            const result = await apiCall('api/update_task.php', taskData);
            if (result.error) {
                alert("Erreur modification: " + result.error);
            } else {
                alert("Tâche mise à jour !");
                modal.style.display = 'none';
                loadTasks();
                
            }
        } catch (error) {
            alert("Erreur API (update).");
        }
    });
}

// --- LOGIQUE : Partage ---
function setupShareModal() {
    const modal = document.getElementById('shareModal');
    const closeModalBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('formShareTask');

    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const shareData = {
            task_id: document.getElementById('shareTaskId').value,
            user_to_share_with: document.getElementById('userToShare').value,
            current_user_id: currentUserId
        };
        if (!shareData.user_to_share_with) {
            alert("Veuillez choisir un utilisateur.");
            return;
        }
        try {
            const result = await apiCall('api/share_task.php', shareData);
            if (result.error) {
                alert("Erreur de partage: " + result.error);
            } else {
                alert("Tâche partagée avec succès !");
                modal.style.display = 'none';
            }
        } catch (error) {
            alert("Erreur API (share).");
        }
    });
}

async function loadUsersForSharing() {
    const select = document.getElementById('userToShare');
    select.innerHTML = '<option value="">-- Chargement... --</option>';
    try {
        const response = await fetch(`api/get_all_users.php?current_user_id=${currentUserId}`);
        const users = await response.json();
        if (users.error) {
            select.innerHTML = `<option value="">Erreur</option>`;
            alert("Erreur chargement utilisateurs: " + users.error);
        } else {
            select.innerHTML = '<option value="">-- Choisir un utilisateur --</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.full_name;
                select.appendChild(option);
            });
            document.getElementById('shareModal').style.display = 'flex';
        }
    } catch (error) {
        console.error("Erreur fetch users:", error);
        alert("Impossible de charger les utilisateurs.");
    }
}


// ---  LOGIQUE : Commentaires  ---

function setupCommentModal() {
    const modal = document.getElementById('commentModal');
    const closeModalBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('formAddComment');

    // Gérer la fermeture
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Gérer l'envoi d'un nouveau commentaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const commentData = {
            task_id: document.getElementById('commentTaskId').value,
            user_id: currentUserId,
            content: document.getElementById('commentContent').value
        };

        if (!commentData.content) {
            alert("Le commentaire ne peut pas être vide.");
            return;
        }

        try {
            const result = await apiCall('api/add_comment.php', commentData);
            if (result.error) {
                alert("Erreur d'ajout commentaire: " + result.error);
            } else {
                
                form.reset();
                loadComments(commentData.task_id); // Recharger les commentaires
            }
        } catch (error) {
            alert("Erreur API (add_comment).");
        }
    });
}

async function loadComments(taskId) {
    const commentListDiv = document.getElementById('commentList');
    commentListDiv.innerHTML = "Chargement des commentaires...";
    
    // affiche la modale PENDANT le chargement
    document.getElementById('commentModal').style.display = 'flex';

    try {
        const response = await fetch(`api/get_comments.php?task_id=${taskId}`);
        const comments = await response.json();

        if (comments.error) {
            commentListDiv.innerHTML = "Erreur de chargement des commentaires.";
            alert("Erreur: " + comments.error);
        } else {
            displayComments(comments);
        }
    } catch (error) {
        console.error("Erreur fetch comments:", error);
        alert("Impossible de charger les commentaires.");
    }
}

function displayComments(comments) {
    const commentListDiv = document.getElementById('commentList');
    commentListDiv.innerHTML = ''; // Vider la liste

    if (comments.length === 0) {
        commentListDiv.innerHTML = "<p>Aucun commentaire pour l'instant.</p>";
    } else {
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            
            const formattedDate = new Date(comment.created_at).toLocaleString('fr-FR');

            commentDiv.innerHTML = `
                <div>
                    <span class="comment-author">${comment.author_name}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <p class="comment-content">${comment.content}</p>
            `;
            commentListDiv.appendChild(commentDiv);
        });
        
        commentListDiv.scrollTop = commentListDiv.scrollHeight;
    }
}


// --- FONCTION UTILITAIRE ---
async function apiCall(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error(`Erreur API ${url}:`, error);
        throw new Error(`Erreur de connexion à l'API (${url}).`);
    }
}




// ---LOGIQUE : (Dashboard Stats) ---


async function loadStats() {
    if (!currentUserId) return;
    
    try {
        const response = await fetch(`api/get_stats.php?user_id=${currentUserId}`);
        const stats = await response.json();

        if (stats.error) {
            console.error("Erreur chargement stats: " + stats.error);
        } else {
            // affiche les listes
            displayStatsList(document.getElementById('urgentTasksList'), stats.urgent_tasks);
            displayStatsList(document.getElementById('lateTasksList'), stats.late_tasks);
            
            // affiche le graphique
            displayStatusChart(stats.stats_by_status);
        }
    } catch (error) {
        console.error("Erreur fetch stats:", error);
    }
}

function displayStatsList(listElement, items) {
    listElement.innerHTML = ''; // Vider
    if (items.length === 0) {
        listElement.innerHTML = '<li class="no-items">Aucune</li>';
    } else {
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.title;
            listElement.appendChild(li);
        });
    }
}

function displayStatusChart(stats) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    // On extrait les labels  et les données 
    const labels = stats.map(s => s.status);
    const data = stats.map(s => s.count);

    // Si le graphique existe déjà, on le détruit avant d'en créer un nouveau
    if (myStatusChart) {
        myStatusChart.destroy();
    }

    myStatusChart = new Chart(ctx, {
        type: 'pie', // Type de graphique : circulaire
        data: {
            labels: labels,
            datasets: [{
                label: 'Tâches par statut',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)', // Rouge pour 'À faire' ?
                    'rgba(54, 162, 235, 0.7)', // Bleu pour 'En cours' ?
                    'rgba(255, 206, 86, 0.7)', // Jaune
                    'rgba(75, 192, 192, 0.7)', // Vert
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}