window.addEventListener("DOMContentLoaded", (event) => {
    setInterval(() => {
		document.querySelector("h1").innerText += "!";
	}, 1000);
});