// Cozy one-page interactions: mobile nav, reveal on scroll, form -> mailto, subtle parallax
(() => {
    const qs = (s, el = document) => el.querySelector(s);
    const qsa = (s, el = document) => [...el.querySelectorAll(s)];

    // Year
    const yearEl = qs("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile nav
    const toggle = qs(".navToggle");
    const navLinks = qsa(".nav a");

    const closeNav = () => {
        document.body.classList.remove("nav-open");
        toggle?.setAttribute("aria-expanded", "false");
        toggle?.setAttribute("aria-label", "Open menu");
    };

    toggle?.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navLinks.forEach((a) => a.addEventListener("click", closeNav));

    // Close nav on Escape
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
    });

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal on scroll
    const revealEls = qsa(".reveal");
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));

    // Back to top
    const toTop = qs(".toTop");
    const scrollToTop = () => {
        const behavior = prefersReduced ? "auto" : "smooth";
        document.documentElement.scrollTo({ top: 0, left: 0, behavior });
        document.body.scrollTo({ top: 0, left: 0, behavior });
        window.scrollTo({ top: 0, left: 0, behavior });
    };
    toTop?.addEventListener("click", (e) => {
        e.preventDefault();
        scrollToTop();
    });

    // Hero carousel
    const carousel = qs(".carousel");
    if (carousel) {
        const track = qs("[data-carousel]", carousel);
        const slides = qsa(".carousel__slide", carousel);
        const dots = qsa("[data-carousel-dot]", carousel);
        const prev = qs("[data-carousel-prev]", carousel);
        const next = qs("[data-carousel-next]", carousel);
        let index = 0;

        const setActive = (nextIndex) => {
            if (!slides.length) return;
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                const isActive = i === index;
                slide.classList.toggle("is-active", isActive);
                slide.setAttribute("aria-hidden", String(!isActive));
            });
            dots.forEach((dot, i) => {
                const isActive = i === index;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-current", isActive ? "true" : "false");
            });
        };

        prev?.addEventListener("click", () => setActive(index - 1));
        next?.addEventListener("click", () => setActive(index + 1));
        dots.forEach((dot) =>
            dot.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const nextIndex = Number(target.getAttribute("data-carousel-dot"));
                if (!Number.isNaN(nextIndex)) setActive(nextIndex);
            })
        );

        setActive(0);
    }

    // Contact form -> opens email client with prefilled content
    const form = qs("#contactForm");
    const toast = qs("#toast");

    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.style.display = "block";
        toast.animate(
            [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => (toast.style.display = "none"), 3400);
    }

    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const email = String(data.get("email") || "").trim();
        const item = String(data.get("item") || "").trim();
        const details = String(data.get("details") || "").trim();

        const to = "elsasberrybar@gmail.com"; // <-- change this
        const subject = encodeURIComponent(`Order Inquiry - ${item || "Treats"}`);
        const body = encodeURIComponent(
            `Hi! My name is ${name}.\n\n` +
            `I’m interested in: ${item}\n\n` +
            `Details:\n${details}\n\n` +
            `You can reach me at: ${email}\n\n` +
            `Thank you!`
        );

        const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
        showToast("Opening your email app with a pre-filled message…");
        window.location.href = mailto;
    });

    // Subtle parallax on hero card (pointer-based, very gentle)
    const card = qs(".hero__card");
    let raf = 0;

    function parallax(e) {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            card.style.transform = `rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
        });
    }

    function resetParallax() {
        if (!card) return;
        card.style.transform = "rotateX(0deg) rotateY(0deg)";
    }

    // Only enable if not reduced motion
    if (!prefersReduced && card) {
        card.addEventListener("mousemove", parallax);
        card.addEventListener("mouseleave", resetParallax);
        card.addEventListener("touchstart", resetParallax, { passive: true });
    }
})();
