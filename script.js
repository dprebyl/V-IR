window.addEventListener("DOMContentLoaded", (event) => {
    setInterval(() => {
		document.querySelector("h1").innerText += "-_";
	}, 2000);
});