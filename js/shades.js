import { rgbToHex, hexToRgb, rgbToHsl, hslToRgb, showNotification, copyToClipboard, addColorToPalette } from './main.js';

// =========================
// SHADES PAGE
// =========================

export function initShadesGenerator() {
    const baseColorPicker = document.getElementById('baseColorPicker');
    const baseColorHex = document.getElementById('baseColorHex');
    const baseColorPreview = document.getElementById('baseColorPreview');
    const generateBtn = document.getElementById('generateShadesBtn');
    const shadesGrid = document.getElementById('shadesGrid');
    
    if (!baseColorPicker || !generateBtn) return;
    
    // Sync color picker, hex input, and preview circle
    baseColorPicker.addEventListener('input', (e) => {
        baseColorHex.value = e.target.value;
        if (baseColorPreview) {
            baseColorPreview.style.background = e.target.value;
        }
    });
    
    baseColorHex.addEventListener('input', (e) => {
        let hex = e.target.value;
        if (hex.startsWith('#') && (hex.length === 4 || hex.length === 7)) {
            baseColorPicker.value = hex;
            if (baseColorPreview) {
                baseColorPreview.style.background = hex;
            }
        }
    });
    
    // Generate shades
    generateBtn.addEventListener('click', () => {
        const hex = baseColorPicker.value;
        generateShades(hex);
    });
    
    function generateShades(hex) {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        shadesGrid.innerHTML = '';
        
        // Generate 12 shades from darkest to lightest
        const shadeCount = 12;
        for (let i = 0; i < shadeCount; i++) {
            const lightness = (i / (shadeCount - 1)) * 100;
            const shadeHsl = { h: hsl.h, s: hsl.s, l: lightness };
            const shadeRgb = hslToRgb(shadeHsl.h, shadeHsl.s, shadeHsl.l);
            const shadeHex = rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
            const shadeRgbStr = `rgb(${Math.round(shadeRgb.r)}, ${Math.round(shadeRgb.g)}, ${Math.round(shadeRgb.b)})`;
            
            const tile = document.createElement('div');
            tile.className = 'shade-tile';
            tile.style.animationDelay = `${i * 0.05}s`;
            
            tile.innerHTML = `
                <div class="shade-color" style="background: ${shadeHex}"></div>
                <div class="shade-info">Shade ${i + 1}</div>
                <div class="shade-hex">${shadeHex}</div>
                <div class="shade-rgb">${shadeRgbStr}</div>
                <div style="display: flex; gap: 4px; margin-bottom: 6px;">
                    <button class="btn btn-primary shade-copy-hex-btn" data-hex="${shadeHex}" style="flex: 1; padding: 6px; font-size: 0.75rem;">
                        HEX
                    </button>
                    <button class="btn btn-primary shade-copy-rgb-btn" data-rgb="${shadeRgbStr}" style="flex: 1; padding: 6px; font-size: 0.75rem;">
                        RGB
                    </button>
                </div>
                <button class="btn btn-secondary shade-add-btn" data-hex="${shadeHex}" style="width: 100%; padding: 6px; font-size: 0.8rem;">
                    ➕ Add
                </button>
            `;
            
            shadesGrid.appendChild(tile);
        }
        
        // Add event listeners to HEX copy buttons
        document.querySelectorAll('.shade-copy-hex-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const hex = btn.getAttribute('data-hex');
                copyToClipboard(hex, `Copied HEX: ${hex}`);
            });
        });
        
        // Add event listeners to RGB copy buttons
        document.querySelectorAll('.shade-copy-rgb-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const rgb = btn.getAttribute('data-rgb');
                copyToClipboard(rgb, `Copied RGB: ${rgb}`);
            });
        });
        
        // Add event listeners to add buttons
        document.querySelectorAll('.shade-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const hex = btn.getAttribute('data-hex');
                addColorToPalette(hex);
                showNotification(`Added ${hex} to palette`);
            });
        });
        
        showNotification('Shades generated successfully!');
    }
}