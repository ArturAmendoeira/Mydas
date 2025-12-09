const API_URL = "http://localhost:3000/usuarios";

document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const telefone = document.getElementById("telefone").value;
    const container = document.getElementById("checkRegister");

    if (!nome || !email || !senha || !telefone) {
        container.innerHTML = `
                <div class="alert alert-danger mt-3" role="alert">
                    Preencha todos os campos
                </div>`;
        return;
    }

    try {
        // verifica se o email já existe
        const checkUser = await fetch(`${API_URL}?email=${email}`);
        const existing = await checkUser.json();

        if (existing.length > 0) {
            container.innerHTML = `
                <div class="alert alert-danger mt-3" role="alert">
                    Email já cadastrado
                </div>`;
            return;
        }

        // cadastra novo usuário
        const novoUsuario = { nome, email, senha, telefone };
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoUsuario)
        });

        if (response.ok) {
            sessionStorage.setItem("usuario", JSON.stringify(novoUsuario));
            container.innerHTML = `
                <div class="alert alert-success mt-3" role="alert">
                    Usuário criado com sucesso <i class="fa-solid fa-check"></i>
                </div>`;
            window.location.href = "../index.html"
        } else {
            container.innerHTML = `
                <div class="alert alert-danger mt-3" role="alert">
                    Erro ao criar usuário <i class="fa-solid fa-xmark"></i>
                </div>`;
        }
    } catch (err) {
        console.error("Erro de conexão:", err);
        alert("Erro ao conectar com o servidor.");
    }
});
