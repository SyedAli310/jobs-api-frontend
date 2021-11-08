//---------------------------------Selectors / Variables---------------------------------------
const jobsDiv = document.querySelector("#all-jobs-div");
const jobsExploreDiv = document.querySelector("#all-explore-jobs-div");
const spinner = `<div class="spinner m-auto"></div>`;
const textCollection = ["Jobs...", "Interviews...", "Offers...", "JobEase..."];
let i = 0;
let page = 1;

//----------------------------------------Methods----------------------------------------------

async function login(email, password) {
  try {
    const res = await fetch("https://jobease.herokuapp.com/api/v1/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
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
    setUserState();
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
      "https://jobease.herokuapp.com/api/v1/auth/register",
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
    setUserState();
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

async function getJobs(statusList, sortBy) {
  try {
    jobsDiv.innerHTML = spinner;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `https://jobease.herokuapp.com/api/v1/jobs?sort=${
        sortBy ? sortBy : "-createdAt"
      }&status=${statusList ? statusList : ""}`,
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
    if (statusList || sortBy) {
      $("#filter-sort-submit-btn").removeAttr("disabled");
      $("#filter-sort-submit-btn").removeClass("is-loading");
    }
    if (data.msg === "OK") {
      console.log(data);
      const jobs = data.jobs;
      jobsDiv.innerHTML = "";
      if (data.count == 0 || jobs.length < 1) {
        jobsDiv.innerHTML = `<h1 class='has-text-danger' style='text-align:center !important; width:100%;'>You have no jobs added to your account.</h1>`;
      } else {
        $(".all-jobs-header").html(
          `
          <h1 class='is-size-5 has-text-weight-bold is-flex is-align-items-center' style='color:#312A58;'>
          <ion-icon name="bookmark-outline"></ion-icon> 
          &nbsp;<u>You have ${data.count} ${
            statusList ? statusList : "saved"
          } jobs</u>
          </h1>
          <div class='filter-sort-links'>
          <a href='javascript:void(0)' id='filter-sort-btn' class='is-link filter-sort-link'>
              <ion-icon name="funnel-outline"></ion-icon>&nbsp;Filters
          </a>
          </div>
          `
        );
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
              <span class='hoverable-icon' data-title='Visit'>
              <a href='${
                el.link ? el.link : "javascript:void(0)"
              }' target='_blank' class='has-text-white'>
              <ion-icon name="navigate-outline"></ion-icon></a>
              </span>
              <span class='hoverable-icon' data-title='Edit'>
              <a href='javascript:void(0)' name='${
                el._id
              }' class='jobCard-edit'><ion-icon name="create-outline"></ion-icon></a>
              </span>
              <span class='hoverable-icon' data-title='Delete'>
              <a href='javascript:void(0)' name='${
                el._id
              }' class='jobCard-del'><ion-icon name="bag-remove-outline"></ion-icon></a>
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
        filter_sort_binder();
      }
    } else {
      if (data.msg == "Authentication Invalid") {
        setUserState();
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
            <a class='button is-dark' href='./explore.html'>Explore</a>
        </div>
        `;
      } else {
        jobsDiv.innerHTML = data.msg;
        setUserState();
      }
    }
  } catch (error) {
    console.log(error.message);
    jobsDiv.innerHTML = error.message + ". Please try again after some time!";
    setUserState();
  }
}

async function getSingleJob(id) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease.herokuapp.com/api/v1/jobs/" + id, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.msg === "OK") {
      console.log("Single Job", data);
      return data.job;
    } else {
      if (data.msg == "Authentication Invalid") {
        setUserState();
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else {
        jobsDiv.innerHTML = data.msg;
        setUserState();
      }
    }
  } catch (error) {
    console.log(error.message);
    $(".update-job-modal").removeClass("is-active");
    jobsDiv.innerHTML = error.message + ". Please try again after some time!";
    setUserState();
  }
}

async function createJob(company, position, link, status) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease.herokuapp.com/api/v1/jobs", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        company: company,
        position: position,
        link: link,
        status: status,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (data.msg == "Created") {
      $("#add-job-btn").removeAttr("disabled");
      $("#add-job-btn").removeClass("is-loading");
      $(".add-job-modal").removeClass("is-active");
      $("#add-job-company").val("");
      $("#add-job-pos").val("");
      $("#add-job-link").val("");
      $("#add-job-status").val("pending");
      if (window.location.pathname.includes("dashboard")) {
        getJobs();
      } else {
        alert("Job added successfully!");
      }
    } else {
      if (data.msg == "Authentication Invalid") {
        $("#add-job-btn").removeAttr("disabled");
        $("#add-job-btn").removeClass("is-loading");
        $(".add-job-modal").removeClass("is-active");
        setUserState();
        if (window.location.pathname.includes("dashboard")) {
          jobsDiv.innerHTML = `
          <div class='has-text-centered'>
              <h1>Login to start adding and managing jobs.</h1>
              <br>
              <a class='button is-info' href='./login.html'>Login</a>
          </div>
          `;
        } else {
          alert("Login to start adding and managing jobs.");
        }
      } else if (data.msg == "Invalid link") {
        alert("Invalid link");
        $("#add-job-btn").removeAttr("disabled");
        $("#add-job-btn").removeClass("is-loading");
      } else {
        $(".add-job-modal").removeClass("is-active");
        setUserState();
        if (window.location.pathname.includes("dashboard")) {
          jobsDiv.innerHTML = data.msg;
        } else {
          alert(data.msg);
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    $(".add-job-modal").removeClass("is-active");
    if (window.location.pathname.includes("dashboard")) {
      jobsDiv.innerHTML = error.message + ". Please try again after some time!";
    } else {
      alert(error.message + ". Please try again after some time!");
    }
    setUserState();
  }
}

async function deleteJob(id) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease.herokuapp.com/api/v1/jobs/" + id, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
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
        setUserState();
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else {
        $("#confirm-msg-modal").removeClass("is-active");
        setUserState();
        jobsDiv.innerHTML = data.msg;
      }
    }
  } catch (error) {
    console.log(error.message);
    $("#confirm-msg-modal").removeClass("is-active");
    jobsDiv.innerHTML = error.message + ". Please try again after some time!";
    setUserState();
  }
}

async function updateJob(id, updatedData) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease.herokuapp.com/api/v1/jobs/" + id, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
    const data = await res.json();
    console.log(data);
    if (data.msg == "OK") {
      let x = null;
      $("#update-job-btn").removeAttr("disabled");
      $("#update-job-btn").removeClass("is-loading");
      $("#update-job-btn").html(
        '<ion-icon name="bag-check-outline"></ion-icon>&nbsp;updated'
      );
      if (x) {
        clearTimeout(x);
      }
      x = setTimeout(() => {
        $("#update-job-btn").html(
          '<ion-icon name="bag-outline"></ion-icon>&nbsp;update'
        );
      }, 1000);
      //$(".modal").removeClass("is-active");
      getJobs();
    } else {
      if (data.msg == "Authentication Invalid") {
        $("#update-job-btn").removeAttr("disabled");
        $("#update-job-btn").removeClass("is-loading");
        $(".update-job-modal").removeClass("is-active");
        setUserState();
        jobsDiv.innerHTML = `
        <div class='has-text-centered'>
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
        </div>
        `;
      } else if (data.msg == "Invalid link") {
        alert("Invalid link");
        $("#update-job-btn").removeAttr("disabled");
        $("#update-job-btn").removeClass("is-loading");
      } else {
        $(".update-job-modal").removeClass("is-active");
        setUserState();
        jobsDiv.innerHTML = data.msg;
      }
    }
  } catch (error) {
    console.log(error.message);
    $(".update-job-modal").removeClass("is-active");
    jobsDiv.innerHTML = error.message + ". Please try again after some time!";
    setUserState();
  }
}

async function getExploreJobs(page) {
  try {
    $("#next-page").css("display", "block");
    jobsExploreDiv.innerHTML = spinner;
    const res = await fetch(
      `https://jobease.herokuapp.com/api/v1/explore/jobs?page=${page}`
    );
    const data = await res.json();
    if (data.msg == "OK") {
      jobsExploreDiv.innerHTML = "";
      console.log(data);
      const jobs = data.data;
      $("#next-page").removeAttr("disabled");
      $("#prev-page").removeAttr("disabled");
      $("#prev-page").html(
        `<ion-icon name="arrow-back-circle-outline"></ion-icon>
        &nbsp;
        ${data.pageNo - 1}
        `
      );
      $("#curr-page").html(`${data.pageNo} of ${data.totalPages}`);
      $("#next-page").html(
        `${data.pageNo + 1}
        &nbsp;
        <ion-icon name="arrow-forward-circle-outline"></ion-icon>`
      );
      if (data.pageNo == data.totalPages) {
        $("#next-page").attr("disabled", "disabled");
      }
      if (data.pageNo == 1) {
        $("#prev-page").attr("disabled", "disabled");
      }
      if (jobs.length == 0) {
        jobsExploreDiv.innerHTML = `
        <div class='has-text-centered has-text-danger'>
            <h1>No more jobs to show. ☹️</h1>
        </div>
        `;
      }
      jobs.forEach((el, index) => {
        const job = document.createElement("div");
        job.classList.add("jobCard");
        job.innerHTML = `
            <p class='jobCard-company'>Company - <span>${el.company}</span></p>
            <p class='jobCard-pos'>Position - <span>${el.position}</span></p>
            <div class='jobCard-btns'>
            <span class='hoverable-icon' data-title='Save'>
            <a href='javascript:void(0)' 
            name='${el.id}' 
            onclick="createJob('${el.company}','${el.position}','${
          el.url
        }','pending')"}
            class='save-explore-job' ><ion-icon name="save-outline"></ion-icon></a>
            </span>
            <span class='hoverable-icon' data-title='Visit'>
            <a href='${el.url}' target='_blank' title='${
          el.company
        }' ><ion-icon name="send-outline"></ion-icon></a>
            </span>
            </div>
            <p class='jobCard-added'>
            ${new Date(el.createdAt).toDateString()}
            </p>
            `;
        jobsExploreDiv.appendChild(job);
      });
    }
  } catch (error) {
    console.log(error.message);
    $("#next-page").css("display", "none");
    jobsExploreDiv.innerHTML =
      "<p class='has-text-centered has-text-danger'>Something went wrong. <br> Try again after some time! <br> <a href='/explore.html'>Refresh</a></p>";
  }
}

function filter_sort_binder() {
  $(".filter-sort-modal-close").on("click", () => {
    $("#filter-sort-modal").removeClass("is-active");
  });

  $("#filter-sort-btn").on("click", () => {
    console.log("filter");
    $("#filter-sort-modal").addClass("is-active");
  });

  $("#filter-sort-form").on("submit", (e) => {
    e.preventDefault();
    $("#filter-sort-submit-btn").attr("disabled", "disabled");
    $("#filter-sort-submit-btn").addClass("is-loading");
    //get filters
    let checkboxes = document.querySelectorAll(
      "#filter-sort-form input[type=checkbox]:checked"
    );
    const filters = [];
    checkboxes.forEach((checkbox) => {
      filters.push(checkbox.value);
    });
    const statusList = filters.join(",");

    //get sortBy
    let radio = document.querySelector(
      "#filter-sort-form input[type=radio]:checked"
    );
    const sortBy = radio.value;

    console.log("statusList", statusList);
    console.log("sortBy", sortBy);
    // get filtered & sorted jobs
    getJobs(statusList, sortBy);
  });
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
    $(".back-to-dashboard").css("display", "none");
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
    $(".back-to-dashboard").css("display", "block");
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
  setTimeout(() => {
    $("#logout-btn").removeAttr("disabled");
    $("#logout-btn").removeClass("is-loading");
    window.location.href = "./login.html";
  }, 1500);
});

// add job handler
$("#add-job-form").on("submit", (e) => {
  e.preventDefault();
  const addJobCompany = $("#add-job-company").val();
  const addJobPosition = $("#add-job-pos").val();
  const addJobStatus = $("#add-job-status").val();
  const addJobLink = $("#add-job-link").val();
  createJob(addJobCompany, addJobPosition, addJobLink, addJobStatus);
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
function fillJobData(id) {
  $("#update-job-company").val("");
  $("#update-job-pos").val("");
  $("#update-job-link").val("");
  $("#update-job-status").val("pending");
  $("#update-job-form .control").addClass("is-loading");
  getSingleJob(id).then((job) => {
    if (job) {
      $("#update-job-form .control").removeClass("is-loading");
      $("#update-job-company").val(job.company);
      $("#update-job-pos").val(job.position);
      $("#update-job-link").val(job.link);
      $("#update-job-status").val(job.status);
    }
  });
}

function updateJobEventBinder() {
  $(".jobCard-edit").on("click", (e) => {
    const updateJobId = e.target.name;
    fillJobData(updateJobId);
    $("#update-job-btn").attr("name", updateJobId);
    $(".update-job-modal").addClass("is-active");
  });
}

$("#update-job-form").on("submit", (e) => {
  e.preventDefault();
  const id = $("#update-job-btn").attr("name");
  const updateJobCompany = $("#update-job-company").val();
  const updateJobPosition = $("#update-job-pos").val();
  const updateJobStatus = $("#update-job-status").val();
  const updateJobLink = $("#update-job-link").val();
  updateJob(id, {
    company: updateJobCompany,
    position: updateJobPosition,
    link: updateJobLink,
    status: updateJobStatus,
  });
  $("#update-job-btn").attr("disabled", "disabled");
  $("#update-job-btn").addClass("is-loading");
});

// explore page pagination handlers
$("#next-page").click(() => {
  page++;
  getExploreJobs(page);
  let x = null;
  if (x) {
    clearTimeout(x);
  }
  $("#next-page").attr("disabled", "disabled");
  setTimeout(() => {
    $("#next-page").removeAttr("disabled");
  }, 2000);
});

$("#prev-page").click(() => {
  page--;
  getExploreJobs(page);
  let x = null;
  if (x) {
    clearTimeout(x);
  }
  $("#prev-page").attr("disabled", "disabled");
  setTimeout(() => {
    $("#prev-page").removeAttr("disabled");
  }, 2000);
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

$("#hero-dash-btn").on("mouseenter", (e) => {
  const options = [
    "bag-add-outline",
    "bag-check-outline",
    "bag-remove-outline",
  ];
  $("#hero-dash-icon").attr(
    "name",
    options[Math.floor(Math.random() * options.length)]
  );
});
$("#hero-dash-btn").on("mouseleave", (e) => {
  $("#hero-dash-icon").attr("name", "bag-outline");
});

// modals open/close handlers
$(".modal-close-cst").on("click", (e) => {
  e.preventDefault();
  $(".add-job-modal").removeClass("is-active");
});
$(".modal-open-cst").on("click", () => {
  $(".add-job-modal").addClass("is-active");
});
$(".modal-close-upd").on("click", (e) => {
  e.preventDefault();
  $(".update-job-modal").removeClass("is-active");
});
$(".modal-open-upd").on("click", () => {
  $(".update-job-modal").addClass("is-active");
});
$(".confirm-modal-close").on("click", () => {
  $("#confirm-msg-modal").removeClass("is-active");
});
