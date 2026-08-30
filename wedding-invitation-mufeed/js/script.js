document.addEventListener('DOMContentLoaded', () => {
    setupGate();
    setupMusic();
    setupScrollAnimations();
    setupParallaxFlorals();
    setupScratchCards();
    setupCountdown();
    setupCalendar();
    setupRSVP();
    setupParticleTrail();
});

/* ===== Gate Opening ===== */
function setupGate() {
    const gate = document.getElementById('gateSection');
    const openBtn = document.getElementById('openBtn');
    const music = document.getElementById('bgMusic');

    if (!gate || !openBtn) return;

    openBtn.addEventListener('click', () => {
        gate.classList.add('opening');
        document.body.classList.add('invitation-open');
        triggerGateBurst();

        if (music) {
            music.volume = 0.25;
            music.play().catch(() => {});
            updateMusicState(true);
        }

        setTimeout(() => {
            gate.classList.add('hidden');
        }, 1600);
    });
}

function triggerGateBurst() {
    if (typeof confetti !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (navigator.vibrate) {
        navigator.vibrate(12);
    }

    const colors = ['#b8956c', '#d4b896', '#c9a0a0', '#ebe2d4', '#7a95a8', '#1a3a52'];

    confetti({
        particleCount: 55,
        spread: 95,
        startVelocity: 22,
        origin: { x: 0.5, y: 0.48 },
        colors,
        ticks: 140,
        gravity: 0.75,
        scalar: 0.85,
        disableForReducedMotion: true
    });

    setTimeout(() => {
        confetti({
            particleCount: 28,
            angle: 65,
            spread: 50,
            startVelocity: 18,
            origin: { x: 0.12, y: 0.55 },
            colors,
            ticks: 120,
            gravity: 0.7,
            scalar: 0.75,
            disableForReducedMotion: true
        });
        confetti({
            particleCount: 28,
            angle: 115,
            spread: 50,
            startVelocity: 18,
            origin: { x: 0.88, y: 0.55 },
            colors,
            ticks: 120,
            gravity: 0.7,
            scalar: 0.75,
            disableForReducedMotion: true
        });
    }, 120);
}

/* ===== Parallax Florals ===== */
function setupParallaxFlorals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const florals = document.querySelectorAll('.deco-corner, .card-deco');
    if (!florals.length) return;

    const depthMap = {
        'deco-tl': 0.09, 'card-deco-tl': 0.08,
        'deco-tr': 0.07, 'card-deco-tr': 0.06,
        'deco-bl': 0.1, 'card-deco-bl': 0.09,
        'deco-br': 0.08, 'card-deco-br': 0.07
    };

    florals.forEach(el => {
        for (const cls of el.classList) {
            if (depthMap[cls]) {
                el.dataset.parallaxDepth = depthMap[cls];
                break;
            }
        }
        el.classList.add('parallax-floral');
    });

    let ticking = false;

    function isFlipped(el) {
        return el.classList.contains('deco-tr') ||
            el.classList.contains('deco-br') ||
            el.classList.contains('card-deco-tr') ||
            el.classList.contains('card-deco-br');
    }

    function updateParallax() {
        florals.forEach(el => {
            const section = el.closest('section');
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const depth = parseFloat(el.dataset.parallaxDepth || '0.08');
            const centerOffset = window.innerHeight * 0.5 - rect.top - rect.height * 0.5;
            const y = centerOffset * depth;
            const flip = isFlipped(el) ? ' scaleX(-1)' : '';

            el.style.transform = `translate3d(0, ${y}px, 0)${flip}`;
        });
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateParallax);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateParallax();
}

/* ===== Background Music ===== */
let isPlaying = false;
let manualPaused = false;

function setupMusic() {
    const music = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    const icon = document.getElementById('musicIcon');

    if (!music || !toggle) return;

    toggle.addEventListener('click', () => {
        if (isPlaying) {
            music.pause();
            isPlaying = false;
            manualPaused = true;
        } else {
            music.play().catch(() => {});
            isPlaying = true;
            manualPaused = false;
        }
        updateMusicState(isPlaying);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            music.pause();
        } else if (!document.hidden && isPlaying && !manualPaused) {
            music.play().catch(() => {});
        }
    });
}

function updateMusicState(playing) {
    const toggle = document.getElementById('musicToggle');
    const icon = document.getElementById('musicIcon');
    isPlaying = playing;

    if (toggle) {
        toggle.classList.toggle('muted', !playing);
    }
    if (icon) {
        icon.textContent = playing ? '♪' : '♫';
    }
}

/* ===== Scroll Animations ===== */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
}

/* ===== Scratch Cards ===== */
function setupScratchCards() {
    const canvases = document.querySelectorAll('.scratch-canvas');
    let completedCount = 0;

    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let isDrawing = false;
        let isCompleted = false;
        let lastX = 0;
        let lastY = 0;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        let gradient;
        if (ctx.createConicGradient) {
            gradient = ctx.createConicGradient(0, cx, cy);
            gradient.addColorStop(0, '#d4b896');
            gradient.addColorStop(0.2, '#b8956c');
            gradient.addColorStop(0.4, '#ebe2d4');
            gradient.addColorStop(0.6, '#8a7358');
            gradient.addColorStop(0.8, '#d4b896');
            gradient.addColorStop(1, '#b8956c');
        } else {
            gradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, cx);
            gradient.addColorStop(0, '#ebe2d4');
            gradient.addColorStop(1, '#b8956c');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 300; i++) {
            ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 20;

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = w / rect.width;
            const scaleY = h / rect.height;
            let clientX, clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function scratch(e) {
            if (!isDrawing || isCompleted) return;
            e.preventDefault();
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastX = pos.x;
            lastY = pos.y;
            checkDone();
        }

        function startDraw(e) {
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x;
            lastY = pos.y;
        }

        function stopDraw() {
            isDrawing = false;
        }

        function checkDone() {
            const imageData = ctx.getImageData(0, 0, w, h);
            const pixels = imageData.data;
            let transparent = 0;

            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparent++;
            }

            const percent = (transparent / (w * h)) * 100;
            if (percent > 45 && !isCompleted) {
                isCompleted = true;
                canvas.style.opacity = '0';
                canvas.style.transition = 'opacity 0.4s';
                setTimeout(() => { canvas.style.display = 'none'; }, 400);
                completedCount++;
                if (completedCount === canvases.length && typeof confetti === 'function') {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#1a3a52', '#b8956c', '#d4b896', '#f2f5f8']
                    });
                }
            }
        }

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);
        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', scratch, { passive: false });
        canvas.addEventListener('touchend', stopDraw);
    });
}

/* ===== Countdown ===== */
function setupCountdown() {
    const target = new Date('August 6, 2026 12:30:00').getTime();
    const els = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    const timer = setInterval(() => {
        const now = Date.now();
        const diff = target - now;

        if (diff < 0) {
            clearInterval(timer);
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        if (els.days) els.days.textContent = pad(d);
        if (els.hours) els.hours.textContent = pad(h);
        if (els.minutes) els.minutes.textContent = pad(m);
        if (els.seconds) els.seconds.textContent = pad(s);
    }, 1000);
}

/* ===== Add to Calendar ===== */
const CALENDAR_EVENTS = {
    nikah: {
        uid: 'nikah-anzal-nashva@anzal-nashva.vercel.app',
        filename: 'anzal-nashva-nikah.ics',
        title: 'Nikah Ceremony — Anzal Ishaq & Nashva Nazrin',
        description: 'Nikah ceremony of Anzal Ishaq & Nashva Nazrin.\nhttps://www.google.com/maps/search/Amani+Auditorium+South+Bazar+Dhanalakshmi+Road+Kannur',
        location: 'Amani Auditorium, South Bazar, Dhanalakshmi Road, Kannur',
        start: [2026, 8, 6, 19, 0],
        end: [2026, 8, 6, 21, 0]
    }
};

function setupCalendar() {
    document.querySelectorAll('[data-calendar]').forEach(btn => {
        btn.addEventListener('click', () => {
            const event = CALENDAR_EVENTS[btn.dataset.calendar];
            if (!event) return;
            downloadICS(event);
        });
    });
}

function padCalendar(n) {
    return String(n).padStart(2, '0');
}

function formatCalendarDate(parts) {
    const [year, month, day, hour, minute] = parts;
    return `${year}${padCalendar(month)}${padCalendar(day)}T${padCalendar(hour)}${padCalendar(minute)}00`;
}

function escapeICS(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

function downloadICS(event) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Anzal Nashva Wedding//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=Asia/Kolkata:${formatCalendarDate(event.start)}`,
        `DTEND;TZID=Asia/Kolkata:${formatCalendarDate(event.end)}`,
        `SUMMARY:${escapeICS(event.title)}`,
        `DESCRIPTION:${escapeICS(event.description)}`,
        `LOCATION:${escapeICS(event.location)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = event.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

/* ===== RSVP ===== */
function setupRSVP() {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const message = document.getElementById('rsvpMessage');

    if (!yesBtn || !noBtn || !message) return;

    yesBtn.addEventListener('click', (e) => {
        message.textContent = 'Alhamdulillah! We cannot wait to celebrate with you!';
        message.style.opacity = '1';
        yesBtn.classList.add('happy');
        setTimeout(() => yesBtn.classList.remove('happy'), 500);

        let originX = 0.5, originY = 0.7;
        if (e.target) {
            const rect = e.target.getBoundingClientRect();
            originX = (rect.left + rect.width / 2) / window.innerWidth;
            originY = (rect.top + rect.height / 2) / window.innerHeight;
        }

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { x: originX, y: originY },
                colors: ['#1a3a52', '#b8956c', '#d4b896', '#ffffff'],
                zIndex: 9999
            });
        }
    });

    noBtn.addEventListener('click', () => {
        message.textContent = 'We will keep you in our duas. Jazakallahu Khair for letting us know.';
        message.style.opacity = '1';
        noBtn.classList.add('sad');
        setTimeout(() => noBtn.classList.remove('sad'), 400);
    });
}

/* ===== Gold Particle Trail ===== */
function setupParticleTrail() {
    const symbols = ['✦', '♡', '♥'];
    let throttle = 0;

    function spawn(e) {
        const now = Date.now();
        if (now - throttle < 80) return;
        throttle = now;

        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else if (e.clientX !== undefined) {
            x = e.clientX;
            y = e.clientY;
        } else {
            return;
        }

        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
    }

    document.addEventListener('mousemove', spawn);
    document.addEventListener('touchmove', spawn, { passive: true });
}
