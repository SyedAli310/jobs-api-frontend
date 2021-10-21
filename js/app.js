async function login(email, password) {
  try {
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      }
    );
    const data = await res.json();
    if (data.msg == "OK") {
      console.log(data);
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("loggedUser", data.user.name);
      $("#login-btn").removeAttr("disabled");
      $("#login-btn").removeClass("is-loading");
      window.location.href = "/";
    } else {
      alert(data.msg);
      $("#login-btn").removeAttr("disabled");
      $("#login-btn").removeClass("is-loading");
      //   window.location.href = "./login.html";
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function register(name, email, password) {
  try {
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, email: email, password: password }),
      }
    );
    const data = await res.json();
    console.log(data);
    if (data.msg == "Created") {
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("loggedUser", data.user.name);
      $("#login-btn").removeAttr("disabled");
      $("#login-btn").removeClass("is-loading");
      window.location.href = "/";
    } else {
      alert(data.msg);
      $("#login-btn").removeAttr("disabled");
      $("#login-btn").removeClass("is-loading");
      //   window.location.href = "./register.html";
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function getJobs() {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/jobs",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (data.msg === "OK") {
      console.log(data);
    }
    if (data.msg === "Authentication Invalid") {
      console.log("Login to see jobs");
    }
  } catch (error) {
    console.log(error.message);
  }
}

function checkUserStatus() {
  if (
    localStorage.getItem("accessToken") &&
    localStorage.getItem("loggedUser")
  ) {
    console.log("Logged In");
    return true;
  } else {
    console.log("Not Logged In");
    return false;
  }
}

function setUserState() {
  const logged = checkUserStatus();
  if (!logged) {
    $("#dyn-btns").html(`
        <a
        href="./register.html"
        class="button is-success is-medium"
        >
            <strong>Join</strong>
        </a>
        <a
            href="./login.html"
            class="button is-light is-medium"
        >
            <strong>Login</strong>
        </a>
    `);
    $("#dyn-text").text("Get started");
  } else {
    $("#dyn-btns").html(`
    <a
    href="javascript:void(0)"
    class="button is-danger is-medium"
    id='logout-btn'
    >
    <strong>Logout</strong>
    </a>
    `);
    $("#dyn-text").html(
      `Hi, ${localStorage.getItem("loggedUser")} 
      <a href='./dashboard.html'>
      <span  class='mt-4' style='display:flex; justify-content:center; align-items:center; font-size:smaller;'>
        Dashboard&nbsp;<ion-icon name="arrow-forward-circle-outline"></ion-icon>
      </span>
      </a>
      `
    );
  }
}
setUserState();

$("#login-form").on("submit", (e) => {
  e.preventDefault();
  const loginEmail = $("#login-email").val();
  const loginPassword = $("#login-password").val();
  login(loginEmail, loginPassword);
  $("#login-btn").attr("disabled", "disabled");
  $("#login-btn").addClass("is-loading");
});

$("#register-form").on("submit", (e) => {
  e.preventDefault();
  const registerName = $("#register-name").val();
  const registerEmail = $("#register-email").val();
  const registerPassword = $("#register-password").val();
  register(registerName, registerEmail, registerPassword);
  $("#register-btn").attr("disabled", "disabled");
  $("#register-btn").addClass("is-loading");
});

$("#logout-btn").on("click", () => {
  localStorage.clear();
  window.location.href = "/";
});

//login();
//getJobs();

$(".dropdown-trigger").on("click", () => {
  $(".dropdown").toggleClass("is-active");
  $(".dropdown-content").toggleClass("animate");
  if ($("#hamburger-icon").attr("name") == "menu-outline") {
    $("#hamburger-icon").attr("name", "close-outline");
  } else if ($("#hamburger-icon").attr("name") == "close-outline") {
    $("#hamburger-icon").attr("name", "menu-outline");
  }
});

const textCollection = ["Jobs...", "Interview...", "Offer..."];
let i = 0;

setInterval(() => {
  $(".animated-text").text(textCollection[i]);
  $(".animated-text").attr("data-text", textCollection[i]);
  if (i > 2) {
    i = 0;
  } else {
    i++;
  }
}, 4200);
