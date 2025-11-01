import { copyToClipboard, addColorToPalette, showNotification } from './main.js';

// =========================
// GRADIENT PAGE
// =========================

export function initGradientGenerator() {
    const color1Picker = document.getElementById('gradientColor1');
    const color2Picker = document.getElementById('gradientColor2');
    const hex1Input = document.getElementById('gradientHex1');
    const hex2Input = document.getElementById('gradientHex2');
    const startColorPreview = document.getElementById('startColorPreview');
    const endColorPreview = document.getElementById('endColorPreview');
    const directionBtns = document.querySelectorAll('.direction-btn');
    const generateBtn = document.getElementById('generateGradientBtn');
    const previewSection = document.getElementById('gradientPreviewSection');
    const gradientPreview = document.getElementById('gradientPreview');
    const cssCode = document.getElementById('cssCode');
    const copyCSSBtn = document.getElementById('copyCSSBtn');
    const addBothBtn = document.getElementById('addGradientColorsToPalette');
    
    if (!color1Picker || !color2Picker) return;
    
    let currentDirection = 'to top';
    
    // Dynamic gradient update function
    function updateGradient() {
        const color1 = color1Picker.value;
        const color2 = color2Picker.value;
        
        const gradientCSS = `linear-gradient(${currentDirection}, ${color1}, ${color2})`;
        const fullCSS = `background: ${gradientCSS};`;
        
        // Update preview
        if (gradientPreview) {
            gradientPreview.style.background = gradientCSS;
        }
        if (cssCode) {
            cssCode.textContent = fullCSS;
        }
        
        // Show preview section automatically
        if (previewSection) {
            previewSection.style.display = 'block';
        }
    }
    
    // Sync color pickers, hex inputs, and preview circles with dynamic update
    color1Picker.addEventListener('input', (e) => {
        hex1Input.value = e.target.value;
        if (startColorPreview) {
            startColorPreview.style.background = e.target.value;
        }
        updateGradient();
    });
    
    hex1Input.addEventListener('input', (e) => {
        let hex = e.target.value;
        if (hex.startsWith('#') && (hex.length === 4 || hex.length === 7)) {
            color1Picker.value = hex;
            if (startColorPreview) {
                startColorPreview.style.background = hex;
            }
            updateGradient();
        }
    });
    
    color2Picker.addEventListener('input', (e) => {
        hex2Input.value = e.target.value;
        if (endColorPreview) {
            endColorPreview.style.background = e.target.value;
        }
        updateGradient();
    });
    
    hex2Input.addEventListener('input', (e) => {
        let hex = e.target.value;
        if (hex.startsWith('#') && (hex.length === 4 || hex.length === 7)) {
            color2Picker.value = hex;
            if (endColorPreview) {
                endColorPreview.style.background = hex;
            }
            updateGradient();
        }
    });
    
    // Direction button selection with dynamic update
    directionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            directionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDirection = btn.getAttribute('data-direction');
            updateGradient();
        });
    });
    
    // Generate gradient button (for aesthetic/initial generation)
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            updateGradient();
            showNotification('Gradient generated!');
        });
    }
    
    // Copy CSS button
    if (copyCSSBtn) {
        copyCSSBtn.addEventListener('click', () => {
            const css = cssCode.textContent;
            copyToClipboard(css, `Copied CSS: ${css}`);
        });
    }
    
    // Add both colors to palette
    if (addBothBtn) {
        addBothBtn.addEventListener('click', () => {
            const color1 = color1Picker.value;
            const color2 = color2Picker.value;
            addColorToPalette(color1);
            addColorToPalette(color2);
            showNotification(`Added ${color1} and ${color2} to palette`);
        });
    }
    
    // Initial gradient generation
    updateGradient();
}