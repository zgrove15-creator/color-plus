function initializeComplementFinder() {
    console.log('Initializing Complement Finder tool...');

    const harmonyColorInput = document.getElementById('harmony-color');
    const harmonyColorPicker = document.getElementById('harmony-color-picker');
    const harmonyColorPreview = document.getElementById('harmony-color-preview');
    const harmonyColorError = document.getElementById('harmony-color-error');
    const harmonyTypeSelect = document.getElementById('harmony-type');
    const generateHarmonyBtn = document.getElementById('generate-harmony');
    const harmonyResults = document.getElementById('harmony-results');
    const harmonyGrid = document.getElementById('harmony-grid');
    const harmonyTitle = document.getElementById('harmony-title');

    const harmonyTitles = {
        complementary: 'Complementary Harmony',
        analogous: 'Analogous Harmony',
        triadic: 'Triadic Harmony',
        tetradic: 'Tetradic Harmony',
        'split-complementary': 'Split-Complementary Harmony'
    };

    // Initial setup
    updatePreview();

    // EVENT LISTENERS
    harmonyColorPreview.addEventListener('click', () => harmonyColorPicker.click());

    harmonyColorPicker.addEventListener('change', function () {
        harmonyColorInput.value = this.value;
        updatePreview();
        updateColorValidation(harmonyColorInput, harmonyColorError);
    });

    harmonyColorInput.addEventListener('input', function () {
        updatePreview();
        updateColorValidation(harmonyColorInput, harmonyColorError);
    });

    harmonyTypeSelect.addEventListener('change', generateHarmony);
    generateHarmonyBtn.addEventListener('click', generateHarmony);

    // KEYBOARD SHORTCUTS
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeNav = document
                .querySelector('.nav-box.active')
                .getAttribute('data-tool');
            if (activeNav === 'harmony') {
                e.preventDefault();
                generateHarmony();
            }
        }
    });

    function updatePreview() {
        harmonyColorPreview.style.backgroundColor = harmonyColorInput.value || '#fff';
        if (chroma.valid(harmonyColorInput.value)) {
            harmonyColorPicker.value = chroma(harmonyColorInput.value).hex();
        }
    }

    // COLOR HARMONY GENERATION
    function generateHarmony() {
        const baseColor = harmonyColorInput.value;
        const harmonyType = harmonyTypeSelect.value;

        if (!chroma.valid(baseColor)) {
            harmonyColorError.textContent = '⚠️ Invalid format. Use #RRGGBB';
            harmonyColorError.classList.add('show');
            harmonyColorInput.classList.add('invalid');
            return;
        }

        harmonyColorError.classList.remove('show');

        const colors = generateHarmonyColors(baseColor, harmonyType);
        displayHarmony(colors, harmonyType);
    }

    function generateHarmonyColors(baseHex, type) {
        const base = chroma(baseHex);
        const [h, s, l] = base.hsl();

        let colors = [base];

        if (type === 'complementary') {
            const complementary = chroma.hsl((h + 180) % 360, s, l);
            colors.push(complementary);
        } else if (type === 'analogous') {
            const analog1 = chroma.hsl((h - 30 + 360) % 360, s, l);
            const analog2 = chroma.hsl((h + 30) % 360, s, l);
            colors = [analog1, base, analog2];
        } else if (type === 'triadic') {
            const triadic1 = chroma.hsl((h + 120) % 360, s, l);
            const triadic2 = chroma.hsl((h + 240) % 360, s, l);
            colors = [base, triadic1, triadic2];
        } else if (type === 'tetradic') {
            const tet1 = chroma.hsl((h + 90) % 360, s, l);
            const tet2 = chroma.hsl((h + 180) % 360, s, l);
            const tet3 = chroma.hsl((h + 270) % 360, s, l);
            colors = [base, tet1, tet2, tet3];
        } else if (type === 'split-complementary') {
            const split1 = chroma.hsl((h + 150) % 360, s, l);
            const split2 = chroma.hsl((h + 210) % 360, s, l);
            colors = [base, split1, split2];
        }

        return colors.map((c, index) => ({
            hex: c.hex().toUpperCase(),
            color: c,
            isBase: index === 0
        }));
    }

    function displayHarmony(colors, type) {
        harmonyTitle.textContent = harmonyTitles[type] || 'Color Harmony';

        let html = '';
        colors.forEach((colorObj) => {
            const baseClass = colorObj.isBase ? 'harmony-card base-color' : 'harmony-card';
            html += `
                <div class="${baseClass}">
                    <div class="harmony-swatch" style="background-color: ${colorObj.hex}"></div>
                    <div class="harmony-hex">${colorObj.hex}</div>
                    <button class="harmony-copy-btn" data-hex="${colorObj.hex}">Copy Hex</button>
                </div>
            `;
        });

        harmonyGrid.innerHTML = html;
        harmonyResults.classList.add('active');

        const copyBtns = harmonyGrid.querySelectorAll('.harmony-copy-btn');
        copyBtns.forEach((btn) => {
            btn.addEventListener('click', function () {
                const hex = this.getAttribute('data-hex');
                copyHexToClipboard(this, hex);
            });
        });
    }
}
