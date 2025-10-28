// Gerenciamento de estado global
const EstadoApp = {
    usuarioAtual: null,
    usuariosRegistrados: JSON.parse(localStorage.getItem("mydumbbell_users") || "[]"),
    exercicios: JSON.parse(localStorage.getItem("mydumbbell_exercises") || "[]"),
    treinos: JSON.parse(localStorage.getItem("mydumbbell_workouts") || "[]"),
    treinosBiblioteca: [
        {
            id: 1,
            nome: "Treino de Peito Iniciante",
            descricao: "Treino focado no desenvolvimento do peitoral para iniciantes, com exercícios básicos e eficazes.",
            dificuldade: "Iniciante",
            duracao: 45,
            exerciciosContagem: 5,
            autor: "João Silva",
            isPublico: true,
        },
        {
            id: 2,
            nome: "Treino de Pernas Avançado",
            descricao: "Um treino intenso para membros inferiores, focado em força e hipertrofia.",
            dificuldade: "Avançado",
            duracao: 75,
            exerciciosContagem: 8,
            autor: "Maria Fitness",
            isPublico: true,
        },
        {
            id: 3,
            nome: "Treino Full Body Intermediário",
            descricao: "Treino completo para o corpo todo, ideal para quem busca otimizar o tempo.",
            dificuldade: "Intermediário",
            duracao: 60,
            exerciciosContagem: 7,
            autor: "Pedro Força",
            isPublico: true,
        },
        {
            id: 4,
            nome: "Cardio HIIT para Queima de Gordura",
            descricao: "Sessões curtas e intensas para acelerar o metabolismo e queimar gordura.",
            dificuldade: "Iniciante",
            duracao: 30,
            exerciciosContagem: 6,
            autor: "Ana Corrida",
            isPublico: true,
        },
    ]
};

// Funções utilitárias
function salvarNoLocalStorage(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function gerarId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function mostrarPagina(idPagina) {
    const paginas = document.querySelectorAll(".page");
    const menuPrincipal = document.getElementById("menu-principal");
    const btnEntrar = document.getElementById("btn-entrar");
    
    // Verifica se o usuário está tentando acessar páginas protegidas sem autenticação
    const paginasProtegidas = ["painel", "meus-exercicios", "criar-exercicio", "meus-treinos", "criar-treino", "biblioteca", "perfil"];
    if (paginasProtegidas.includes(idPagina) && !EstadoApp.usuarioAtual) {
        mostrarNotificacao("Você precisa fazer login para acessar esta página", "error");
        mostrarPagina("login");
        return;
    }
    
    paginas.forEach(pagina => {
        if (pagina.id === idPagina) {
            pagina.classList.remove("hidden");
            pagina.style.animation = "fadeIn 0.3s ease-out";
        } else {
            pagina.classList.add("hidden");
        }
    });
    
    // Mostra/esconde a navegação com base na autenticação
    if (EstadoApp.usuarioAtual && idPagina !== "inicio" && idPagina !== "login") {
        menuPrincipal.classList.remove("hidden");
        btnEntrar.classList.add("hidden");
    } else {
        menuPrincipal.classList.add("hidden");
        btnEntrar.classList.remove("hidden");
    }
    
    // Atualiza o hash da URL
    window.location.hash = idPagina;
    
    // Atualiza conteúdo específico da página
    atualizarConteudoPagina(idPagina);
}

function atualizarConteudoPagina(idPagina) {
    switch (idPagina) {
        case "painel":
            atualizarPainel();
            break;
        case "meus-exercicios":
            atualizarMeusExercicios();
            break;
        case "meus-treinos":
            atualizarMeusTreinos();
            break;
        case "biblioteca":
            atualizarBibliotecaTreinos();
            break;
        case "perfil":
            atualizarPerfilUsuario();
            break;
        case "criar-treino":
            atualizarExerciciosDisponiveis();
            break;
    }
}

function mostrarNotificacao(mensagem, tipo = "success") {
    const container = document.getElementById("container-notificacao");
    const notificacao = document.createElement("div");
    notificacao.className = `notification ${tipo === "error" ? "error" : ""}`;
    notificacao.textContent = mensagem;
    
    container.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
}

function mostrarErroAutenticacao(mensagem) {
    // Remove qualquer mensagem de erro existente
    const erroExistente = document.querySelector(".auth-error");
    if (erroExistente) {
        erroExistente.remove();
    }
    
    // Cria e mostra a nova mensagem de erro
    const divErro = document.createElement("div");
    divErro.className = "auth-error";
    divErro.style.cssText = `
        color: var(--error-600);
        font-size: var(--font-size-sm);
        text-align: center;
        margin-top: var(--spacing-2);
        margin-bottom: var(--spacing-4);
    `;
    divErro.textContent = mensagem;
    
    const formAutenticacao = document.getElementById("form-autenticacao");
    const btnEnviarAutenticacao = document.getElementById("btn-enviar-autenticacao");
    formAutenticacao.insertBefore(divErro, btnEnviarAutenticacao);
}

// Manipulação de Navegação
function iniciarNavegacao() {
    const linksNav = document.querySelectorAll("nav a, a[href^=\"#\"], .nav-link");
    
    linksNav.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const idAlvo = e.target.getAttribute("href").substring(1);
            mostrarPagina(idAlvo);
        });
    });
    
    // Lida com o histórico do navegador (voltar/avançar)
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            mostrarPagina(hash);
        }
    });
    
    // Verifica a sessão existente ao carregar a página
    const usuarioSalvo = localStorage.getItem("mydumbbell_current_user");
    if (usuarioSalvo) {
        EstadoApp.usuarioAtual = JSON.parse(usuarioSalvo);
        const hashInicial = window.location.hash.substring(1);
        mostrarPagina(hashInicial || "painel");
    } else {
        const hashInicial = window.location.hash.substring(1);
        mostrarPagina(hashInicial || "inicio");
    }
}

// Manipulação de Autenticação
function iniciarAutenticacao() {
    const abaLogin = document.getElementById("aba-login");
    const abaRegistro = document.getElementById("aba-registro");
    const formAutenticacao = document.getElementById("form-autenticacao");
    const campoNome = document.getElementById("campo-nome");
    const campoConfirmarSenha = document.getElementById("campo-confirmar-senha");
    const btnEnviarAutenticacao = document.getElementById("btn-enviar-autenticacao");
    const comecarAgora = document.getElementById("comecar-agora");
    const criarContaBtn = document.getElementById("criar-conta-btn");
    
    let modoRegistro = false;
    
    function alternarModoAutenticacao() {
        modoRegistro = !modoRegistro;
        
        // Limpa mensagens de erro existentes
        const erroExistente = document.querySelector(".auth-error");
        if (erroExistente) {
            erroExistente.remove();
        }
        
        if (modoRegistro) {
            campoNome.classList.remove("hidden");
            campoConfirmarSenha.classList.remove("hidden");
            btnEnviarAutenticacao.textContent = "Criar Conta";
            abaLogin.classList.remove("active");
            abaRegistro.classList.add("active");
        } else {
            campoNome.classList.add("hidden");
            campoConfirmarSenha.classList.add("hidden");
            btnEnviarAutenticacao.textContent = "Entrar";
            abaRegistro.classList.remove("active");
            abaLogin.classList.add("active");
        }
        
        // Limpa campos do formulário
        formAutenticacao.reset();
    }
    
    if (abaLogin) {
        abaLogin.addEventListener("click", () => {
            if (modoRegistro) alternarModoAutenticacao();
        });
    }
    
    if (abaRegistro) {
        abaRegistro.addEventListener("click", () => {
            if (!modoRegistro) alternarModoAutenticacao();
        });
    }
    
    if (formAutenticacao) {
        formAutenticacao.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const inputNome = document.getElementById("nome");
            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value;
            const confirmarSenha = document.getElementById("confirmar-senha").value;
            
            // Limpa mensagens de erro existentes
            const erroExistente = document.querySelector(".auth-error");
            if (erroExistente) {
                erroExistente.remove();
            }
            
            if (modoRegistro) {
                // Lógica de Registro
                const nome = inputNome.value.trim();
                
                if (!nome) {
                    mostrarErroAutenticacao("Por favor, preencha seu nome");
                    return;
                }
                
                if (!email) {
                    mostrarErroAutenticacao("Por favor, preencha seu email");
                    return;
                }
                
                if (!senha) {
                    mostrarErroAutenticacao("Por favor, preencha sua senha");
                    return;
                }
                
                if (senha !== confirmarSenha) {
                    mostrarErroAutenticacao("As senhas não coincidem");
                    return;
                }
                
                if (senha.length < 6) {
                    mostrarErroAutenticacao("A senha deve ter pelo menos 6 caracteres");
                    return;
                }
                
                // Verifica se o usuário já existe
                const usuarioExistente = EstadoApp.usuariosRegistrados.find(usuario => usuario.email === email);
                if (usuarioExistente) {
                    mostrarErroAutenticacao("Este email já está cadastrado");
                    return;
                }
                
                // Cria novo usuário
                const novoUsuario = {
                    id: gerarId(),
                    nome: nome,
                    email: email,
                    senha: senha, // Em um app real, a senha deve ser hasheada
                    dataRegistro: new Date().toISOString(),
                    exercicios: [],
                    treinos: [],
                };
                
                EstadoApp.usuariosRegistrados.push(novoUsuario);
                salvarNoLocalStorage("mydumbbell_users", EstadoApp.usuariosRegistrados);
                
                mostrarNotificacao("Registro realizado com sucesso! Faça login para continuar.");
                alternarModoAutenticacao(); // Volta para o modo login
                
            } else {
                // Lógica de Login
                const usuario = EstadoApp.usuariosRegistrados.find(u => u.email === email && u.senha === senha);
                
                if (usuario) {
                    EstadoApp.usuarioAtual = usuario;
                    EstadoApp.exercicios = usuario.exercicios || [];
                    EstadoApp.treinos = usuario.treinos || [];
                    localStorage.setItem("mydumbbell_current_user", JSON.stringify(usuario));
                    
                    mostrarNotificacao(`Bem-vindo de volta, ${usuario.nome.split(" ")[0]}!`);
                    mostrarPagina("painel");
                } else {
                    mostrarErroAutenticacao("Email ou senha incorretos.");
                }
            }
        });
    }
    
    // Botões que alternam para a aba de registro
    if (comecarAgora) {
        comecarAgora.addEventListener("click", () => {
            mostrarPagina("login");
            if (!modoRegistro) alternarModoAutenticacao();
        });
    }
    
    if (criarContaBtn) {
        criarContaBtn.addEventListener("click", () => {
            mostrarPagina("login");
            if (!modoRegistro) alternarModoAutenticacao();
        });
    }
}

function sair() {
    EstadoApp.usuarioAtual = null;
    EstadoApp.exercicios = [];
    EstadoApp.treinos = [];
    localStorage.removeItem("mydumbbell_current_user");
    mostrarNotificacao("Você saiu da sua conta.");
    mostrarPagina("inicio");
}

// Manipulação do Painel (Dashboard)
function atualizarPainel() {
    if (!EstadoApp.usuarioAtual) return;
    
    // Atualiza o nome do usuário no título
    const tituloPainel = document.querySelector(".dashboard-title");
    if (tituloPainel) {
        tituloPainel.textContent = `Olá, ${EstadoApp.usuarioAtual.nome.split(" ")[0]}! 👋`;
    }
    
    // Atualiza as estatísticas
    document.getElementById("total-exercicios").textContent = EstadoApp.exercicios.length;
    document.getElementById("total-treinos").textContent = EstadoApp.treinos.length;
}

// Gerenciamento de Exercícios
function iniciarGerenciamentoExercicios() {
    const formCriarExercicio = document.getElementById("form-criar-exercicio");
    
    if (formCriarExercicio) {
        formCriarExercicio.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const novoExercicio = {
                id: gerarId(),
                nome: document.getElementById("nome-exercicio").value,
                grupoMuscular: document.getElementById("grupo-muscular-exercicio").value,
                descricao: document.getElementById("descricao-exercicio").value,
                instrucoes: document.getElementById("instrucoes-exercicio").value,
                isPublico: document.getElementById("exercicio-publico").checked,
                criadoEm: new Date().toISOString()
            };
            
            EstadoApp.exercicios.push(novoExercicio);
            
            // Atualiza os dados do usuário nos usuários registrados
            const indiceUsuario = EstadoApp.usuariosRegistrados.findIndex(u => u.id === EstadoApp.usuarioAtual.id);
            if (indiceUsuario !== -1) {
                EstadoApp.usuariosRegistrados[indiceUsuario].exercicios = EstadoApp.exercicios;
                salvarNoLocalStorage("mydumbbell_users", EstadoApp.usuariosRegistrados);
            }
            
            mostrarNotificacao("Exercício criado com sucesso!");
            formCriarExercicio.reset();
            mostrarPagina("meus-exercicios");
        });
    }
}

function atualizarMeusExercicios() {
    const listaExercicios = document.getElementById("lista-meus-exercicios");
    if (!listaExercicios) return;
    
    if (EstadoApp.exercicios.length === 0) {
        listaExercicios.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">💪</div>
                <h3 class="empty-title">Nenhum exercício encontrado</h3>
                <p class="empty-description">Você ainda não criou nenhum exercício. Comece criando um novo!</p>
                <a href="#criar-exercicio" class="btn btn-primary">Criar Exercício</a>
            </div>
        `;
        return;
    }
    
    listaExercicios.innerHTML = EstadoApp.exercicios.map(exercicio => `
        <div class="exercise-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3>${exercicio.nome}</h3>
                <span class="muscle-group">${exercicio.grupoMuscular}</span>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${exercicio.descricao}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                <span>${exercicio.isPublico ? "Público" : "Privado"}</span>
                <button onclick="excluirExercicio('${exercicio.id}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: var(--font-size-sm);">Excluir</button>
            </div>
        </div>
    `).join("");
}

function excluirExercicio(idExercicio) {
    if (confirm("Tem certeza que deseja excluir este exercício? Ele será removido de todos os treinos que o utilizam.")) {
        // Remove o exercício da lista global
        EstadoApp.exercicios = EstadoApp.exercicios.filter(e => e.id !== idExercicio);
        
        // Remove o exercício dos treinos
        EstadoApp.treinos.forEach(treino => {
            treino.exercises = treino.exercises.filter(ex => ex.id !== idExercicio);
        });
        
        // Atualiza os dados do usuário nos usuários registrados
        const indiceUsuario = EstadoApp.usuariosRegistrados.findIndex(u => u.id === EstadoApp.usuarioAtual.id);
        if (indiceUsuario !== -1) {
            EstadoApp.usuariosRegistrados[indiceUsuario].exercicios = EstadoApp.exercicios;
            EstadoApp.usuariosRegistrados[indiceUsuario].treinos = EstadoApp.treinos;
            salvarNoLocalStorage("mydumbbell_users", EstadoApp.usuariosRegistrados);
        }
        
        atualizarMeusExercicios();
        atualizarPainel();
        mostrarNotificacao("Exercício excluído com sucesso!");
    }
}

// Gerenciamento de Treinos
function iniciarGerenciamentoTreinos() {
    const formCriarTreino = document.getElementById("form-criar-treino");
    
    if (formCriarTreino) {
        formCriarTreino.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const dia = document.getElementById("dia-treino").value;
            const hora = document.getElementById("hora-treino").value;

            if (!dia || !hora) {
                mostrarNotificacao("Por favor, selecione o Dia da Semana e o Horário para o treino.", "error");
                return;
            }

            // Lógica de Detecção de Conflito
            const conflito = EstadoApp.treinos.find(t => t.dia === dia && t.hora === hora);
            if (conflito) {
                mostrarNotificacao(`Conflito de horário: Você já tem o treino "${conflito.nome}" agendado para ${dia} às ${hora}.`, "error");
                return;
            }
            
            const exerciciosSelecionados = Array.from(document.querySelectorAll(".selected-exercise")).map(el => ({
                id: el.dataset.exerciseId,
                nome: el.dataset.exerciseName,
                series: el.querySelector(".sets-input").value || 3,
                repeticoes: el.querySelector(".reps-input").value || 10,
                peso: el.querySelector(".weight-input").value || 0,
                descanso: el.querySelector(".rest-input").value || 60
            }));
            
            if (exerciciosSelecionados.length === 0) {
                mostrarNotificacao("Adicione pelo menos um exercício ao treino", "error");
                return;
            }
            
            const novoTreino = {
                id: gerarId(),
                nome: document.getElementById("nome-treino").value,
                descricao: document.getElementById("descricao-treino").value,
                dificuldade: document.getElementById("dificuldade-treino").value,
                duracao: parseInt(document.getElementById("duracao-treino").value),
                dia: dia,
                hora: hora,
                isPublico: document.getElementById("treino-publico").checked,
                exercicios: exerciciosSelecionados,
                criadoEm: new Date().toISOString()
            };
            
            EstadoApp.treinos.push(novoTreino);
            
            // Atualiza os dados do usuário nos usuários registrados
            const indiceUsuario = EstadoApp.usuariosRegistrados.findIndex(u => u.id === EstadoApp.usuarioAtual.id);
            if (indiceUsuario !== -1) {
                EstadoApp.usuariosRegistrados[indiceUsuario].treinos = EstadoApp.treinos;
                salvarNoLocalStorage("mydumbbell_users", EstadoApp.usuariosRegistrados);
            }
            
            mostrarNotificacao("Treino criado com sucesso!");
            formCriarTreino.reset();
            document.getElementById("lista-exercicios-selecionados").innerHTML = 
                `<div class="empty-state-small"><p>Nenhum exercício adicionado. Selecione exercícios na lista ao lado</p></div>`;
            mostrarPagina("meus-treinos");
        });
    }
}

function atualizarExerciciosDisponiveis() {
    const listaExerciciosDisponiveis = document.getElementById("lista-exercicios-disponiveis");
    if (!listaExerciciosDisponiveis) return;
    
    if (EstadoApp.exercicios.length === 0) {
        listaExerciciosDisponiveis.innerHTML = `
            <div class="empty-state-small">
                <h3 class="empty-title">Nenhum exercício disponível</h3>
                <p class="empty-description">Crie exercícios primeiro para poder adicioná-los aos treinos.</p>
                <a href="#criar-exercicio" class="btn btn-primary">Criar Exercício</a>
            </div>
        `;
        return;
    }
    
    listaExerciciosDisponiveis.innerHTML = EstadoApp.exercicios.map(exercicio => `
        <div class="exercise-card cursor-pointer" onclick="adicionarExercicioAoTreino('${exercicio.id}', '${exercicio.nome}', '${exercicio.grupoMuscular}')" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h4 style="font-weight: 600; color: var(--gray-700);">${exercicio.nome}</h4>
                <span class="muscle-group">${exercicio.grupoMuscular}</span>
            </div>
            <p style="font-size: var(--font-size-sm); color: var(--gray-600);">${exercicio.descricao.substring(0, 80)}...</p>
        </div>
    `).join("");
}

function adicionarExercicioAoTreino(idExercicio, nomeExercicio, grupoMuscular) {
    const containerExerciciosSelecionados = document.getElementById("lista-exercicios-selecionados");
    
    // Verifica se o exercício já foi adicionado
    if (containerExerciciosSelecionados.querySelector(`[data-exercise-id="${idExercicio}"]`)) {
        mostrarNotificacao("Exercício já adicionado ao treino", "error");
        return;
    }
    
    // Limpa a mensagem de vazio se existir
    if (containerExerciciosSelecionados.querySelector(".empty-state-small")) {
        containerExerciciosSelecionados.innerHTML = "";
    }
    
    const elementoExercicio = document.createElement("div");
    elementoExercicio.className = "selected-exercise";
    elementoExercicio.dataset.exerciseId = idExercicio;
    elementoExercicio.dataset.exerciseName = nomeExercicio;
    
    elementoExercicio.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
            <div>
                <h4 style="font-weight: 600; color: var(--gray-700);">${nomeExercicio}</h4>
                <span class="muscle-group">${grupoMuscular}</span>
            </div>
            <button onclick="removerExercicioDoTreino('${idExercicio}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: 1.25rem;">×</button>
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
    
    containerExerciciosSelecionados.appendChild(elementoExercicio);
    mostrarNotificacao("Exercício adicionado ao treino!");
}

function removerExercicioDoTreino(idExercicio) {
    const elementoExercicio = document.querySelector(`[data-exercise-id="${idExercicio}"]`);
    if (elementoExercicio) {
        elementoExercicio.remove();
        
        const containerExerciciosSelecionados = document.getElementById("lista-exercicios-selecionados");
        if (containerExerciciosSelecionados.children.length === 0) {
            containerExerciciosSelecionados.innerHTML = `<div class="empty-state-small"><p>Nenhum exercício adicionado. Selecione exercícios na lista ao lado</p></div>`;
        }
        
        mostrarNotificacao("Exercício removido do treino");
    }
}

function atualizarMeusTreinos() {
    const listaTreinos = document.getElementById("lista-meus-treinos");
    if (!listaTreinos) return;
    
    if (EstadoApp.treinos.length === 0) {
        listaTreinos.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🏋️</div>
                <h3 class="empty-title">Nenhum treino encontrado</h3>
                <p class="empty-description">Você ainda não criou nenhum treino. Comece criando seu primeiro treino!</p>
                <a href="#criar-treino" class="btn btn-primary">Criar Treino</a>
            </div>
        `;
        return;
    }
    
    listaTreinos.innerHTML = EstadoApp.treinos.map(treino => `
        <div class="workout-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3>${treino.nome}</h3>
                <span class="difficulty ${treino.dificuldade.toLowerCase()}">${treino.dificuldade}</span>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${treino.descricao}</p>
            <div style="display: flex; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">
                <span style="margin-right: 1rem;">🕒 ${treino.duracao}min</span>
                <span>🏋️ ${treino.exercicios ? treino.exercicios.length : 0} ex.</span>
            </div>
            <div style="font-size: var(--font-size-sm); color: var(--primary-600); margin-bottom: 0.5rem;">
                <span>📅 ${treino.dia || 'Não Agendado'} às ${treino.hora || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                <span>${treino.isPublico ? "Público" : "Privado"}</span>
                <button onclick="excluirTreino('${treino.id}')" style="color: var(--error-600); background: none; border: none; cursor: pointer; font-size: var(--font-size-sm);">Excluir</button>
            </div>
        </div>
    `).join("");
}

function excluirTreino(idTreino) {
    if (confirm("Tem certeza que deseja excluir este treino?")) {
        EstadoApp.treinos = EstadoApp.treinos.filter(t => t.id !== idTreino);
        
        // Atualiza os dados do usuário nos usuários registrados
        const indiceUsuario = EstadoApp.usuariosRegistrados.findIndex(u => u.id === EstadoApp.usuarioAtual.id);
        if (indiceUsuario !== -1) {
            EstadoApp.usuariosRegistrados[indiceUsuario].treinos = EstadoApp.treinos;
            salvarNoLocalStorage("mydumbbell_users", EstadoApp.usuariosRegistrados);
        }
        
        atualizarMeusTreinos();
        atualizarPainel();
        mostrarNotificacao("Treino excluído com sucesso!");
    }
}

// Funcionalidade da Biblioteca
function atualizarBibliotecaTreinos() {
    const listaBiblioteca = document.getElementById("lista-treinos-biblioteca");
    if (!listaBiblioteca) return;
    
    listaBiblioteca.innerHTML = EstadoApp.treinosBiblioteca.map(treino => `
        <div class="workout-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3>${treino.nome}</h3>
                <span class="difficulty ${treino.dificuldade.toLowerCase()}">${treino.dificuldade}</span>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${treino.descricao.substring(0, 100)}...</p>
            <div style="display: flex; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500); margin-bottom: 0.5rem;">
                <span style="margin-right: 1rem;">🕒 ${treino.duracao}min</span>
                <span>🏋️ ${treino.exerciciosContagem} ex.</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--gray-500);">
                <span>Por: ${treino.autor}</span>
                <button onclick="adicionarTreinoAosMeusTreinos(${treino.id})" class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: var(--font-size-sm);">
                    Adicionar
                </button>
            </div>
        </div>
    `).join("");
}

function adicionarTreinoAosMeusTreinos(idTreino) {
    const treinoOriginal = EstadoApp.treinosBiblioteca.find(t => t.id === idTreino);
    if (!treinoOriginal) {
        mostrarNotificacao("Treino não encontrado na biblioteca.", "error");
        return;
    }
    
    // Cria uma cópia do treino da biblioteca para adicionar aos treinos do usuário
    const novoTreinoUsuario = {
        ...treinoOriginal,
        id: gerarId(), // Novo ID para o treino do usuário
        isPublico: false, // Por padrão, não é público ao ser copiado
        dia: "Não Agendado", // Adiciona campos de dia/hora
        hora: "N/A",
        exercicios: [] // Em um cenário real, os exercícios também seriam copiados
    };
    
    EstadoApp.treinos.push(novoTreinoUsuario);
    
    // Atualiza os dados do usuário nos usuários registrados
    const indiceUsuario = EstadoApp.usuariosRegistrados.findIndex(u => u.id === EstadoApp.usuarioAtual.id);
    if (indiceUsuario !== -1) {
        EstadoApp.usuariosRegistrados[indiceUsuario].treinos = EstadoApp.treinos;
        salvarNoLocalStorage("mydumbbell_users", EstadoApp.usuariosRegistrados);
    }
    
    mostrarNotificacao(`Treino "${treinoOriginal.nome}" adicionado aos seus treinos!`);
    mostrarPagina("meus-treinos");
}

// Perfil do Usuário
function atualizarPerfilUsuario() {
    if (!EstadoApp.usuarioAtual) return;
    
    document.getElementById("nome-perfil").textContent = EstadoApp.usuarioAtual.nome;
    document.getElementById("email-perfil").textContent = EstadoApp.usuarioAtual.email;
    
    // Atualiza estatísticas
    document.getElementById("membro-desde").textContent = new Date(EstadoApp.usuarioAtual.dataRegistro).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById("total-treinos-perfil").textContent = EstadoApp.treinos.length;
    document.getElementById("total-exercicios-perfil").textContent = EstadoApp.exercicios.length;
    
    const conteudoPublico = EstadoApp.exercicios.filter(e => e.isPublico).length + EstadoApp.treinos.filter(t => t.isPublico).length;
    document.getElementById("conteudo-publico-perfil").textContent = conteudoPublico;
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    iniciarNavegacao();
    iniciarAutenticacao();
    iniciarGerenciamentoExercicios();
    iniciarGerenciamentoTreinos();
    
    // Adiciona a função mostrarPagina ao escopo global para o onclick no HTML
    window.mostrarPagina = mostrarPagina;
    window.sair = sair;
    window.excluirExercicio = excluirExercicio;
    window.adicionarExercicioAoTreino = adicionarExercicioAoTreino;
    window.removerExercicioDoTreino = removerExercicioDoTreino;
    window.excluirTreino = excluirTreino;
    window.adicionarTreinoAosMeusTreinos = adicionarTreinoAosMeusTreinos;
});
