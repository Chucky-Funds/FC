/* --- GLOBAL CONFIGURATION & STATE --- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let dots = [];
const dotCount = window.innerWidth < 768 ? 30 : 80;
const mouse = { x: null, y: null, radius: 170 };

// Helper to check for touch devices
const isTouchDevice = 'ontouchstart' in window;
if (isTouchDevice) {
    mouse.radius = 0; // Disable mouse lines on mobile
}

const isDesktop = window.matchMedia("(hover: hover)").matches;

/* --- CANVAS BACKGROUND LOGIC --- */
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    dots = [];
    for (let i = 0; i < dotCount; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2
        });
    }
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeStyle = 'rgba(255, 0, 51, 0.15)';

    dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();

        if (mouse.x && mouse.y) {
            let dx = mouse.x - dot.x;
            let dy = mouse.y - dot.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                ctx.beginPath();
                ctx.lineWidth = 0.5;
                ctx.moveTo(dot.x, dot.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(drawDots);
}

/* --- INTERSECTION OBSERVER (REVEAL & PROGRESS BARS) --- */
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const mainObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, observerOptions);

// Observe reveal elements and skill border containers
document.querySelectorAll('.reveal, .f-border-container').forEach(el => mainObserver.observe(el));

/* --- MOUSE TRACKING & COORDINATES --- */
const mouseXText = document.getElementById('mouse-x');
const mouseYText = document.getElementById('mouse-y');
const scannerLine = document.getElementById('hero-scanner');
const mouseFollower = document.getElementById('mouse-follower');

window.addEventListener('mousemove', (e) => {
    // 1. Update Global Mouse State for Canvas
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // 2. Update Hero UI Coordinates
    if (mouseXText && mouseYText) {
        mouseXText.innerText = e.clientX.toString().padStart(3, '0');
        mouseYText.innerText = e.clientY.toString().padStart(3, '0');
    }

    // 3. Vertical Scanner follow
    if (scannerLine) scannerLine.style.transform = `translateY(${e.clientY}px)`;
    if (mouseFollower) mouseFollower.style.transform = `translateY(${e.clientY}px)`;
});

/* --- SCROLL INTERACTIONS --- */
window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    const container = document.getElementById('nav-container');
    const rail = document.getElementById('timeline-indicator');
    const section = document.getElementById('experience');

    // 1. Nav Shrink & Interaction
    if (nav && container) {
        if (window.scrollY > 50) {
            container.classList.remove('py-4', 'md:py-6');
            container.classList.add('py-2', 'md:py-3');
            nav.classList.add('bg-f-black/95', 'shadow-[0_0_30px_rgba(255,0,51,0.1)]');
        } else {
            container.classList.remove('py-2', 'md:py-3');
            container.classList.add('py-4', 'md:py-6');
            nav.classList.remove('bg-f-black/95', 'shadow-[0_0_30px_rgba(255,0,51,0.1)]');
        }
    }

    // 2. Timeline Indicator Rail
    if (rail && section) {
        const sectionRect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        let scrollPercent = ((window.innerHeight / 2) - sectionRect.top) / sectionHeight;
        scrollPercent = Math.max(0, Math.min(1, scrollPercent));
        rail.style.top = `${scrollPercent * 100}%`;

        if (scrollPercent > 0 && scrollPercent < 1) {
            rail.classList.add('shadow-[0_0_25px_#ff0033]');
        } else {
            rail.classList.remove('shadow-[0_0_25px_#ff0033]');
        }
    }
});

/* --- 3D TILT EFFECTS (Merged) --- */
if (isDesktop) {
    // About Section Tilt
    const tiltCardAbout = document.getElementById('tilt-card-enhanced');
    if (tiltCardAbout) {
        tiltCardAbout.addEventListener('mousemove', (e) => {
            const rect = tiltCardAbout.getBoundingClientRect();
            const rotateX = (e.clientY - rect.top - (rect.height / 2)) / 20;
            const rotateY = ((rect.width / 2) - (e.clientX - rect.left)) / 20;
            tiltCardAbout.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        tiltCardAbout.addEventListener('mouseleave', () => {
            tiltCardAbout.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    }

    // Experience Nodes Tilt
    const expNodes = document.querySelectorAll('.f-border-container');
    expNodes.forEach(node => {
        node.addEventListener('mousemove', (e) => {
            const rect = node.getBoundingClientRect();
            const rotateX = (e.clientY - rect.top - (rect.height / 2)) / 30;
            const rotateY = ((rect.width / 2) - (e.clientX - rect.left)) / 30;
            node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        node.addEventListener('mouseleave', () => {
            node.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    });

    // System Diagnostic Card Magnetism (Footer)
    const diagnosticCard = document.querySelector('#final-node .f-border-container');
    if (diagnosticCard) {
        diagnosticCard.addEventListener('mousemove', (e) => {
            const rect = diagnosticCard.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            diagnosticCard.style.transform = `perspective(500px) rotateX(${y * 10}deg) rotateY(${x * 10}deg)`;
        });
        diagnosticCard.addEventListener('mouseleave', () => {
            diagnosticCard.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg)`;
        });
    }
}

/* --- LOG STREAM & SYSTEM STATUS --- */
const logs = [
    "> INITIALIZING BOOT_SEQUENCE", "> LOADING NEURAL_NETWORKS...",
    "> SHADERS COMPILED SUCCESSFULLY", "> CONNECTING TO DATABASE_CORE",
    "> BYPASSING FIREWALL...", "> ACCESS GRANTED: USER_ADMIN",
    "> RESOLVING ASSETS...", "> SYSTEM STATUS: OPTIMAL"
];
const logContainer = document.getElementById('log-stream');
let logIndex = 0;

function addLog() {
    if (!logContainer) return;
    const p = document.createElement('p');
    p.innerText = logs[logIndex % logs.length];
    logContainer.appendChild(p);
    if (logContainer.childNodes.length > 8) logContainer.removeChild(logContainer.firstChild);
    logIndex++;
    setTimeout(addLog, Math.random() * 2000 + 500);
}

/* --- CLOCK & UPTIME --- */
function updateClock() {
    const el = document.getElementById('nav-clock');
    if (!el) return;
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ":" +
        now.getMinutes().toString().padStart(2, '0') + ":" +
        now.getSeconds().toString().padStart(2, '0') + ":" +
        Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
    el.innerText = time;
}

let uptimeSeconds = 0;
function updateUptime() {
    const uptimeDisplay = document.getElementById('footer-uptime');
    if (!uptimeDisplay) return;
    uptimeSeconds++;
    const h = Math.floor(uptimeSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((uptimeSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (uptimeSeconds % 60).toString().padStart(2, '0');
    const ms = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    uptimeDisplay.innerText = `${h}:${m}:${s}:${ms}`;
}

/* --- COUNTER ANIMATION --- */
const startCounters = () => {
    document.querySelectorAll('.counter').forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const speed = target / 50;
            if (count < target) {
                counter.innerText = Math.ceil(count + speed);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target + (target === 128 ? "" : "%");
            }
        };
        updateCount();
    });
};

/* --- DOM CONTENT LOADED TRIGGER --- */
document.addEventListener('DOMContentLoaded', () => {
    // Init Canvas
    initCanvas();
    drawDots();
    window.addEventListener('resize', initCanvas);

    // Initial Nav State
    const nav = document.getElementById('main-nav');
    if (nav) {
        setTimeout(() => {
            nav.classList.remove('-translate-y-full', 'opacity-0');
        }, 500);
    }

    // Start Loops
    setInterval(updateClock, 50);
    setInterval(updateUptime, 100);
    addLog();
    setTimeout(startCounters, 1000);

    // Skill Proximity Interaction
    const interactiveZone = document.getElementById('skill-interactive-zone');
    const proximityGlow = document.getElementById('proximity-glow');
    if (interactiveZone && proximityGlow) {
        interactiveZone.addEventListener('mousemove', (e) => {
            const rect = interactiveZone.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            proximityGlow.style.transform = `translate(${x - 128}px, ${y - 128}px)`;
        });
        interactiveZone.addEventListener('mouseleave', () => { proximityGlow.style.opacity = "0"; });
        interactiveZone.addEventListener('mouseenter', () => { proximityGlow.style.opacity = "1"; });
    }

    // Portfolio Image Parallax
    document.querySelectorAll('.f-border-container').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const img = card.querySelector('img');
            if (!img) return;
            const rect = card.getBoundingClientRect();
            const moveX = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
            const moveY = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
            img.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
        });
        card.addEventListener('mouseleave', (e) => {
            const img = card.querySelector('img');
            if (img) img.style.transform = `scale(1) translate(0, 0)`;
        });
    });

    // Contact Logic
    document.querySelectorAll('#contact h3').forEach(header => {
        header.addEventListener('mouseenter', () => {
            header.classList.add('animate-pulse');
            header.style.textShadow = '2px 0 #ff0033, -2px 0 #fff';
        });
        header.addEventListener('mouseleave', () => {
            header.classList.remove('animate-pulse');
            header.style.textShadow = 'none';
        });
    });

    const statusCard = document.querySelector('#contact .bg-f-red');
    if (statusCard) {
        statusCard.addEventListener('mousemove', (e) => {
            const rect = statusCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            statusCard.style.background = `radial-gradient(circle at ${x}px ${y}px, #ff1a4a, #ff0033)`;
        });
    }

    // Footer Flicker logic
    document.querySelectorAll('#final-node a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.filter = 'drop-shadow(0 0 5px #ff0033)';
            link.style.letterSpacing = '2px';
        });
        link.addEventListener('mouseleave', () => {
            link.style.filter = 'none';
            link.style.letterSpacing = 'normal';
        });
    });

    // Mobile Menu Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const body = document.body;

    function toggleMenu() {
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
            drawer.classList.remove('open');
            menuBtn.classList.remove('open');
            body.classList.remove('menu-open');
        } else {
            drawer.classList.add('open');
            menuBtn.classList.add('open');
            body.classList.add('menu-open');
        }
    }

    if (menuBtn && drawer) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
        });
        drawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (drawer.classList.contains('open')) toggleMenu();
            });
        });
    }
});