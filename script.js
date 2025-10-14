// Global state management
const AppState = {
    currentUser: null,
    registeredUsers: JSON.parse(localStorage.getItem("mydumbbell_users") || "[]"),
    exercises: JSON.parse(localStorage.getItem("mydumbbell_exercises") || "[]"),
    workouts: JSON.parse(localStorage.getItem("mydumbbell_workouts") || "[]"),
    libraryWorkouts: [
        {
            id: 1,
            name: "Treino de Peito Iniciante",
            description: "Treino focado no desenvolvimento do peitoral para iniciantes, com exercícios básicos e eficazes.",
            difficulty: "Iniciante",
            duration: 45,
            exercisesCount: 5,
            author: "João Silva",
            isPublic: true,
        },
        {
            id: 2,
            name: "Treino de Pernas Avançado",
            description: "Um treino intenso para membros inferiores, focado em força e hipertrofia.",
            difficulty: "Avançado",
            duration: 75,
            exercisesCount: 8,
            author: "Maria Fitness",
            isPublic: true,
        },
        {
            id: 3,
            name: "Treino Full Body Intermediário",
            description: "Treino completo para o corpo todo, ideal para quem busca otimizar o tempo.",
            difficulty: "Intermediário",
            duration: 60,
            exercisesCount: 7,
            author: "Pedro Força",
            isPublic: true,
        },
        {
            id: 4,
            name: "Cardio HIIT para Queima de Gordura",
            description: "Sessões curtas e intensas para acelerar o metabolismo e queimar gordura.",
            difficulty: "Iniciante",
            duration: 30,
            exercisesCount: 6,
            author: "Ana Corrida",
            isPublic: true,
        },
    ]
};

// Utility functions
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    const mainNav = document.getElementById("main-nav");
    const header = document.querySelector(".btn-entrar");
    
    // Check if user is trying to access protected pages without authentication
    const protectedPages = ["dashboard", "my-exercises", "create-exercise", "my-workouts", "create-workout", "library", "profile"];
    if (protectedPages.includes(pageId) && !AppState.currentUser) {
        showNotification("Você precisa fazer login para acessar esta página", "error");
        showPage("login");
        return;
    }
    
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.remove("hidden");
            page.style.animation = "fadeIn 0.3s ease-out";
        } else {
            page.classList.add("hidden");
        }
    });
    
    // Show/hide navigation based on authentication
    if (AppState.currentUser && pageId !== "home" && pageId !== "login") {
        mainNav.classList.remove("hidden");
        header.classList.add("hidden");
    } else {
        mainNav.classList.add("hidden");
        header.classList.remove("hidden");
    }
    
    // Update URL hash
    window.location.hash = pageId;
    
    // Update page-specific content
    updatePageContent(pageId);
}

function updatePageContent(pageId) {
    switch (pageId) {
        case "dashboard":
            updateDashboard();
            break;
        case "my-exercises":
            updateMyExercises();
            break;
        case "my-workouts":
            updateMyWorkouts();
            break;
        case "library":
            updateWorkoutLibrary();
            break;
        case "profile":
            updateUserProfile();
            break;
        case "create-workout":
            updateAvailableExercises();
            break;
    }
}

function showNotification(message, type = "success") {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type === "error" ? "error" : ""}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showAuthError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector(".auth-error");
    if (existingError) {
        existingError.remove();
    }
    
    // Create and show new error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "auth-error";
    errorDiv.style.cssText = `
        color: var(--error-600);
        font-size: var(--font-size-sm);
        text-align: center;
        margin-top: var(--spacing-2);
        margin-bottom: var(--spacing-4);
    `;
    errorDiv.textContent = message;
    
    const authForm = document.getElementById("auth-form");
    const submitBtn = document.getElementById("auth-submit-btn");
    authForm.insertBefore(errorDiv, submitBtn);
}

// Navigation handling
function initNavigation() {
    const navLinks = document.querySelectorAll("nav a, a[href^=\"#\"], .nav-link");
    
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute("href").substring(1);
            showPage(targetId);
        });
    });
    
    // Handle browser back/forward
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            showPage(hash);
        }
    });
    
    // Check for existing session on page load
    const savedUser = localStorage.getItem("mydumbbell_current_user");
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        const initialHash = window.location.hash.substring(1);
        showPage(initialHash || "dashboard");
    } else {
        const initialHash = window.location.hash.substring(1);
        showPage(initialHash || "home");
    }
}

// Authentication handling
function initAuth() {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const authForm = document.getElementById("auth-form");
    const nameField = document.getElementById("name-field");
    const confirmPasswordField = document.getElementById("confirm-password-field");
    const authSubmitBtn = document.getElementById("auth-submit-btn");
    const startNowBtn = document.getElementById("start-now");
    const createAccountBtn = document.getElementById("create-account-btn");
    
    let isRegisterMode = false;
    
    function toggleAuthMode() {
        isRegisterMode = !isRegisterMode;
        
        // Clear any existing error messages
        const existingError = document.querySelector(".auth-error");
        if (existingError) {
            existingError.remove();
        }
        
        if (isRegisterMode) {
            nameField.classList.remove("hidden");
            confirmPasswordField.classList.remove("hidden");
            authSubmitBtn.textContent = "Criar Conta";
            loginTab.classList.remove("active");
            registerTab.classList.add("active");
        } else {
            nameField.classList.add("hidden");
            confirmPasswordField.classList.add("hidden");
            authSubmitBtn.textContent = "Entrar";
            registerTab.classList.remove("active");
            loginTab.classList.add("active");
        }
        
        // Clear form fields
        authForm.reset();
    }
    
    if (loginTab) {
        loginTab.addEventListener("click", () => {
            if (isRegisterMode) toggleAuthMode();
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener("click", () => {
            if (!isRegisterMode) toggleAuthMode();
        });
    }
    
    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById("name");
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;
            
            // Clear any existing error messages
            const existingError = document.querySelector(".auth-error");
            if (existingError) {
                existingError.remove();
            }
            
            if (isRegisterMode) {
                // Registration logic
                const name = nameInput.value.trim();
                
                if (!name) {
                    showAuthError("Por favor, preencha seu nome");
                    return;
                }
                
                if (!email) {
                    showAuthError("Por favor, preencha seu email");
                    return;
                }
                
                if (!password) {
                    showAuthError("Por favor, preencha sua senha");
                    return;
                }
                
                if (password !== confirmPassword) {
                    showAuthError("As senhas não coincidem");
                    return;
                }
                
                if (password.length < 6) {
                    showAuthError("A senha deve ter pelo menos 6 caracteres");
                    return;
                }
                
                // Check if user already exists
                const existingUser = AppState.registeredUsers.find(user => user.email === email);
                if (existingUser) {
                    showAuthError("Este email já está cadastrado");
                    return;
                }
                
                // Create new user
                const newUser = {
                    id: generateId(),
                    name: name,
                    email: email,
                    password: password, // In a real app, this would be hashed
                    memberSince: new Date().toLocaleDateString("pt-BR", { 
                        year: "numeric", 
                        month: "long" 
                    }),
                    exercises: [],
                    workouts: []
                };
                
                AppState.registeredUsers.push(newUser);
                saveToLocalStorage("mydumbbell_users", AppState.registeredUsers);
                
                AppState.currentUser = newUser;
                saveToLocalStorage("mydumbbell_current_user", AppState.currentUser);
                
                // Load user-specific data
                AppState.exercises = newUser.exercises || [];
                AppState.workouts = newUser.workouts || [];
                
                showNotification("Conta criada com sucesso!");
                updateUserProfile();
                showPage("dashboard");
                
            } else {
                // Login logic
                if (!email) {
                    showAuthError("Por favor, preencha seu email");
                    return;
                }
                
                if (!password) {
                    showAuthError("Por favor, preencha sua senha");
                    return;
                }
                
                // Find user in registered users
                const user = AppState.registeredUsers.find(u => u.email === email && u.password === password);
                
                if (!user) {
                    showAuthError("Email ou senha incorretos");
                    return;
                }
                
                AppState.currentUser = user;
                saveToLocalStorage("mydumbbell_current_user", AppState.currentUser);
                
                // Load user-specific data
                AppState.exercises = user.exercises || [];
                AppState.workouts = user.workouts || [];
                
                showNotification("Login realizado com sucesso!");
                updateUserProfile();
                showPage("dashboard");
            }
        });
    }
    
    if (startNowBtn) {
        startNowBtn.addEventListener("click", () => showPage("login"));
    }
    
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", () => {
            showPage("login");
            if (!isRegisterMode) toggleAuthMode();
        });
    }
}

function logout() {
    AppState.currentUser = null;
    localStorage.removeItem("mydumbbell_current_user");
    AppState.exercises = [];
    AppState.workouts = [];
    showNotification("Você foi desconectado.");
    showPage("home");
}

// Dashboard functionality
function updateDashboard() {
    if (!AppState.currentUser) return;
    
    // Update welcome message
    const welcomeMessage = document.querySelector("#dashboard .dashboard-title");
    if (welcomeMessage) {
        welcomeMessage.textContent = `Olá, ${AppState.currentUser.name}! 👋`;
    }
    
    // Update statistics
    const totalExercisesEl = document.getElementById("total-exercises");
    const totalWorkoutsEl = document.getElementById("total-workouts");
    
    if (totalExercisesEl) {
        totalExercisesEl.textContent = AppState.exercises.length;
    }
    
    if (totalWorkoutsEl) {
        totalWorkoutsEl.textContent = AppState.workouts.length;
    }
}

// Exercise management
function initExerciseManagement() {
    const createExerciseForm = document.getElementById("create-exercise-form");
    
    if (createExerciseForm) {
        createExerciseForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const exercise = {
                id: generateId(),
                name: document.getElementById("exercise-name").value,
                muscleGroup: document.getElementById("exercise-muscle-group").value,
                description: document.getElementById("exercise-description").value,
                instructions: document.getElementById("exercise-instructions").value,
                isPublic: document.getElementById("exercise-is-public").checked,
                createdAt: new Date().toISOString()
            };
            
            AppState.exercises.push(exercise);
            
            // Update user data in registered users
            const userIndex = AppState.registeredUsers.findIndex(u => u.id === AppState.currentUser.id);
            if (userIndex !== -1) {
                AppState.registeredUsers[userIndex].exercises = AppState.exercises;
                saveToLocalStorage("mydumbbell_users", AppState.registeredUsers);
            }
            
            showNotification("Exercício criado com sucesso!");
            createExerciseForm.reset();
            showPage("my-exercises");
        });
    }
}

function updateMyExercises() {
    const exercisesList = document.getElementById("my-exercises-list");
    if (!exercisesList) return;
    
    if (AppState.exercises.length === 0) {
        exercisesList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">💪</div>
                <h3 class="empty-title">Nenhum exercício encontrado</h3>
                <p class="empty-description">Você ainda não criou nenhum exercício. Comece criando seu primeiro exercício!</p>
                <a href="#create-exercise" class="btn btn-primary">Criar Exercício</a>
            </div>
        `;
        return;
    }
    
    exercisesList.innerHTML = AppState.exercises.map(exercise => `
        <div class="exercise-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3>${exercise.name}</h3>
                <span class="muscle-group">${exercise.muscleGroup}</span>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${exercise.description}</p>
            <p style="font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">${exercise.instructions.substring(0, 100)}...</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                <span>${exercise.isPublic ? "Público" : "Privado"}</span>
                <button onclick="deleteExercise('${exercise.id}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: var(--font-size-sm);">Excluir</button>
            </div>
        </div>
    `).join("");
}

function deleteExercise(exerciseId) {
    if (confirm("Tem certeza que deseja excluir este exercício?")) {
        AppState.exercises = AppState.exercises.filter(ex => ex.id !== exerciseId);
        
        // Update user data in registered users
        const userIndex = AppState.registeredUsers.findIndex(u => u.id === AppState.currentUser.id);
        if (userIndex !== -1) {
            AppState.registeredUsers[userIndex].exercises = AppState.exercises;
            saveToLocalStorage("mydumbbell_users", AppState.registeredUsers);
        }
        
        updateMyExercises();
        updateDashboard();
        showNotification("Exercício excluído com sucesso!");
    }
}

// Workout management
function initWorkoutManagement() {
    const createWorkoutForm = document.getElementById("create-workout-form");
    
    if (createWorkoutForm) {
        createWorkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const selectedExercises = Array.from(document.querySelectorAll(".selected-exercise")).map(el => ({
                id: el.dataset.exerciseId,
                name: el.dataset.exerciseName,
                sets: el.querySelector(".sets-input").value || 3,
                reps: el.querySelector(".reps-input").value || 10,
                weight: el.querySelector(".weight-input").value || 0,
                rest: el.querySelector(".rest-input").value || 60
            }));
            
            if (selectedExercises.length === 0) {
                showNotification("Adicione pelo menos um exercício ao treino", "error");
                return;
            }
            
            const workout = {
                id: generateId(),
                name: document.getElementById("workout-name").value,
                description: document.getElementById("workout-description").value,
                difficulty: document.getElementById("workout-difficulty").value,
                duration: parseInt(document.getElementById("workout-duration").value),
                isPublic: document.getElementById("workout-is-public").checked,
                exercises: selectedExercises,
                createdAt: new Date().toISOString()
            };
            
            AppState.workouts.push(workout);
            
            // Update user data in registered users
            const userIndex = AppState.registeredUsers.findIndex(u => u.id === AppState.currentUser.id);
            if (userIndex !== -1) {
                AppState.registeredUsers[userIndex].workouts = AppState.workouts;
                saveToLocalStorage("mydumbbell_users", AppState.registeredUsers);
            }
            
            showNotification("Treino criado com sucesso!");
            createWorkoutForm.reset();
            document.getElementById("selected-workout-exercises").innerHTML = 
                `<div class="empty-state-small"><p>Nenhum exercício adicionado. Selecione exercícios na lista ao lado</p></div>`;
            showPage("my-workouts");
        });
    }
}

function updateAvailableExercises() {
    const availableExercisesList = document.getElementById("available-exercises-list");
    if (!availableExercisesList) return;
    
    if (AppState.exercises.length === 0) {
        availableExercisesList.innerHTML = `
            <div class="empty-state-small">
                <h3 class="empty-title">Nenhum exercício disponível</h3>
                <p class="empty-description">Crie exercícios primeiro para poder adicioná-los aos treinos.</p>
                <a href="#create-exercise" class="btn btn-primary">Criar Exercício</a>
            </div>
        `;
        return;
    }
    
    availableExercisesList.innerHTML = AppState.exercises.map(exercise => `
        <div class="exercise-card cursor-pointer" onclick="addExerciseToWorkout('${exercise.id}', '${exercise.name}', '${exercise.muscleGroup}')" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h4 style="font-weight: 600; color: var(--gray-700);">${exercise.name}</h4>
                <span class="muscle-group">${exercise.muscleGroup}</span>
            </div>
            <p style="font-size: var(--font-size-sm); color: var(--gray-600);">${exercise.description.substring(0, 80)}...</p>
        </div>
    `).join("");
}

function addExerciseToWorkout(exerciseId, exerciseName, muscleGroup) {
    const selectedExercisesContainer = document.getElementById("selected-workout-exercises");
    
    // Check if exercise is already added
    if (selectedExercisesContainer.querySelector(`[data-exercise-id="${exerciseId}"]`)) {
        showNotification("Exercício já adicionado ao treino", "error");
        return;
    }
    
    // Clear empty message if it exists
    if (selectedExercisesContainer.querySelector(".empty-state-small")) {
        selectedExercisesContainer.innerHTML = "";
    }
    
    const exerciseElement = document.createElement("div");
    exerciseElement.className = "selected-exercise";
    exerciseElement.dataset.exerciseId = exerciseId;
    exerciseElement.dataset.exerciseName = exerciseName;
    
    exerciseElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
            <div>
                <h4 style="font-weight: 600; color: var(--gray-700);">${exerciseName}</h4>
                <span class="muscle-group">${muscleGroup}</span>
            </div>
            <button onclick="removeExerciseFromWorkout('${exerciseId}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: 1.25rem;">×</button>
        </div>
        <div class="form-grid">
            <div>
                <label class="form-label">Séries</label>
                <input type="number" class="sets-input form-input" value="3" min="1" style="padding: 0.25rem;">
            </div>
            <div>
                <label class="form-label">Repetições</label>
                <input type="number" class="reps-input form-input" value="10" min="1" style="padding: 0.25rem;">
            </div>
            <div>
                <label class="form-label">Peso (kg)</label>
                <input type="number" class="weight-input form-input" value="0" min="0" step="0.5" style="padding: 0.25rem;">
            </div>
            <div>
                <label class="form-label">Descanso (s)</label>
                <input type="number" class="rest-input form-input" value="60" min="0" step="15" style="padding: 0.25rem;">
            </div>
        </div>
    `;
    
    selectedExercisesContainer.appendChild(exerciseElement);
    showNotification("Exercício adicionado ao treino!");
}

function removeExerciseFromWorkout(exerciseId) {
    const exerciseElement = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
    if (exerciseElement) {
        exerciseElement.remove();
        
        const selectedExercisesContainer = document.getElementById("selected-workout-exercises");
        if (selectedExercisesContainer.children.length === 0) {
            selectedExercisesContainer.innerHTML = `<div class="empty-state-small"><p>Nenhum exercício adicionado. Selecione exercícios na lista ao lado</p></div>`;
        }
        
        showNotification("Exercício removido do treino");
    }
}

function updateMyWorkouts() {
    const workoutsList = document.getElementById("my-workouts-list");
    if (!workoutsList) return;
    
    if (AppState.workouts.length === 0) {
        workoutsList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🏋️</div>
                <h3 class="empty-title">Nenhum treino encontrado</h3>
                <p class="empty-description">Você ainda não criou nenhum treino. Comece criando seu primeiro treino!</p>
                <a href="#create-workout" class="btn btn-primary">Criar Treino</a>
            </div>
        `;
        return;
    }
    
    workoutsList.innerHTML = AppState.workouts.map(workout => `
        <div class="workout-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3>${workout.name}</h3>
                <span class="difficulty ${workout.difficulty.toLowerCase()}">${workout.difficulty}</span>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${workout.description}</p>
            <div style="display: flex; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">
                <span style="margin-right: 1rem;">🕒 ${workout.duration}min</span>
                <span>🏋️ ${workout.exercises ? workout.exercises.length : 0} ex.</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                <span>${workout.isPublic ? "Público" : "Privado"}</span>
                <button onclick="deleteWorkout('${workout.id}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: var(--font-size-sm);">Excluir</button>
            </div>
        </div>
    `).join("");
}

function deleteWorkout(workoutId) {
    if (confirm("Tem certeza que deseja excluir este treino?")) {
        AppState.workouts = AppState.workouts.filter(w => w.id !== workoutId);
        
        // Update user data in registered users
        const userIndex = AppState.registeredUsers.findIndex(u => u.id === AppState.currentUser.id);
        if (userIndex !== -1) {
            AppState.registeredUsers[userIndex].workouts = AppState.workouts;
            saveToLocalStorage("mydumbbell_users", AppState.registeredUsers);
        }
        
        updateMyWorkouts();
        updateDashboard();
        showNotification("Treino excluído com sucesso!");
    }
}

// Library functionality
function updateWorkoutLibrary() {
    const libraryList = document.getElementById("library-workouts-list");
    if (!libraryList) return;
    
    libraryList.innerHTML = AppState.libraryWorkouts.map(workout => `
        <div class="workout-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3>${workout.name}</h3>
                <span class="difficulty ${workout.difficulty.toLowerCase()}">${workout.difficulty}</span>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${workout.description.substring(0, 100)}...</p>
            <div style="display: flex; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">
                <span style="margin-right: 1rem;">🕒 ${workout.duration}min</span>
                <span>🏋️ ${workout.exercisesCount} ex.</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                <span>Por: ${workout.author}</span>
                <button onclick="addWorkoutToMyWorkouts(${workout.id})" class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: var(--font-size-sm);">
                    Adicionar
                </button>
            </div>
        </div>
    `).join("");
}

function addWorkoutToMyWorkouts(workoutId) {
    const libraryWorkout = AppState.libraryWorkouts.find(w => w.id === workoutId);
    if (!libraryWorkout) return;
    
    const newWorkout = {
        ...libraryWorkout,
        id: generateId(),
        createdAt: new Date().toISOString(),
        exercises: [] // Library workouts don't have detailed exercises
    };
    
    AppState.workouts.push(newWorkout);
    
    // Update user data in registered users
    const userIndex = AppState.registeredUsers.findIndex(u => u.id === AppState.currentUser.id);
    if (userIndex !== -1) {
        AppState.registeredUsers[userIndex].workouts = AppState.workouts;
        saveToLocalStorage("mydumbbell_users", AppState.registeredUsers);
    }
    
    showNotification("Treino adicionado aos seus treinos!");
    updateDashboard();
}

// Profile management
function updateUserProfile() {
    if (!AppState.currentUser) return;
    
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");
    const profileMemberSince = document.getElementById("profile-member-since");
    const profileTotalWorkouts = document.getElementById("profile-total-workouts");
    const profileTotalExercises = document.getElementById("profile-total-exercises");
    const profilePublicContent = document.getElementById("profile-public-content");
    
    if (profileName) profileName.textContent = AppState.currentUser.name;
    if (profileEmail) profileEmail.textContent = AppState.currentUser.email;
    if (profileMemberSince) profileMemberSince.textContent = AppState.currentUser.memberSince;
    if (profileTotalWorkouts) profileTotalWorkouts.textContent = AppState.workouts.length;
    if (profileTotalExercises) profileTotalExercises.textContent = AppState.exercises.length;
    if (profilePublicContent) {
        const publicCount = AppState.exercises.filter(ex => ex.isPublic).length + 
                           AppState.workouts.filter(w => w.isPublic).length;
        profilePublicContent.textContent = publicCount;
    }
}

// Search and filter functionality
function initSearchAndFilters() {
    // My Exercises search
    const searchMyExercises = document.getElementById("search-my-exercises");
    if (searchMyExercises) {
        searchMyExercises.addEventListener("input", filterMyExercises);
    }
    
    const filterMyExercisesGroup = document.getElementById("filter-my-exercises-group");
    if (filterMyExercisesGroup) {
        filterMyExercisesGroup.addEventListener("change", filterMyExercises);
    }
    
    // My Workouts search
    const searchMyWorkouts = document.getElementById("search-my-workouts");
    if (searchMyWorkouts) {
        searchMyWorkouts.addEventListener("input", filterMyWorkouts);
    }
    
    const filterMyWorkoutsDifficulty = document.getElementById("filter-my-workouts-difficulty");
    if (filterMyWorkoutsDifficulty) {
        filterMyWorkoutsDifficulty.addEventListener("change", filterMyWorkouts);
    }
    
    // Library search
    const searchLibraryWorkouts = document.getElementById("search-library-workouts");
    if (searchLibraryWorkouts) {
        searchLibraryWorkouts.addEventListener("input", filterLibraryWorkouts);
    }
    
    const filterLibraryDifficulty = document.getElementById("filter-library-difficulty");
    if (filterLibraryDifficulty) {
        filterLibraryDifficulty.addEventListener("change", filterLibraryWorkouts);
    }
    
    // Available exercises search
    const searchAvailableExercises = document.getElementById("search-available-exercises");
    if (searchAvailableExercises) {
        searchAvailableExercises.addEventListener("input", filterAvailableExercises);
    }
}

function filterMyExercises() {
    const searchTerm = document.getElementById("search-my-exercises")?.value.toLowerCase() || "";
    const selectedGroup = document.getElementById("filter-my-exercises-group")?.value || "Todos os grupos";
    
    const filteredExercises = AppState.exercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm);
        const matchesGroup = selectedGroup === "Todos os grupos" || exercise.muscleGroup === selectedGroup;
        return matchesSearch && matchesGroup;
    });
    
    const exercisesList = document.getElementById("my-exercises-list");
    if (filteredExercises.length === 0) {
        exercisesList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">💪</div>
                <h3 class="empty-title">Nenhum exercício encontrado</h3>
                <p class="empty-description">Tente ajustar os filtros de busca.</p>
            </div>
        `;
    } else {
        exercisesList.innerHTML = filteredExercises.map(exercise => `
            <div class="exercise-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h3>${exercise.name}</h3>
                    <span class="muscle-group">${exercise.muscleGroup}</span>
                </div>
                <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${exercise.description}</p>
                <p style="font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">${exercise.instructions.substring(0, 100)}...</p>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                    <span>${exercise.isPublic ? "Público" : "Privado"}</span>
                    <button onclick="deleteExercise('${exercise.id}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: var(--font-size-sm);">Excluir</button>
                </div>
            </div>
        `).join("");
    }
}

function filterMyWorkouts() {
    const searchTerm = document.getElementById("search-my-workouts")?.value.toLowerCase() || "";
    const selectedDifficulty = document.getElementById("filter-my-workouts-difficulty")?.value || "Todas as dificuldades";
    
    const filteredWorkouts = AppState.workouts.filter(workout => {
        const matchesSearch = workout.name.toLowerCase().includes(searchTerm);
        const matchesDifficulty = selectedDifficulty === "Todas as dificuldades" || workout.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    });
    
    const workoutsList = document.getElementById("my-workouts-list");
    if (filteredWorkouts.length === 0) {
        workoutsList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🏋️</div>
                <h3 class="empty-title">Nenhum treino encontrado</h3>
                <p class="empty-description">Tente ajustar os filtros de busca.</p>
            </div>
        `;
    } else {
        workoutsList.innerHTML = filteredWorkouts.map(workout => `
            <div class="workout-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h3>${workout.name}</h3>
                    <span class="difficulty ${workout.difficulty.toLowerCase()}">${workout.difficulty}</span>
                </div>
                <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${workout.description}</p>
                <div style="display: flex; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">
                    <span style="margin-right: 1rem;">🕒 ${workout.duration}min</span>
                    <span>🏋️ ${workout.exercises ? workout.exercises.length : 0} ex.</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                    <span>${workout.isPublic ? "Público" : "Privado"}</span>
                    <button onclick="deleteWorkout('${workout.id}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: var(--font-size-sm);">Excluir</button>
                </div>
            </div>
        `).join("");
    }
}

function filterLibraryWorkouts() {
    const searchTerm = document.getElementById("search-library-workouts")?.value.toLowerCase() || "";
    const selectedDifficulty = document.getElementById("filter-library-difficulty")?.value || "Todas as dificuldades";
    
    const filteredWorkouts = AppState.libraryWorkouts.filter(workout => {
        const matchesSearch = workout.name.toLowerCase().includes(searchTerm);
        const matchesDifficulty = selectedDifficulty === "Todas as dificuldades" || workout.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    });
    
    const libraryList = document.getElementById("library-workouts-list");
    if (filteredWorkouts.length === 0) {
        libraryList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🏋️</div>
                <h3 class="empty-title">Nenhum treino encontrado</h3>
                <p class="empty-description">Tente ajustar os filtros de busca.</p>
            </div>
        `;
    } else {
        libraryList.innerHTML = filteredWorkouts.map(workout => `
            <div class="workout-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h3>${workout.name}</h3>
                    <span class="difficulty ${workout.difficulty.toLowerCase()}">${workout.difficulty}</span>
                </div>
                <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${workout.description.substring(0, 100)}...</p>
                <div style="display: flex; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">
                    <span style="margin-right: 1rem;">🕒 ${workout.duration}min</span>
                    <span>🏋️ ${workout.exercisesCount} ex.</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                    <span>Por: ${workout.author}</span>
                    <button onclick="addWorkoutToMyWorkouts(${workout.id})" class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: var(--font-size-sm);">
                        Adicionar
                    </button>
                </div>
            </div>
        `).join("");
    }
}

function filterAvailableExercises() {
    const searchTerm = document.getElementById("search-available-exercises")?.value.toLowerCase() || "";
    
    const filteredExercises = AppState.exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.muscleGroup.toLowerCase().includes(searchTerm)
    );
    
    const availableExercisesList = document.getElementById("available-exercises-list");
    if (filteredExercises.length === 0) {
        availableExercisesList.innerHTML = `
            <div class="empty-state-small">
                <h3 class="empty-title">Nenhum exercício encontrado</h3>
                <p class="empty-description">Tente ajustar o termo de busca.</p>
            </div>
        `;
    } else {
        availableExercisesList.innerHTML = filteredExercises.map(exercise => `
            <div class="exercise-card cursor-pointer" onclick="addExerciseToWorkout('${exercise.id}', '${exercise.name}', '${exercise.muscleGroup}')" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h4 style="font-weight: 600; color: var(--gray-700);">${exercise.name}</h4>
                    <span class="muscle-group">${exercise.muscleGroup}</span>
                </div>
                <p style="font-size: var(--font-size-sm); color: var(--gray-600);">${exercise.description.substring(0, 80)}...</p>
            </div>
        `).join("");
    }
}

// Add CSS animation keyframes
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initAuth();
    initExerciseManagement();
    initWorkoutManagement();
    initSearchAndFilters();
});

// Make functions globally available for onclick handlers
window.deleteExercise = deleteExercise;
window.deleteWorkout = deleteWorkout;
window.addExerciseToWorkout = addExerciseToWorkout;
window.removeExerciseFromWorkout = removeExerciseFromWorkout;
window.addWorkoutToMyWorkouts = addWorkoutToMyWorkouts;
window.logout = logout;

