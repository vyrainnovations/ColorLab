// =========================
// UTILITY FUNCTIONS
// =========================

// Convert RGB values to HEX
export function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

// Convert HEX to RGB
export function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

// Convert RGB to HSL
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB
export function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return { r: r * 255, g: g * 255, b: b * 255 };
}

// Show notification toast
export function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Copy text to clipboard
export async function copyToClipboard(text, message) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification(message || `Copied: ${text}`);
    } catch (err) {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard');
    }
}

// =========================
// PALETTE MANAGEMENT (Shared across all pages with sessionStorage)
// =========================

export let userPalette = [];

// Load palette from sessionStorage on initialization
export function loadPalette() {
    const saved = sessionStorage.getItem('vyra-palette');
    if (saved) {
        try {
            userPalette = JSON.parse(saved);
        } catch (e) {
            userPalette = [];
        }
    }
}

// Save palette to sessionStorage
export function savePalette() {
    sessionStorage.setItem('vyra-palette', JSON.stringify(userPalette));
}

export function addColorToPalette(hex) {
    if (!userPalette.includes(hex.toUpperCase())) {
        userPalette.push(hex.toUpperCase());
        savePalette();
        renderPalette();
    } else {
        showNotification('Color already in palette');
    }
}

export function removeColorFromPalette(hex) {
    userPalette = userPalette.filter(c => c !== hex);
    savePalette();
    renderPalette();
}

export function renderPalette() {
    const container = document.getElementById('paletteContainer');
    if (!container) return;
    
    if (userPalette.length === 0) {
        container.innerHTML = '<p class="empty-message">Add colors to build your palette</p>';
        return;
    }
    
    container.innerHTML = '';
    userPalette.forEach(hex => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        swatch.style.background = hex;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'swatch-tooltip';
        tooltip.textContent = hex;
        
        const actions = document.createElement('div');
        actions.className = 'swatch-actions';
        
        const copyHexBtn = document.createElement('button');
        copyHexBtn.textContent = 'H';
        copyHexBtn.setAttribute('aria-label', 'Copy HEX');
        copyHexBtn.setAttribute('title', 'Copy HEX');
        copyHexBtn.onclick = (e) => {
            e.stopPropagation();
            copyToClipboard(hex, `Copied HEX: ${hex}`);
        };
        
        const copyRgbBtn = document.createElement('button');
        copyRgbBtn.textContent = 'R';
        copyRgbBtn.setAttribute('aria-label', 'Copy RGB');
        copyRgbBtn.setAttribute('title', 'Copy RGB');
        copyRgbBtn.onclick = (e) => {
            e.stopPropagation();
            const rgb = hexToRgb(hex);
            const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            copyToClipboard(rgbStr, `Copied RGB: ${rgbStr}`);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.setAttribute('aria-label', 'Delete color');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            removeColorFromPalette(hex);
        };
        
        actions.appendChild(copyHexBtn);
        actions.appendChild(copyRgbBtn);
        actions.appendChild(deleteBtn);
        swatch.appendChild(tooltip);
        swatch.appendChild(actions);
        container.appendChild(swatch);
    });
}

// =========================
// THEME TOGGLE (Shared with persistence)
// =========================

export function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    
    // Load saved theme from sessionStorage
    const savedTheme = sessionStorage.getItem('vyra-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    function updateThemeIcons(theme) {
        const icon = theme === 'light' ? '☀️' : '🌙';
        if (themeToggle) themeToggle.textContent = icon;
        if (mobileThemeToggle) mobileThemeToggle.textContent = icon;
    }
    
    updateThemeIcons(savedTheme);
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcons(newTheme);
        sessionStorage.setItem('vyra-theme', newTheme);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
}

// =========================
// MOBILE NAVIGATION
// =========================

export function initMobileNavigation() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    
    if (!hamburgerBtn || !mobileOverlay) return;
    
    let focusableElements = [];
    let firstFocusableElement = null;
    let lastFocusableElement = null;
    
    function openMobileMenu() {
        mobileOverlay.classList.add('active');
        hamburgerBtn.classList.add('active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        focusableElements = Array.from(mobileOverlay.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        if (firstFocusableElement) {
            setTimeout(() => firstFocusableElement.focus(), 100);
        }
    }
    
    function closeMobileMenu() {
        mobileOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburgerBtn.focus();
    }
    
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mobileOverlay.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay) {
            closeMobileMenu();
        }
    });
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
            closeMobileMenu();
        }
        
        if (mobileOverlay.classList.contains('active') && e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
}

// =========================
// SCROLL REVEAL ANIMATIONS
// =========================

export function initScrollReveal() {
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const revealElements = document.querySelectorAll('.glass-card, .page-header');
    revealElements.forEach(el => {
        observer.observe(el);
    });
}