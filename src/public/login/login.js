// URL do JSON Server
const API_URL = "http://localhost:3000/usuarios";

// ---- LOGIN TRADICIONAL ----
document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const container = document.getElementById("welcome");

  try {
    const response = await fetch(`${API_URL}?email=${email}&senha=${senha}`);
    const data = await response.json();

    if (data.length > 0) {
      const usuario = data[0];
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
      window.location.href = "../index.html";
    } else {
      container.innerHTML = `
        <div class="alert alert-danger mt-3" role="alert">
          Email ou senha incorretos!
        </div>`;
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor:", error);
    alert("Erro de conexão com o servidor. Tente novamente!");
  }
});

// ---- LOGIN GOOGLE ----
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "350782545824-57r64485h6sll1341kk0562oapduq3p9.apps.googleusercontent.com",
    callback: handleGoogleResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("googleBtn"),
    {
      theme: "outline",
      size: "large",
      width: "200"
    }
  );

  document.getElementById("loginGoogleBtn").addEventListener("click", () => {
    google.accounts.id.prompt();
  });
};

function handleGoogleResponse(response) {
  const data = jwt_decode(response.credential);

  const user = {
    id: data.sub,
    nome: data.name,
    email: data.email,
    senha: data.sub,
    telefone: null
  };

  loginGoogle(user);
}

async function loginGoogle(user) {
  try {
    const res = await fetch(`${API_URL}?email=${user.email}`);
    const data = await res.json();

    if (data.length === 0) {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
    }

    sessionStorage.setItem("usuario", JSON.stringify(user));
    window.location.href = "../index.html";

  } catch (err) {
    console.error("Erro no login Google:", err);
    alert("Erro de conexão com o servidor. Tente novamente!");
  }
}

