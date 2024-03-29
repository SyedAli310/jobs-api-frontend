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
    const res = await fetch("https://jobease-api.vercel.app/api/v1/auth/login", {
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
      "https://jobease-api.vercel.app/api/v1/auth/register",
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

async function getJobs(statusList, sortBy, companyQuery) {
  try {
    jobsDiv.innerHTML = spinner;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `https://jobease-api.vercel.app/api/v1/jobs?sort=${
        sortBy ? sortBy : "-createdAt"
      }&status=${statusList ? statusList : ""}&company=${
        companyQuery ? companyQuery : ""
      }`,
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
    $("#saved-jobs-search-btn").removeAttr("disabled");
    $("#saved-jobs-search-btn").removeClass("is-loading");
    if (statusList || sortBy) {
      $("#filter-sort-submit-btn").removeAttr("disabled");
      $("#filter-sort-submit-btn").removeClass("is-loading");
      $("#filter-sort-modal").removeClass("is-active");
    }
    if (data.msg === "OK") {
      getJobsInfo();
      console.log(data);
      const jobs = data.jobs;
      jobsDiv.innerHTML = "";
      if (data.count == 0 || jobs.length < 1) {
        if (companyQuery) {
          jobsDiv.innerHTML = `
            <div class='has-text-centered'  style='width:100%;'>
              <h1 class='has-text-danger'>
                No jobs found for <i class='has-text-white'>'${companyQuery}'</i>
              </h1>
              <img class='mt-5' src='./img/error.gif' height='100' width='130' alt='POG' />
            </div>
          `;
        } else {
          $("#dyn-jobs-header-msg").html("");
          $(".filter-sort-links").css("display", "none");
          jobsDiv.innerHTML = `
          <div class='has-text-centered mt-6'  style='width:100%;'>
          <h1 class='has-text-danger'>
          You have no jobs saved in your account.
          </h1>
          <img class='mt-5' src='./img/why-${Math.ceil(
            Math.random() * 4
          )}.gif' height='100' width='130' alt='POG' />
          </div>
          `;
        }
      } else {
        if (companyQuery) {
          $("#dyn-jobs-header-msg").html(`
          <ion-icon name="bookmark-outline"></ion-icon> 
          &nbsp;
          <u>${jobs.length} jobs found matching <i class='has-text-white'>'${companyQuery}'</i></u>
          `);
        } else {
          $("#dyn-jobs-header-msg").html(`
            <ion-icon name="bookmark-outline"></ion-icon> 
            &nbsp;
            <u>You have ${jobs.length} ${
            statusList ? statusList : "saved"
          } jobs</u>
          `);
        }
        $(".filter-sort-links").css("display", "flex");
        // <p class='jobCard-number'>#${index + 1}</p>
        jobs.forEach((el, index) => {
          const job = document.createElement("div");
          job.classList.add("jobCard");
          job.classList.add("is-flex-grow-1");
          job.innerHTML = `
              <span class='jobCard-last-upd'><span class='has-text-info'>Last Updated:</span> ${new Date(
                el.updatedAt
              ).toDateString()}, at ${new Date(
            el.updatedAt
          ).toLocaleTimeString()}
              </span>
              <p class='jobCard-company'>Company - <span>${
                el.company
              }</span></p>
              <p class='jobCard-pos'>Position - <span>${el.position}</span></p>
              <p class='jobCard-status'>Status - <span class='tag ${
                el.status === "declined"
                  ? "is-danger"
                  : el.status === "interview"
                  ? "is-info"
                  : "is-warning"
              }'>${el.status}</span></p>
              <p class='jobCard-added'>Added - <span>${new Date(
                el.createdAt
              ).toDateString()}, at ${new Date(
            el.createdAt
          ).toLocaleTimeString()}</span></p>
              <hr class='mx-4 has-background-dark'>
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
        <div class='has-text-centered mt-6'  style='width:100%;'>
            <img src='./img/khaby.gif' height='100' width='100' alt='POG' />
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
    $("#saved-jobs-search-btn").removeAttr("disabled");
    $("#saved-jobs-search-btn").removeClass("is-loading");
    $("#filter-sort-submit-btn").removeAttr("disabled");
    $("#filter-sort-submit-btn").removeClass("is-loading");
    $("#filter-sort-modal").removeClass("is-active");
    deleteJobEventBinder();
    updateJobEventBinder();
    filter_sort_binder();
    jobsDiv.innerHTML = `
    <div class='has-text-centered' style='width:100%'>
    <h1 class='has-text-danger'>${error.message} <br/> Please try again after some time!</h1>
    <img src='./img/error.gif' height='140' width='140' alt='ERROR' />
    </div>
    `;
    setUserState();
  }
}

async function getSingleJob(id) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease-api.vercel.app/api/v1/jobs/" + id, {
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
        <div class='has-text-centered'  style='width:100%;'>
            <img src='./img/khaby.gif' height='100' width='100' alt='POG' />
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
    $(".update-job-modal").removeClass("is-active");
    jobsDiv.innerHTML = `
    <div class='has-text-centered' style='width:100%'>
    <h1 class='has-text-danger'>${error.message} <br/> Please try again after some time!</h1>
    <img src='./img/error.gif' height='140' width='140' alt='ERROR' />
    </div>
    `;
    setUserState();
  }
}

async function getJobsInfo() {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease-api.vercel.app/api/v1/jobs/info", {
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
      $("#pending-jobs span").text(data.pendingJobs);
      $("#interview-jobs span").text(data.interviewJobs);
      $("#declined-jobs span").text(data.declinedJobs);
    } else {
      if (data.msg == "Authentication Invalid") {
        setUserState();
        jobsDiv.innerHTML = `
        <div class='has-text-centered'  style='width:100%;'>
            <img src='./img/khaby.gif' height='100' width='100' alt='POG' />
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
    jobsDiv.innerHTML = `
    <div class='has-text-centered' style='width:100%'>
    <h1 class='has-text-danger'>${error.message} <br/> Please try again after some time!</h1>
    <img src='./img/error.gif' height='140' width='140' alt='ERROR' />
    </div>
    `;
    setUserState();
  }
}

async function createJob(company, position, link, status) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease-api.vercel.app/api/v1/jobs", {
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
        $(".notification").addClass("show-noti");
        if (x) {
          clearTimeout(x);
        }
        x = setTimeout(() => {
          $(".notification").removeClass("show-noti");
        }, 3500);
      }
    } else {
      if (data.msg == "Authentication Invalid") {
        $("#add-job-btn").removeAttr("disabled");
        $("#add-job-btn").removeClass("is-loading");
        $(".add-job-modal").removeClass("is-active");
        setUserState();
        if (window.location.pathname.includes("dashboard")) {
          jobsDiv.innerHTML = `
          <div class='has-text-centered'  style='width:100%;'>
            <img src='./img/khaby.gif' height='100' width='100' alt='POG' />
            <h1>Login to start adding and managing jobs.</h1>
            <br>
            <a class='button is-info' href='./login.html'>Login</a>
            <a class='button is-dark' href='./explore.html'>Explore</a>
          </div>
          `;
        } else {
          alert("Login to start adding and managing jobs.");
        }
      } else if (data.msg.includes("Please provide")) {
        $("#add-job-btn").removeAttr("disabled");
        $("#add-job-btn").removeClass("is-loading");
        if (data.msg.includes("company")) {
          alert("Company name too long. Please choose a shorter name");
        } else if (data.msg.includes("position")) {
          alert("Position name too long. Please choose a shorter name");
        } else {
          alert("Something went wrong. Please try again.");
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
      jobsDiv.innerHTML = `
      <div class='has-text-centered' style='width:100%'>
      <h1 class='has-text-danger'>${error.message} <br/> Please try again after some time!</h1>
      <img src='./img/error.gif' height='140' width='140' alt='ERROR' />
      </div>
      `;
    } else {
      alert(error.message + ". Please try again after some time!");
    }
    setUserState();
  }
}

async function deleteJob(id) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease-api.vercel.app/api/v1/jobs/" + id, {
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
        <div class='has-text-centered'  style='width:100%;'>
          <img src='./img/khaby.gif' height='100' width='100' alt='POG' />
          <h1>Login to start adding and managing jobs.</h1>
          <br>
          <a class='button is-info' href='./login.html'>Login</a>
          <a class='button is-dark' href='./explore.html'>Explore</a>
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
    jobsDiv.innerHTML = `
    <div class='has-text-centered' style='width:100%'>
    <h1 class='has-text-danger'>${error.message} <br/> Please try again after some time!</h1>
    <img src='./img/error.gif' height='140' width='140' alt='ERROR' />
    </div>
    `;
    setUserState();
  }
}

async function updateJob(id, updatedData) {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://jobease-api.vercel.app/api/v1/jobs/" + id, {
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
        <div class='has-text-centered'  style='width:100%;'>
          <img src='./img/khaby.gif' height='100' width='100' alt='POG' />
          <h1>Login to start adding and managing jobs.</h1>
          <br>
          <a class='button is-info' href='./login.html'>Login</a>
          <a class='button is-dark' href='./explore.html'>Explore</a>
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
    jobsDiv.innerHTML = `
    <div class='has-text-centered' style='width:100%'>
    <h1 class='has-text-danger'>${error.message} <br/> Please try again after some time!</h1>
    <img src='./img/error.gif' height='140' width='140' alt='ERROR' />
    </div>
    `;
    setUserState();
  }
}

async function getExploreJobs(page, query) {
  try {
    $("#next-page").css("display", "block");
    jobsExploreDiv.innerHTML = spinner;
    const res = await fetch(
      `https://jobease-api.vercel.app/api/v1/explore/jobs?page=${page}&limit=5&position=${
        query ? query : ""
      }`
    );
    const data = await res.json();
    if (data.msg == "OK") {
      jobsExploreDiv.innerHTML = "";
      console.log(data);
      const jobs = data.data;
      $("#next-page").removeAttr("disabled");
      $("#prev-page").removeAttr("disabled");
      // if (query) {
      //   $("#prev-page").attr("pos", query);
      //   $("#next-page").attr("pos", query);
      //   $("#curr-page").attr("pos", query);
      //   $("#last-page").attr("pos", query);
      //   $("#first-page").attr("pos", query);
      //   $("#mid-plus-one").attr("pos", query);
      //   $("#mid-minus-one").attr("pos", query);
      // } else {
      //   $("#prev-page").attr("pos", "");
      //   $("#next-page").attr("pos", "");
      //   $("#curr-page").attr("pos", "");
      //   $("#mid-plus-one").attr("pos", "");
      //   $("#mid-minus-one").attr("pos", "");
      // }
      $("#prev-page").html(
        `<ion-icon name="arrow-back-circle-outline"></ion-icon>
        &nbsp;
        Prev
        `
      );
      $("#curr-page").html(`${data.pageNo}`);
      $("#curr-page").attr("value", data.pageNo);
      $("#next-page").html(
        `Next
        &nbsp;
        <ion-icon name="arrow-forward-circle-outline"></ion-icon>`
      );
      $("#last-page").html(`${data.totalPages}`);
      $("#last-page").attr("value", data.totalPages);
      $("#mid-plus-one").html(
        `${
          data.pageNo + 2 < data.totalPages ? data.pageNo + 2 : data.totalPages
        }`
      );
      $("#mid-plus-one").attr(
        "value",
        data.pageNo + 2 < data.totalPages ? data.pageNo + 2 : data.totalPages
      );
      $("#mid-minus-one").html(`${data.pageNo - 2 > 0 ? data.pageNo - 2 : 1}`);
      $("#mid-minus-one").attr(
        "value",
        data.pageNo - 2 > 0 ? data.pageNo - 2 : 1
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
      //previous method to savea job to the user data
      // createJob('${el.company}','${el.position}','${el.url}','pending');
      jobs.forEach((el, index) => {
        const job = document.createElement("div");
        job.classList.add("jobCard");
        job.classList.add("is-flex-grow-1");
        job.innerHTML = `
            <p class='jobCard-company'>Company - <span>${el.company}</span></p>
            <p class='jobCard-pos'>Position - <span>${el.position}</span></p>
            <div class='jobCard-btns'>
            <span class='hoverable-icon' data-title='Save'>
            <a href='javascript:void(0)' 
            name='${el.company}' pos='${el.position}' url='${el.url}'
            onclick="saveJobToAccount(this);"}
            class='button save-explore-job' style='background:transparent !important; border:none !important; height:auto !important; color:#485fc7 !important;'>
            <ion-icon name="bookmarks-outline"></ion-icon></a>
            </span>
            <span class='hoverable-icon' data-title='Visit'>
            <a href='${el.url}' class='button' target='_blank' title='${
          el.company
        }' style='background:transparent !important; border:none !important; height:auto !important; color:#485fc7 !important;' >
            <ion-icon name="send-outline"></ion-icon></a>
            </span>
            </div>
            <p class='jobCard-added'>
            ${new Date(el.createdAt).toDateString()}
            </p>
            `;
        jobsExploreDiv.appendChild(job);
      });
      exploreSearchBinder();
    }
  } catch (error) {
    console.log(error.message);
    $("#next-page").css("display", "none");
    jobsExploreDiv.innerHTML = `
    <div class='has-text-centered mx-6' style='width:100%'>
      <h1 class='has-text-danger mb-2'>Something went wrong. Try again after some time!</h1>
      <a href='/explore.html'>Refresh</a>
      <br>
      <img src='./img/error.gif' height='140' width='140' alt='ERROR' />
    </div>
    `;
  }
}

async function saveJobToAccount(elem) {
  const company = elem.getAttribute("name");
  const position = elem.getAttribute("pos");
  const url = elem.getAttribute("url");
  elem.classList.add("is-loading");
  await createJob(company, position, url, "pending");
  elem.classList.remove("is-loading");
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

  // search saved job handlers
  $("#saved-jobs-search-form").on("submit", (e) => {
    e.preventDefault();
    $("#saved-jobs-search-btn").attr("disabled", "disabled");
    $("#saved-jobs-search-btn").addClass("is-loading");
    const search = $("#saved-jobs-search-input").val();
    getJobs("", "-createdAt", search);
  });
}

function exploreSearchBinder() {
  $("#explore-jobs-search-form").on("submit", (e) => {
    e.preventDefault();
    //$("#explore-jobs-search-btn").attr("disabled", "disabled");
    //$("#explore-jobs-search-btn").addClass("is-loading");
    const search = $("#explore-jobs-search-input").val();
    console.log(search);
    getExploreJobs(1, search);
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
    localStorage.clear();
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
    $(".all-jobs-header").css("display", "none");
    $(".all-jobs-info-div").css("display", "none");
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
    $("#add-job-btn-div").css("display", "flex");
    $(".all-jobs-header").css("display", "flex");
    $(".all-jobs-info-div").css("display", "block");
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
$("#next-page").click((e) => {
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

$("#prev-page").click((e) => {
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

$(".pagination-link").on("click", (e) => {
  page = e.target.attributes.value.value;
  getExploreJobs(page);
  window.scrollTo(0, 0);
  console.log("Page No - ", page);
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

let x = null;
$(".animated-text").on("click", () => {
  $(".notification").addClass("show-noti");
  if (x) {
    clearTimeout(x);
  }
  x = setTimeout(() => {
    $(".notification").removeClass("show-noti");
  }, 3500);
});
