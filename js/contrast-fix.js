function initializeContrastFix() {
    console.log('Initializing Contrast Fix tool...');

    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');

    const color1Preview = document.getElementById('color1-preview');
    const color2Preview = document.getElementById('color2-preview');

    const color1Picker = document.getElementById('color1-picker');
    const color2Picker = document.getElementById('color2-picker');

    const color1Error = document.getElementById('color1-error');
    const color2Error = document.getElementById('color2-error');

    const lockColor1 = document.getElementById('lock-color1');
    const lockColor2 = document.getElementById('lock-color2');

    const contrastLevelSelect = document.getElementById('contrast-level');
    const getResultsBtn = document.getElementById('get-results');

    const resultsSection = document.getElementById('results');
    const resultsGridContainer = document.getElementById('results-grid-container');

    const swapBtn = document.getElementById('swap-colors');

    const contrastRatio = document.getElementById('contrast-ratio');
    const contrastStatus = document.getElementById('contrast-status');
    const contrastDisplay = document.getElementById('contrast-display');

    const wcagBadges = document.getElementById('wcag-badges');

    let lastTextHex = color1Input.value;
    let lastBgHex = color2Input.value;

    // Initial setup
    updatePreviews();
    updateContrastDisplay();

    // -------------------------
    // KEYBOARD SHORTCUTS
    // -------------------------
    document.addEventListener('keydown', function (e) {

        // ⌘/Ctrl + Enter → Run contrast check
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeTab = document
                .querySelector('.tab-btn.active')
                .getAttribute('data-tool');

            if (activeTab === 'contrast') {
                e.preventDefault();
                getResultsBtn.click();
            }
        }

        // S → Swap colors
        if ((e.key === 's' || e.key === 'S') && !isInputFocused(e.target)) {
            const activeTab = document
                .querySelector('.tab-btn.active')
                .getAttribute('data-tool');

            if (activeTab === 'contrast') {
                e.preventDefault();
                swapBtn.click();
                showShortcutFeedback('Swapped colors');
            }
        }

        // C → Copy text color
        if ((e.key === 'c' || e.key === 'C') && !isInputFocused(e.target)) {
            const activeTab = document
                .querySelector('.tab-btn.active')
                .getAttribute('data-tool');

            if (activeTab === 'contrast') {
                e.preventDefault();
                copyToClipboard(lastTextHex, 'Text color copied');
            }
        }

        // B → Copy background color
        if ((e.key === 'b' || e.key === 'B') && !isInputFocused(e.target)) {
            const activeTab = document
                .querySelector('.tab-btn.active')
                .getAttribute('data-tool');

            if (activeTab === 'contrast') {
                e.preventDefault();
                copyToClipboard(lastBgHex, 'Background color copied');
            }
        }

        // L → Lock text
        if ((e.key === 'l' || e.key === 'L') && !isInputFocused(e.target)) {
            const activeTab = document
                .querySelector('.tab-btn.active')
                .getAttribute('data-tool');

            if (activeTab === 'contrast') {
                e.preventDefault();
                lockColor1.checked = !lockColor1.checked;
                lockColor1.dispatchEvent(new Event('change'));
                showShortcutFeedback(
                    lockColor1.checked ? 'Text locked' : 'Text unlocked'
                );
            }
        }

        // K → Lock background
        if ((e.key === 'k' || e.key === 'K') && !isInputFocused(e.target)) {
            const activeTab = document
                .querySelector('.tab-btn.active')
                .getAttribute('data-tool');

            if (activeTab === 'contrast') {
                e.preventDefault();
                lockColor2.checked = !lockColor2.checked;
                lockColor2.dispatchEvent(new Event('change'));
                showShortcutFeedback(
                    lockColor2.checked ? 'Background locked' : 'Background unlocked'
                );
            }
        }
    });

    // -------------------------
    // WCAG BADGES
    // -------------------------
    function updateWCAGBadges() {
        const color1 = color1Input.value;
        const color2 = color2Input.value;

        if (!chroma.valid(color1) || !chroma.valid(color2)) {
            wcagBadges.innerHTML = '';
            return;
        }

        const contrast = chroma.contrast(color1, color2);
        let html = '';

        html += contrast >= 3
            ? '<span class="wcag-badge pass">✓ AA Large</span>'
            : '<span class="wcag-badge fail">✗ AA Large</span>';

        html += contrast >= 4.5
            ? '<span class="wcag-badge pass">✓ AA</span>'
            : '<span class="wcag-badge fail">✗ AA</span>';

        html += contrast >= 7
            ? '<span class="wcag-badge pass">✓ AAA</span>'
            : '<span class="wcag-badge fail">✗ AAA</span>';

        wcagBadges.innerHTML = html;
    }

    // -------------------------
    // EVENT LISTENERS
    // -------------------------
    swapBtn.addEventListener('click', function () {
        const temp1 = color1Input.value;
        const temp2 = color2Input.value;

        const tempLock1 = lockColor1.checked;
        const tempLock2 = lockColor2.checked;

        color1Input.value = temp2;
        color2Input.value = temp1;

        lockColor1.checked = tempLock2;
        lockColor2.checked = tempLock1;

        updatePreviews();
        updateContrastDisplay();
        updateColorValidation(color1Input, color1Error);
        updateColorValidation(color2Input, color2Error);
    });

    color1Preview.addEventListener('click', () => color1Picker.click());
    color2Preview.addEventListener('click', () => color2Picker.click());

    color1Picker.addEventListener('change', function () {
        color1Input.value = this.value;
        updatePreviews();
        updateContrastDisplay();
        updateColorValidation(color1Input, color1Error);
    });

    color2Picker.addEventListener('change', function () {
        color2Input.value = this.value;
        updatePreviews();
        updateContrastDisplay();
        updateColorValidation(color2Input, color2Error);
    });

    lockColor1.addEventListener('change', function () {
        if (this.checked) lockColor2.checked = false;
    });

    lockColor2.addEventListener('change', function () {
        if (this.checked) lockColor1.checked = false;
    });

    color1Input.addEventListener('input', function () {
        updatePreviews();
        updateContrastDisplay();
        updateColorValidation(color1Input, color1Error);
    });

    color2Input.addEventListener('input', function () {
        updatePreviews();
        updateContrastDisplay();
        updateColorValidation(color2Input, color2Error);
    });

    contrastLevelSelect.addEventListener('change', updateContrastDisplay);

    // -------------------------
    // PREVIEW + CONTRAST DISPLAY
    // -------------------------
    function updatePreviews() {
        color1Preview.style.backgroundColor = color1Input.value || '#fff';
        color2Preview.style.backgroundColor = color2Input.value || '#fff';

        if (chroma.valid(color1Input.value)) {
            color1Picker.value = chroma(color1Input.value).hex();
        }
        if (chroma.valid(color2Input.value)) {
            color2Picker.value = chroma(color2Input.value).hex();
        }
    }

    function updateContrastDisplay() {
        const color1 = color1Input.value;
        const color2 = color2Input.value;

        const targetContrast = parseFloat(contrastLevelSelect.value);

        if (!chroma.valid(color1) || !chroma.valid(color2)) {
            contrastRatio.textContent = '0:1';
            contrastStatus.textContent = '-';
            contrastDisplay.classList.remove('pass', 'fail');
            wcagBadges.innerHTML = '';
            return;
        }

        const currentContrast = chroma.contrast(color1, color2);
        const passes = currentContrast >= targetContrast;

        contrastRatio.textContent = currentContrast.toFixed(2) + ':1';
        contrastStatus.textContent = passes ? '✓ Passes' : '✗ Below target';

        contrastDisplay.classList.remove('pass', 'fail');
        contrastDisplay.classList.add(passes ? 'pass' : 'fail');

        updateWCAGBadges();
    }

    // -------------------------
    // COLOR MATH UTILITIES
    // -------------------------
    function getColorLightness(hexColor) {
        const color = chroma(hexColor);
        const [h, s, l] = color.hsl();
        return l;
    }

    function lightenColorWithBoost(hexColor, amount) {
        const color = chroma(hexColor);
        const [h, s, l] = color.hsl();

        const newL = Math.min(l + amount, 1);
        const newS = Math.min(s + 0.08, 1);

        return chroma.hsl(h, newS, newL).hex();
    }

    function darkenColorWithBoost(hexColor, amount) {
        const color = chroma(hexColor);
        const [h, s, l] = color.hsl();

        const newL = Math.max(l - amount, 0);
        const newS = Math.min(s + 0.08, 1);

        return chroma.hsl(h, newS, newL).hex();
    }

    function tryAdjustment(color1, color2, targetContrast, direction, amount) {
        let c1 = color1;
        let c2 = color2;
        let attempts = 0;

        if (direction === 'lighten-text') {
            while (chroma.contrast(c1, c2) < targetContrast && attempts < 50) {
                c1 = lightenColorWithBoost(c1, amount);
                attempts++;
            }
        } else if (direction === 'darken-text') {
            while (chroma.contrast(c1, c2) < targetContrast && attempts < 50) {
                c1 = darkenColorWithBoost(c1, amount);
                attempts++;
            }
        } else if (direction === 'lighten-bg') {
            while (chroma.contrast(c1, c2) < targetContrast && attempts < 50) {
                c2 = lightenColorWithBoost(c2, amount);
                attempts++;
            }
        } else if (direction === 'darken-bg') {
            while (chroma.contrast(c1, c2) < targetContrast && attempts < 50) {
                c2 = darkenColorWithBoost(c2, amount);
                attempts++;
            }
        } else if (direction === 'balance-smart') {
            const textLightness = getColorLightness(color1);
            const bgLightness = getColorLightness(color2);

            while (chroma.contrast(c1, c2) < targetContrast && attempts < 50) {
                if (textLightness < bgLightness) {
                    c1 = lightenColorWithBoost(c1, amount);
                    c2 = darkenColorWithBoost(c2, amount);
                } else {
                    c1 = darkenColorWithBoost(c1, amount);
                    c2 = lightenColorWithBoost(c2, amount);
                }
                attempts++;
            }
        }

        const finalContrast = chroma.contrast(c1, c2);

        return {
            color1: chroma(c1).hex().toUpperCase(),
            color2: chroma(c2).hex().toUpperCase(),
            contrast: finalContrast,
            attempts: attempts
        };
    }

    function tryExtremeAdjustment(color1, color2, direction) {
        let c1 = color1;
        let c2 = color2;

        if (direction === 'lighten-text') c1 = '#FFFFFF';
        if (direction === 'darken-text') c1 = '#000000';
        if (direction === 'lighten-bg') c2 = '#FFFFFF';
        if (direction === 'darken-bg') c2 = '#000000';

        const finalContrast = chroma.contrast(c1, c2);

        return {
            color1: chroma(c1).hex().toUpperCase(),
            color2: chroma(c2).hex().toUpperCase(),
            contrast: finalContrast,
            attempts: 'extreme'
        };
    }

    function rankAndDeduplicate(solutions) {
        if (solutions.length === 0) return [];

        const ranked = solutions.sort((a, b) => {
            const aPass = a.contrast >= 4.5 ? 0 : 1;
            const bPass = b.contrast >= 4.5 ? 0 : 1;

            if (aPass !== bPass) return aPass - bPass;

            const aDiff = Math.abs(a.contrast - 4.5);
            const bDiff = Math.abs(b.contrast - 4.5);

            if (aDiff !== bDiff) return aDiff - bDiff;

            return a.attempts - b.attempts;
        });

        const deduped = [];

        for (const sol of ranked) {
            const duplicate = deduped.some(existing => {
                const textDiff = Math.abs(
                    getColorLightness(sol.color1) -
                    getColorLightness(existing.color1)
                );

                const bgDiff = Math.abs(
                    getColorLightness(sol.color2) -
                    getColorLightness(existing.color2)
                );

                return textDiff < 0.03 && bgDiff < 0.03;
            });

            if (!duplicate) {
                deduped.push(sol);
            }
        }

        return deduped;
    }

    // -------------------------
    // GET RECOMMENDATIONS
    // -------------------------
    getResultsBtn.addEventListener('click', function () {
        const color1 = color1Input.value;
        const color2 = color2Input.value;

        const targetContrast = parseFloat(contrastLevelSelect.value);

        const isColor1Locked = lockColor1.checked;
        const isColor2Locked = lockColor2.checked;

        if (!chroma.valid(color1)) {
            color1Error.textContent = '⚠️ Invalid format. Use #RRGGBB';
            color1Error.classList.add('show');
            color1Input.classList.add('invalid');
            return;
        }

        if (!chroma.valid(color2)) {
            color2Error.textContent = '⚠️ Invalid format. Use #RRGGBB';
            color2Error.classList.add('show');
            color2Input.classList.add('invalid');
            return;
        }

        color1Error.classList.remove('show');
        color2Error.classList.remove('show');

        const currentContrast = chroma.contrast(color1, color2);

        if (currentContrast >= targetContrast) {
            const solutions = [{
                color1,
                color2,
                contrast: currentContrast,
                attempts: 0,
                label: 'Already Passes'
            }];

            lastTextHex = color1;
            lastBgHex = color2;

            showResults(solutions, targetContrast);
            return;
        }

        let solutions = [];
        const intensities = [0.03, 0.05, 0.08];
        const labels = ['Subtle', 'Moderate', 'Bold'];

        let bestAttempt = null;

        // -------------------------
        // 1) Only text unlocked
        // -------------------------
        if (isColor2Locked && !isColor1Locked) {
            const dirs = ['lighten-text', 'darken-text'];

            for (const dir of dirs) {
                for (const intensity of intensities) {
                    const result = tryAdjustment(color1, color2, targetContrast, dir, intensity);
                    solutions.push(result);

                    if (!bestAttempt || result.contrast > bestAttempt.contrast) {
                        bestAttempt = result;
                    }
                }
            }

            for (const dir of dirs) {
                const result = tryExtremeAdjustment(color1, color2, dir);
                solutions.push(result);

                if (!bestAttempt || result.contrast > bestAttempt.contrast) {
                    bestAttempt = result;
                }
            }

        // -------------------------
        // 2) Only background unlocked
        // -------------------------
        } else if (isColor1Locked && !isColor2Locked) {
            const dirs = ['lighten-bg', 'darken-bg'];

            for (const dir of dirs) {
                for (const intensity of intensities) {
                    const result = tryAdjustment(color1, color2, targetContrast, dir, intensity);
                    solutions.push(result);

                    if (!bestAttempt || result.contrast > bestAttempt.contrast) {
                        bestAttempt = result;
                    }
                }
            }

            for (const dir of dirs) {
                const result = tryExtremeAdjustment(color1, color2, dir);
                solutions.push(result);

                if (!bestAttempt || result.contrast > bestAttempt.contrast) {
                    bestAttempt = result;
                }
            }

        // -------------------------
        // 3) Both unlocked
        // -------------------------
        } else {
            const dirs = [
                'lighten-text', 'darken-text',
                'lighten-bg', 'darken-bg',
                'balance-smart'
            ];

            for (const dir of dirs) {
                for (const intensity of intensities) {
                    const result = tryAdjustment(color1, color2, targetContrast, dir, intensity);
                    solutions.push(result);

                    if (!bestAttempt || result.contrast > bestAttempt.contrast) {
                        bestAttempt = result;
                    }
                }
            }

            const extremeDirs = [
                'lighten-text', 'darken-text',
                'lighten-bg', 'darken-bg'
            ];

            for (const dir of extremeDirs) {
                const result = tryExtremeAdjustment(color1, color2, dir);
                solutions.push(result);

                if (!bestAttempt || result.contrast > bestAttempt.contrast) {
                    bestAttempt = result;
                }
            }
        }

        // Deduplicate & rank
        solutions = rankAndDeduplicate(solutions);

        let finalSolutions = [];

        if (solutions.length >= 3) {
            finalSolutions = solutions.slice(0, 3);
            finalSolutions[0].label = 'Subtle';
            finalSolutions[1].label = 'Moderate';
            finalSolutions[2].label = 'Bold';

        } else if (solutions.length > 0) {
            finalSolutions = solutions;
            for (let i = 0; i < finalSolutions.length; i++) {
                finalSolutions[i].label = labels[i];
            }

        } else if (bestAttempt) {
            for (let i = 0; i < 3; i++) {
                finalSolutions.push({
                    color1: bestAttempt.color1,
                    color2: bestAttempt.color2,
                    contrast: bestAttempt.contrast,
                    attempts: bestAttempt.attempts,
                    label: labels[i]
                });
            }
        }

        lastTextHex = finalSolutions[0]?.color1 || color1;
        lastBgHex = finalSolutions[0]?.color2 || color2;

        showResults(finalSolutions, targetContrast);
    });

    // -------------------------
    // GRID RENDERING
    // -------------------------
    function showResults(solutions, targetContrast) {
        let html = '<div class="results-grid">';

        solutions.forEach(solution => {
            const passes = solution.contrast >= targetContrast;
            const statusClass = passes ? 'pass' : 'fail';
            const statusText = passes ? '✓ Passes' : '✗ Fails';

            html += `
                <div class="result-card">
                    <div class="result-preview">
                        <div style="background-color: ${solution.color1};"></div>
                        <div style="background-color: ${solution.color2};"></div>
                    </div>

                    <div class="result-label">${solution.label}</div>

                    <div class="result-hex-buttons">
                        <button class="result-hex-button" data-hex="${solution.color1}" title="Text Color: Press C to copy">
                            ${solution.color1}
                        </button>

                        <button class="result-hex-button" data-hex="${solution.color2}" title="Background Color: Press B to copy">
                            ${solution.color2}
                        </button>
                    </div>

                    <div class="result-meta ${statusClass}">
                        <span>${statusText}</span>
                        <span>${solution.contrast.toFixed(2)}:1</span>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        resultsGridContainer.innerHTML = html;

        resultsSection.classList.add('active');

        const hexButtons = resultsGridContainer.querySelectorAll('.result-hex-button');

        hexButtons.forEach(button => {
            button.addEventListener('click', function () {
                const hex = this.getAttribute('data-hex');
                copyHexToClipboard(this, hex);
            });
        });
    }
}
