import { apiClient } from "./api-client.js"


const params = new URLSearchParams(window.location.search);

const token = "feb09095091a6e1f21860c755c9812ff"

console.log("TOKEN:", token);

if (!token) {
  alert("Invalid onboarding link");

  throw new Error("Token missing");
}





async function loadForm() {

  const data = await  apiClient(`/api/v1/public/forms/${token}`,"GET","JSON",
                 false, false, {})


  document.getElementById("tenant-name").innerText =
    data.account.name;
}

loadForm();
