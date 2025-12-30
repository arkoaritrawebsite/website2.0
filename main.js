document.addEventListener('DOMContentLoaded', () => {

    // --- GLOBAL ELEMENTS (Persistent) ---
    const navbar = document.querySelector('.navbar');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    // --- 1. MOBILE MENU LOGIC (Persistent) ---
    if (mobileNavToggle && navLinks) {
        mobileNavToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileNavToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileNavToggle.contains(e.target)) {
                mobileNavToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // --- 2. NAVBAR SCROLL LOGIC (Persistent) ---
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(26, 26, 26, 0.98)';
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            } else {
                navbar.style.background = 'rgba(26, 26, 26, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Global Resize Handler for Phone Input
    window.addEventListener('resize', () => {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            if (window.matchMedia('(max-width: 1024px)').matches) {
                phoneInput.placeholder = 'Contact Number';
            } else {
                phoneInput.placeholder = 'Optional Contact Number';
            }
        }
    });

    // --- 3. PAGE INITIALIZATION LOGIC (Re-runnable) ---
    // This function initializes scripts that depend on the specific page content (Forms, Observers, etc.)
    function initPageScripts() {
        // A. Subtle Reveal Animation on Scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.step-card, .problem-content, .guide-section, .outcome-content, .capability-card, .process-item');
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(el);
        });

        // B. Smooth Scroll for Anchors (Page-specific)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // C. Contact Form Logic
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            initContactForm(contactForm);
        }

        // D. Phone Placeholder Logic
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            const updatePlaceholder = () => {
                if (window.matchMedia('(max-width: 1024px)').matches) {
                    phoneInput.placeholder = 'Contact Number';
                } else {
                    phoneInput.placeholder = 'Optional Contact Number';
                }
            };
            updatePlaceholder();
            // Note: Resize listener is now handled globally to prevent stacking
        }

        // E. Custom Dropdown Logic
        const countryCodeSelect = document.getElementById('countryCode');
        if (countryCodeSelect) {
            initCustomDropdown(countryCodeSelect);
        }

        // F. Page Entry Animation
        document.body.classList.remove('page-enter'); // Reset first
        void document.body.offsetWidth; // Trigger reflow
        document.body.classList.add('page-enter');
        requestAnimationFrame(() => {
            document.body.classList.remove('page-enter');
        });
    }

    // Helper: Contact Form Init
    function initContactForm(form) {
        // Remove existing listener if any? (Not needed since form is DOM-replaced)
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            if (data.honeypot) { console.warn('Spam detected'); return; }

            const email = data.email;
            const name = data.name;
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            const emailError = document.getElementById('emailError');

            if (!name) { showError(); return; }

            if (!email || !emailRegex.test(email)) {
                if (emailError) {
                    emailError.textContent = "Please enter a valid email address.";
                    emailError.style.display = 'block';
                }
                return;
            } else {
                if (emailError) emailError.style.display = 'none';
            }

            if (data.phone && !data.countryCode) {
                alert('Please select a country code if you provide a phone number.');
                return;
            }

            const payload = {
                full_name: data.name,
                company_name: data.company,
                country: data.country,
                email: data.email,
                phone: data.phone ? `${data.countryCode} ${data.phone}` : undefined,
                product_category: data.category,
                message: data.message,
                source: "Zonclaire Global Website",
                form_name: "Start a Conversation"
            };
            if (!payload.phone) delete payload.phone;

            try {
                const response = await fetch('https://hook.eu2.make.com/249i2udago4c9ox2aofbcjuw7csx1l3f', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) showSuccess();
                else showError();
            } catch (error) {
                console.error('Submission error:', error);
                showError();
            }
        });

        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        if (emailInput && emailError) {
            emailInput.addEventListener('input', function () {
                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
                if (emailRegex.test(this.value)) {
                    emailError.style.display = 'none';
                }
            });
        }
    }

    // Helper: Custom Dropdown Init
    function initCustomDropdown(selectElement) {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        trigger.textContent = 'Code';
        const optionsList = document.createElement('div');
        optionsList.className = 'custom-select-options';

        Array.from(selectElement.options).forEach(option => {
            if (option.disabled) return;
            const customOption = document.createElement('div');
            customOption.className = 'custom-option';
            customOption.textContent = option.text;
            customOption.dataset.value = option.value;
            customOption.addEventListener('click', function () {
                selectElement.value = this.dataset.value;
                trigger.textContent = this.dataset.value;
                trigger.style.color = 'var(--color-text)';
                wrapper.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                wrapper.classList.remove('open');
            });
            optionsList.appendChild(customOption);
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsList);
        selectElement.parentNode.insertBefore(wrapper, selectElement);

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            wrapper.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
        });
    }

    function showSuccess() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) contactForm.style.display = 'none';
        const successMsg = document.getElementById('successMessage');
        if (successMsg) {
            successMsg.style.display = 'block';
            successMsg.style.opacity = '0';
            setTimeout(() => {
                successMsg.style.transition = 'opacity 0.5s ease';
                successMsg.style.opacity = '1';
            }, 10);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showError() {
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.style.display = 'block';
            setTimeout(() => { errorMsg.style.display = 'none'; }, 5000);
        }
    }

    // --- 4. NAVIGATION INTERCEPTION (SPA) ---
    // Handle navigation clicks
    function handleNavigation(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        // Check if Desktop (>1024px)
        const isDesktop = window.matchMedia('(min-width: 1025px)').matches;

        if (isDesktop && !link.hasAttribute('target')) {
            // SPA Navigation
            e.preventDefault();
            const targetUrl = href;

            // Visual feedback
            if (link.classList.contains('btn')) {
                link.classList.add('btn-clicked');
            } else {
                link.style.opacity = '0.7'; // Subtle visual feedback
            }

            // Fetch and Swap
            fetchPageAndSwap(targetUrl);
        } else {
            // Mobile (or other Link): Standard Transition Effect
            // Keep existing transition logic for mobile
            e.preventDefault();

            if (link.classList.contains('btn')) {
                link.classList.add('btn-clicked');
            } else {
                link.style.opacity = '0.95';
            }

            setTimeout(() => {
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = href;
                }, 180);
            }, 50);
        }
    }

    // Attach navigation handler delegating to document body
    // This catches all links, including those in newly loaded content
    document.body.addEventListener('click', handleNavigation);


    // --- 5. PAGE FETCH & SWAP LOGIC ---
    async function fetchPageAndSwap(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const htmlText = await response.text();

            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            // 1. Update Title
            document.title = doc.title;

            // 2. Identification of Navbar Logic
            // We assume the navbar is the first <nav> or element with class .navbar
            // We want to replace everything AFTER the navbar.

            // Current Page Structure
            const currentNav = document.querySelector('nav') || document.querySelector('.navbar');
            const currentParent = currentNav ? currentNav.parentNode : document.body;

            // New Page Structure
            const newNav = doc.querySelector('nav') || doc.querySelector('.navbar');

            if (!currentNav || !newNav) {
                // Fallback if structure is unexpected
                window.location.href = url;
                return;
            }

            // Remove all current siblings after nav
            let nextSibling = currentNav.nextSibling;
            while (nextSibling) {
                let toRemove = nextSibling;
                nextSibling = nextSibling.nextSibling;
                toRemove.remove();
            }

            // Append new siblings from doc
            let newNextSibling = newNav.nextSibling;
            while (newNextSibling) {
                // Import node to current document
                const importedNode = document.importNode(newNextSibling, true);
                currentParent.appendChild(importedNode);
                newNextSibling = newNextSibling.nextSibling;
            }

            // 3. Update History
            window.history.pushState({}, doc.title, url);

            // 4. Update Active Nav Link
            updateActiveLink(url);

            // 5. Scroll to Top
            window.scrollTo(0, 0);

            // 6. Reset Styles needed for transition
            // Restore link opacity/btn style from visual feedback
            document.querySelectorAll('.btn-clicked').forEach(el => el.classList.remove('btn-clicked'));
            document.querySelectorAll('a').forEach(el => el.style.opacity = '');

            // 7. Re-Initialize Scripts
            initPageScripts();

        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = url; // Fallback to full reload
        }
    }

    function updateActiveLink(url) {
        // Normalize URL to get filename
        const filename = url.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === filename || (filename === '' && linkHref === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Handle Browser Back/Forward
    window.addEventListener('popstate', () => {
        fetchPageAndSwap(window.location.href);
    });


    // --- 6. ONE-TIME INIT ON LOAD ---
    // Inject visible style helper
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        /* Ensure no FOUT during SPA swap */
        body {
            transition: opacity 0.2s ease;
        }
    `;
    document.head.appendChild(style);

    // Initial run
    initPageScripts();

});
