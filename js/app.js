async function login() {
  try {
    const res = await fetch(
      "https://jobs-api-node-310.herokuapp.com/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "peter@gmail.com", password: "secret" }),
      }
    );
    const data = await res.json();
    if (data) {
      console.log(data);
      localStorage.setItem("accessToken", data.token);
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

//login();
//getJobs();

$('.dropdown-trigger').on('click',()=>{
    $('.dropdown').toggleClass('is-active')
    $('.dropdown-content').toggleClass('animate')
    if($('#hamburger-icon').attr('name') == 'menu-outline'){
        $('#hamburger-icon').attr('name','close-outline')
    }
    else if($('#hamburger-icon').attr('name') == 'close-outline'){
        $('#hamburger-icon').attr('name','menu-outline')
    }
})

