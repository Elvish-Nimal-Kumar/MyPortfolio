(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");
  const toast = document.getElementById("toast");

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  // Theme initialization & toggle
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.setAttribute("data-theme", savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", nextTheme);
      localStorage.setItem("portfolio-theme", nextTheme);
    });
  }

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll(".nav-link");

  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navAnchors.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach((sec) => spyObserver.observe(sec));
  }

  // Scroll reveal animations
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Project category filters
  const projectFilterBtns = document.querySelectorAll("[data-project-filter]");
  const projectCards = document.querySelectorAll("#projects-grid .project-card");

  projectFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-project-filter");
      projectFilterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });

      projectCards.forEach((card) => {
        const cats = (card.getAttribute("data-categories") || "").split(" ");
        const show = filter === "all" || cats.includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Certification provider filters + search
  const certFilterBtns = document.querySelectorAll("[data-cert-filter]");
  const certCards = document.querySelectorAll("#certs-grid .cert-card");
  const certSearch = document.getElementById("cert-search");
  const certEmpty = document.getElementById("cert-empty");
  let activeCertProvider = "all";

  function filterCertifications() {
    const query = (certSearch ? certSearch.value : "").trim().toLowerCase();
    let visibleCount = 0;

    certCards.forEach((card) => {
      const provider = card.getAttribute("data-provider") || "";
      const text = card.textContent.toLowerCase();
      const matchesProvider = activeCertProvider === "all" || provider === activeCertProvider;
      const matchesQuery = !query || text.includes(query);
      const show = matchesProvider && matchesQuery;
      card.classList.toggle("is-hidden", !show);
      if (show) visibleCount += 1;
    });

    if (certEmpty) {
      certEmpty.hidden = visibleCount > 0;
    }
  }

  certFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCertProvider = btn.getAttribute("data-cert-filter") || "all";
      certFilterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      filterCertifications();
    });
  });

  if (certSearch) {
    certSearch.addEventListener("input", filterCertifications);
  }

  // Copy email to clipboard
  const copyEmailBtn = document.getElementById("copy-email-btn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      const value = copyEmailBtn.getAttribute("data-copy") || "a.elvishnimalkumar@gmail.com";
      try {
        await navigator.clipboard.writeText(value);
        showToast("Email copied to clipboard");
      } catch {
        showToast("Email: " + value);
      }
    });
  }

  // Contact form handling (mailto draft + copy fallback)
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const copyDraftBtn = document.getElementById("copy-draft-btn");

  function getFormValues() {
    return {
      name: (document.getElementById("contact-name")?.value || "").trim(),
      email: (document.getElementById("contact-email")?.value || "").trim(),
      subject: (document.getElementById("contact-subject")?.value || "").trim(),
      message: (document.getElementById("contact-message")?.value || "").trim(),
    };
  }

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const { name, email, subject, message } = getFormValues();

      if (!name || !email || !subject || !message) {
        formStatus.textContent = "Please fill in Name, Email, Subject, and Message.";
        formStatus.className = "form-status error";
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        formStatus.textContent = "Please enter a valid email address.";
        formStatus.className = "form-status error";
        return;
      }

      const body = `Hi Elvish,\n\n${message}\n\nBest regards,\n${name}\n(${email})`;
      const mailtoUrl = `mailto:a.elvishnimalkumar@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      formStatus.textContent = "Opening your email client with the message pre-filled. You can also copy the message text directly.";
      formStatus.className = "form-status success";
      window.location.href = mailtoUrl;
    });
  }

  if (copyDraftBtn && formStatus) {
    copyDraftBtn.addEventListener("click", async () => {
      const { name, email, subject, message } = getFormValues();
      const draft = `To: a.elvishnimalkumar@gmail.com\nSubject: ${subject || "(No subject)"}\nFrom: ${name || "(Your name)"} <${email || "(Your email)"}>\n\n${message}`;
      try {
        await navigator.clipboard.writeText(draft);
        showToast("Message draft copied to clipboard");
      } catch {
        formStatus.textContent = "Unable to access clipboard automatically.";
        formStatus.className = "form-status error";
      }
    });
  }
})();
