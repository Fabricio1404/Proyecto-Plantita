// Guard y UX menores
(function(){
  // Si tu app usa login:
  // if(!localStorage.getItem("token")) location.href="login.html";

  document.getElementById("logout")?.addEventListener("click", ()=>{
    // localStorage.removeItem("token");
    location.href = "index.html";
  });
})();
