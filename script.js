document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    
    // Get DOM elements
    const check = document.getElementById('darkmode-toggle');
    const btn = document.getElementById('darkmode-label');
    const body = document.body;

    // Debug check if elements are found
    if (!check) console.error('Dark mode toggle checkbox not found');
    if (!btn) console.error('Dark mode label not found');

    function darkmode() {
        console.log("Dark mode function called, checkbox state:", check?.checked);
        
        if (check && btn) {
            if (check.checked) {
                body.classList.add('dark-mode');
                localStorage.setItem('dark-mode', 'true');
                console.log("Dark mode enabled");
            } else {
                body.classList.remove('dark-mode');              
                localStorage.setItem('dark-mode', 'false');
                console.log("Dark mode disabled");
            }
        }
    }

    // Initialize dark mode based on localStorage
    const darkModeStatus = localStorage.getItem("dark-mode");
    console.log("Stored dark mode status:", darkModeStatus);
    
    if (check) {
        check.checked = darkModeStatus === "true";
        darkmode(); // Apply initial state
        
        // Add change listener
        check.addEventListener("change", darkmode);
        console.log("Dark mode listener attached");
    }
    
    // Modal functionality: wire the Contact form modal open/close
    const modal = document.getElementById("ContactModal");
    const openButtons = document.querySelectorAll(".Link-Form-Open");
    const closeBtn = document.getElementById("ContactModalClose");

    let previousActiveElement = null;
    const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';
    let trappedKeydownHandler = null;

    function openModal() {
        if (!modal) return;
        // store the element that had focus to restore it after close
        previousActiveElement = document.activeElement;

        modal.style.display = "flex";
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent background scroll

        // find focusable elements inside modal and focus the first one
        const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter(el => el.offsetParent !== null);
        const firstFocusable = focusable[0] || modal;
        const lastFocusable = focusable[focusable.length - 1] || modal;
        firstFocusable.focus();

        // trap Tab navigation inside the modal
        trappedKeydownHandler = function(e) {
            if (e.key !== 'Tab') return;
            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable || document.activeElement === modal) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        document.addEventListener('keydown', trappedKeydownHandler);
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = "none";
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // remove focus trap listener
        if (trappedKeydownHandler) {
            document.removeEventListener('keydown', trappedKeydownHandler);
            trappedKeydownHandler = null;
        }

        // restore previous focus
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
            previousActiveElement.focus();
            previousActiveElement = null;
        }
    }

    // expose functions for debugging or inline handlers if needed
    window.abrir = openModal;
    window.fechar = closeModal;

    // attach open listeners (there may be more than one Link-Form-Open)
    if (openButtons && openButtons.length) {
        openButtons.forEach(btn => btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        }));
    }

    // attach close button
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    // clicking outside modal content closes it
    window.addEventListener('click', function(event) {
        if (!modal) return;
        if (event.target === modal) closeModal();
    });

    // close on Escape key for accessibility
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Input mask for phone field (Brazilian style: (99) 99999-9999)
    const phoneInput = document.getElementById('contact-phone');
    if (phoneInput) {
        // ensure maxlength suitable for formatting
        phoneInput.setAttribute('maxlength', '15');

        function formatPhoneValue(value) {
            const digits = value.replace(/\D/g, '').slice(0, 11); // keep up to 11 digits
            if (digits.length <= 2) return digits ? `(${digits}` : '';
            if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
            return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
        }

        phoneInput.addEventListener('input', function(e) {
            const cursorPos = phoneInput.selectionStart;
            const raw = phoneInput.value;
            const formatted = formatPhoneValue(raw);
            phoneInput.value = formatted;

            // try to restore a sensible cursor position
            try {
                phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
            } catch (err) { /* ignore */ }
        });

        // handle paste: strip non-digits then format
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
            const formatted = formatPhoneValue(pasted);
            phoneInput.value = formatted;
        });
    }
}); 

