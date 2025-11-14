# 🚀 TaskFlow: A Collaborative Task Management App

TaskFlow is a full-stack web application designed for collaborative task management, aimed at small development teams. It allows users to create, track, share, and comment on tasks in real-time.

This project was built as part of the **"Mise en Situation Dev" (Dev Scenarios)** module at INGÉTIS, with a **7-hour time limit**.

## Context

* **Program**: Bachelor in IT Development
* **Module**: User-Side Dev Scenarios
* **Objective**: Design a complete, connected web application (Front-end + API + Supabase DB).

---

## ✨ Core Features

This project successfully implements all 5 functional modules from the brief:

### 1. 🔐 Authentication Module
* Secure user registration and login pages (`signup.html`, `login.html`).
* Profile management and session persistence.
* Protected routes for `dashboard.html` and `admin.html`.

### 2. 📝 Task Management Module (CRUD)
* **C**reate: Add tasks with a title, description, priority, and due date.
* **R**ead: Display an interactive list of the user's assigned tasks.
* **U**pdate: Modify task status, content, and priority via a pop-up modal.
* **D**elete: Remove tasks (with permission checks).

### 3. 🤝 Collaboration & Sharing Module
* **Task Sharing**: A task's creator can share it with other registered users.
* **Permissions**: "Creator" and "Contributor" roles manage access rights (e.g., only creators can delete).
* **Comments**: A real-time comment section on each task for all assigned members.

### 4. 📊 Dashboard Module
* **User Stats**: Displays lists of urgent and overdue tasks.
* **Pie Chart**: Visualizes the user's tasks by status ("To Do", "In Progress") using **Chart.js**.

### 5. 👑 Administration Module
* **Secure Page**: `admin.html` is accessible only to users with the "admin" role.
* **User Management**: View, delete, and **change the role** of all users in the system.
* **Task Overview**: View *all* tasks from *all* users on the platform.
* **General Stats**: Displays system-wide counts (total users, total tasks, total comments).

---

## 🛠️ Tech Stack & Architecture

The application is built on a **3-Tier Architecture**:

* **Frontend (Client)**
    * `HTML5`, `CSS3`
    * `JavaScript (ES6+)`: DOM manipulation, `fetch` API calls, UI logic.
    * `Chart.js`: For the dashboard statistics chart.
    * `Supabase-JS`: Used for secure authentication (`signUp`, `signInWithPassword`).

* **Backend (Server)**
    * `PHP 8`: Serves as a **REST API** for all business logic.
    * API endpoints (e.g., `create_task.php`, `get_stats.php`) handle requests, validate permissions, and interact with the database.

* **Database (Storage)**
    * `Supabase (PostgreSQL)`: Remote database for storing users, tasks, shares, and comments.
    * `Supabase Auth`: Manages secure authentication and user profiles.



---

## ⚡ How to Run Locally

To get this project running on your local machine, follow these steps.

### 1. Prerequisites
* A local PHP server environment (XAMPP, WAMP, or PHP's built-in server).
* A free Supabase account.

### 2. Supabase Setup
1.  Create a new Supabase project.
2.  Go to the `SQL Editor` and run the SQL script (you can find this in `schema.sql` or build it from the project) to create the 4 tables:
    * `profiles`
    * `tasks`
    * `task_assignments`
    * `comments`
3.  Go to `Authentication` > `Providers` > `Email` and **disable "Confirm email"** to make testing easier.

### 3. Local Project Setup
1.  Clone or download this repository:
    ```sh
    git clone [https://github.com/YourUsername/TaskFlow.git](https://github.com/YourUsername/TaskFlow.git)
    cd TaskFlow
    ```
2.  **Fill in API Keys**: You must add your Supabase credentials in **all** of the following files:

    * **Backend (PHP):**
        * `api/db.php`: Fill in your database connection string (Host, Password) from Supabase `Settings` > `Database`.

    * **Frontend (JavaScript):**
        * `assets/js/login.js`
        * `assets/js/signup.js`
        * `assets/js/dashboard.js`
        * `assets/js/admin.js`

    In all `*.js` files, replace these two lines at the top:
    ```javascript
    const SUPABASE_URL = 'YOUR_SUPABASE_URL';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
    ```
    You can find these keys in your Supabase project under `Settings` > `API`.

### 4. Run the Application
This project uses a PHP API and **will not work** if you open the `*.html` files directly (e.g., `file:///...`). You **must** use a PHP-capable server.

The easiest way is to use PHP's built-in server:

1.  Open a terminal in the root `TaskFlow/` directory.
2.  Run the following command:
    ```sh
    php -S localhost:8000
    ```
3.  Open your browser and navigate to:
    **`http://localhost:8000/login.html`** or **`http://localhost:8000/signup.html`**

You are now ready to use the application!
