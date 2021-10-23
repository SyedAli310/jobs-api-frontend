//---------------------------------Selectors / Variables---------------------------------------
const jobsDiv = document.querySelector("#all-jobs-div");
const spinner = `<div class="spinner"></div>`;
const textCollection = ["Jobs...", "Interviews...", "Offers...","JobEase..."];
let i = 0;

//----------------------------------------Methods----------------------------------------------
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
      window.location.href = "./dashboard.html";
    } else {
      let x = null;
      $("#form-error").css("visibility", "hidden");
      if (x) {
        clearTimeout(x);
      }
      x = setTimeout(() => {
        $("#form-error").css("visibility", "visible");
        $("#form-error").html(`
           <p class='is-size-5 has-text-danger has-text-centered'>${data.msg}</p>
         `);
        $("#login-btn").removeAttr("disabled");
        $("#login-btn").removeClass("is-loading");
      }, 500);
    }
  } catch (error) {
    console.log(error.message);
    let x = null;
    setUserState()
    $("#form-error").css("visibility", "hidden");
    if (x) {
      clearTimeout(x);
    }
    x = setTimeout(() => {
      $("#form-error").css("visibility", "visible");
      $("#form-error").html(`
            <p class='is-size-5 has-text-danger has-text-centered'>${error.message}. Please try again after some time.</p>
          `);
      $("#login-btn").removeAttr("disabled");
      $("#login-btn").removeClass("is-loading");
    }, 500);
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
      let x = null;
      $("#form-error").css("visibility", "hidden");
      if (x) {
        clearTimeout(x);
      }
      x = setTimeout(() => {
        $("#form-error").css("visibility", "visible");
        $("#form-error").html(`
              <p class='is-size-5 has-text-danger has-text-centered'>${data.msg}</p>
            `);
        $("#register-btn").removeAttr("disabled");
        $("#register-btn").removeClass("is-loading");
      }, 500);
    }
  } catch (error) {
    console.log(error.message);
    let x = null;
    setUserState()
    $("#form-error").css("visibility", "hidden");
    if (x) {
      clearTimeout(x);
    }
    x = setTimeout(() => {
      $("#form-error").css("visibility", "visible");
      $("#form-error").html(`
            <p class='is-size-5 has-text-danger has-text-centered'>${error.message}. Please try again after some time.</p>
          `);
      $("#register-btn").removeAttr("disabled");
      $("#register-btn").removeClass("is-loading");
    }, 500);
  }
}

async function getJobs() {
  try {
    jobsDiv.innerHTML = spinner;
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
      const jobs = data.jobs;
      jobsDiv.innerHTML = "";
      if (data.count == 0 || jobs.length < 1) {
        jobsDiv.innerHTML = `<h1 class='has-text-danger'>You have no jobs added to your account.</h1>`;
      } else {
        jobs.forEach((el, index) => {
          const job = document.createElement("div");
          job.classList.add("jobCard");
          job.innerHTML = `
              <p class='jobCard-number'>Job #${index + 1}</p>
              <span class='jobCard-last-upd'>Last Updated: ${new Date(
                el.updatedAt
              ).toDateString()}
              </span>
              <p class='jobCard-company'>Company - <span>${
                el.company
              }</span></p>
              <p class='jobCard-pos'>Position - <span>${el.position}</span></p>
              <p class='jobCard-status'>Status - <span>${el.status}</span></p>
              <div class='jobCard-btns'>
              <span class='hoverable-icon' data-title='Delete'>
              <a href='javascript:void(0)' name='${
                el._id
              }' class='jobCard-del'><ion-icon name="bag-remove-outline"></ion-icon></a>
              </span>
              <span class='hoverable-icon' data-title='Edit'>
              <a href='javascript:void(0)' name='${
                el._id
              }' class='jobCard-edit'><ion-icon name="create-outline"></ion-icon></a>
              </span>
              </div>
              <p class='jobCard-added'>
              ${new Date(el.createdAt).toDateString()}
              </p>
              `;
          jobsDiv.appendChild(job);
        });
        deleteJobEventBinder();
        updateJobEventBinder();
      }
    } else {
      if (data.msg == "Authentication Invalid") {
        setUserState()
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else {
        jobsDiv.innerHTML = data.msg;
        setUserState()
      }
    }
  } catch (error) {
    console.log(error.message);
    jobsDiv.innerHTML = error.message + '. Please try again after some time!';
    setUserState()
  }
}

async function getSingleJob(id) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/jobs/" + id,
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
      console.log("Single Job",data);
      return data.job
    } else {
      if (data.msg == "Authentication Invalid") {
        setUserState()
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else {
        jobsDiv.innerHTML = data.msg;
        setUserState()
      }
    }
  } catch (error) {
    console.log(error.message);
    $(".update-job-modal").removeClass("is-active");
    jobsDiv.innerHTML = error.message + '. Please try again after some time!';
    setUserState()
  }
}

async function createJob(company, position, status) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/jobs",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: company,
          position: position,
          status: status,
        }),
      }
    );
    const data = await res.json();
    console.log(data);
    if (data.msg == "Created") {
      $("#add-job-btn").removeAttr("disabled");
      $("#add-job-btn").removeClass("is-loading");
      $(".add-job-modal").removeClass("is-active");
      $('#add-job-company').val('')
      $('#add-job-pos').val('')
      $('#add-job-status').val('pending')
      getJobs();
    } else {
      if (data.msg == "Authentication Invalid") {
        $("#add-job-btn").removeAttr("disabled");
        $("#add-job-btn").removeClass("is-loading");
        $(".add-job-modal").removeClass("is-active");
        setUserState()
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else {
        $(".add-job-modal").removeClass("is-active");
        setUserState()
        jobsDiv.innerHTML = data.msg;
      }
    }
  } catch (error) {
    console.log(error.message);
    $(".add-job-modal").removeClass("is-active");
    jobsDiv.innerHTML = error.message + '. Please try again after some time!';
    setUserState()
  }
}

async function deleteJob(id) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/jobs/" + id,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    console.log(data);
    if (data.msg == "OK") {
      $("#delete-job-btn").removeAttr("disabled");
      $("#delete-job-btn").removeClass("is-loading");
      $("#confirm-msg-modal").removeClass("is-active");
      getJobs();
    } else {
      if (data.msg == "Authentication Invalid") {
        $("#confirm-msg-modal").removeClass("is-active");
        setUserState()
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else {
        $("#confirm-msg-modal").removeClass("is-active");
        setUserState()
        jobsDiv.innerHTML = data.msg;
      }
    }
  } catch (error) {
    console.log(error.message);
    $("#confirm-msg-modal").removeClass("is-active");
    jobsDiv.innerHTML = error.message + '. Please try again after some time!';
    setUserState()
  }
}

async function updateJob(id, updatedData) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/jobs/" + id,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      }
    );
    const data = await res.json();
    console.log(data);
    if (data.msg == "OK") {
      let x = null
      $("#update-job-btn").removeAttr("disabled");
      $("#update-job-btn").removeClass("is-loading");
      $("#update-job-btn").html('<ion-icon name="bag-check-outline"></ion-icon>&nbsp;updated');
      if(x){
        clearTimeout(x)
      }
      x = setTimeout(()=>{
        $("#update-job-btn").html('<ion-icon name="bag-outline"></ion-icon>&nbsp;update');
      },1000)
      //$(".modal").removeClass("is-active");
      getJobs();
    } else {
      if (data.msg == "Authentication Invalid") {
        $("#add-job-btn").removeAttr("disabled");
        $("#add-job-btn").removeClass("is-loading");
        $(".update-job-modal").removeClass("is-active");
        setUserState()
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else {
        $(".update-job-modal").removeClass("is-active");
        setUserState()
        jobsDiv.innerHTML = data.msg;
      }
    }
  } catch (error) {
    console.log(error.message);
    $(".update-job-modal").removeClass("is-active");
    jobsDiv.innerHTML = error.message + '. Please try again after some time!';
    setUserState()
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
    $("#add-job-btn-div").css("display", "none");
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
    $("#add-job-btn-div").css("display", "block");
  }
}
setUserState();
//-----------------------------------Event Listeners-------------------------------------------
// user login handler
$("#login-form").on("submit", (e) => {
  e.preventDefault();
  const loginEmail = $("#login-email").val();
  const loginPassword = $("#login-password").val();
  login(loginEmail, loginPassword);
  $("#login-btn").attr("disabled", "disabled");
  $("#login-btn").addClass("is-loading");
});

// user register handler
$("#register-form").on("submit", (e) => {
  e.preventDefault();
  const registerName = $("#register-name").val();
  const registerEmail = $("#register-email").val();
  const registerPassword = $("#register-password").val();
  register(registerName, registerEmail, registerPassword);
  $("#register-btn").attr("disabled", "disabled");
  $("#register-btn").addClass("is-loading");
});

// user logout handler
$("#logout-btn").on("click", () => {
  localStorage.clear();
  $("#logout-btn").attr("disabled", "disabled");
  $("#logout-btn").addClass("is-loading");
  setTimeout(()=>{
    $("#logout-btn").removeAttr("disabled");
    $("#logout-btn").removeClass("is-loading");
    window.location.href = "./login.html";
  },1500)
});

// add job handler
$("#add-job-form").on("submit", (e) => {
  e.preventDefault();
  const addJobCompany = $("#add-job-company").val();
  const addJobPosition = $("#add-job-pos").val();
  const addJobStatus = $("#add-job-status").val();
  createJob(addJobCompany, addJobPosition, addJobStatus);
  $("#add-job-btn").attr("disabled", "disabled");
  $("#add-job-btn").addClass("is-loading");
});

//delete job handlers
function deleteJobEventBinder() {
  $(".jobCard-del").on("click", (e) => {
    const deleteJobId = e.target.name;
    $("#confirm-msg-modal").addClass("is-active");
    $("#delete-job-btn").attr("name", deleteJobId);
  });
}

$("#delete-job-btn").on("click", (e) => {
  deleteJob(e.target.name);
  $("#delete-job-btn").attr("disabled", "disabled");
  $("#delete-job-btn").addClass("is-loading");
});

// update job handlers
function fillJobData(id){
  $('#update-job-company').val('')
  $('#update-job-pos').val('')
  $('#update-job-status').val('pending')
  $('#update-job-form .control').addClass('is-loading')
  getSingleJob(id).then((job)=>{
    if(job){
      $('#update-job-form .control').removeClass('is-loading')
      $('#update-job-company').val(job.company)
      $('#update-job-pos').val(job.position)
      $('#update-job-status').val(job.status)
    }
  })

}

function updateJobEventBinder() {
  $(".jobCard-edit").on("click", (e) => {
    const updateJobId = e.target.name;
    fillJobData(updateJobId)
    $("#update-job-btn").attr("name", updateJobId);
    $(".update-job-modal").addClass("is-active");
  });
}

$("#update-job-form").on("submit", (e) => {
  e.preventDefault();
  const id = $('#update-job-btn').attr('name')
  const updateJobCompany = $("#update-job-company").val();
  const updateJobPosition = $("#update-job-pos").val();
  const updateJobStatus = $("#update-job-status").val();
  updateJob(id, {company:updateJobCompany, position:updateJobPosition, status:updateJobStatus} );
  $("#update-job-btn").attr("disabled", "disabled");
  $("#update-job-btn").addClass("is-loading");
});

// UI interaction Handlers
$(".dropdown-trigger").on("click", () => {
  $(".dropdown").toggleClass("is-active");
  $(".dropdown-content").toggleClass("animate");
  if ($("#hamburger-icon").attr("name") == "menu-outline") {
    $("#hamburger-icon").attr("name", "close-outline");
  } else if ($("#hamburger-icon").attr("name") == "close-outline") {
    $("#hamburger-icon").attr("name", "menu-outline");
  }
});

setInterval(() => {
  $(".animated-text").text(textCollection[i]);
  $(".animated-text").attr("data-text", textCollection[i]);
  if (i >= 3) {
    i = 0;
  } else {
    i++;
  }
}, 4000);

$('#hero-dash-btn').on('mouseenter',(e)=>{
  const options = ['bag-add-outline','bag-check-outline','bag-remove-outline']
  $('#hero-dash-icon').attr('name',options[Math.floor(Math.random()*options.length)]) 
})
$('#hero-dash-btn').on('mouseleave',(e)=>{
  $('#hero-dash-icon').attr('name','bag-outline') 
})

// modals open/close handlers
$(".modal-close-cst").on("click", () => {
  $(".add-job-modal").removeClass("is-active");
});
$(".modal-open-cst").on("click", () => {
  $(".add-job-modal").addClass("is-active");
});
$(".modal-close-upd").on("click", () => {
  $(".update-job-modal").removeClass("is-active");
});
$(".modal-open-upd").on("click", () => {
  $(".update-job-modal").addClass("is-active");
});
$(".confirm-modal-close").on("click", () => {
  $("#confirm-msg-modal").removeClass("is-active");
});


