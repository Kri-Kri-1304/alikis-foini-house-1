document.addEventListener("DOMContentLoaded", () => {
  fetch("components/nav.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("nav-placeholder").innerHTML = html;

      const toggleBtn = document.getElementById("theme-toggle");
      const root = document.documentElement;

      // Load saved theme
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        root.setAttribute("data-theme", savedTheme);
        toggleBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
      }

      toggleBtn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme");
        const newTheme = current === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        toggleBtn.textContent = newTheme === "dark" ? "☀️" : "🌙";
      });
    })
    .catch(err => console.error("Error loading navigation:", err));
});
