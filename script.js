// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTop');

// Show/hide scroll to top button based on scroll position
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Scroll to top when button is clicked
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Navbar shrink effect on scroll
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('shrunk');
    } else {
        navbar.classList.remove('shrunk');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ── Contact info obfuscation ──
// Runs immediately — script is loaded at the bottom of body so DOM elements exist.
(function () {
    var mailSubject = encodeURIComponent('Enquiry \u2013 EER / BASIX Report');
    var mailBody = encodeURIComponent(
        'Hi Blast Energy,\n\nI am interested in your energy assessment services. ' +
        'Could you please provide a quote?\n\nProperty type: \nProperty address: \n' +
        'Service required (EER / BASIX / Both): \n\nThank you.'
    );

    function revealEmail(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var u = el.getAttribute('data-a');
        var d = el.getAttribute('data-b');
        if (!u || !d) return;
        var addr = u + '@' + d;
        var href = 'mailto:' + addr + '?subject=' + mailSubject + '&body=' + mailBody;
        var link = document.createElement('a');
        link.href = href;
        link.className = 'contact-email';
        link.textContent = addr;
        el.parentNode.replaceChild(link, el);
    }

    function revealPhone(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var encoded = el.getAttribute('data-p');
        if (!encoded) return;
        var raw = atob(encoded);
        var formatted = raw.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        var link = document.createElement('a');
        link.href = 'tel:+61' + raw.substring(1);
        link.className = 'contact-email';
        link.textContent = formatted;
        el.parentNode.replaceChild(link, el);
    }

    function patchStructuredData() {
        var scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (var i = 0; i < scripts.length; i++) {
            try {
                var obj = JSON.parse(scripts[i].textContent);
                if (obj['@type'] === 'ProfessionalService') {
                    obj.email = 'info' + '@' + 'blastenergy.com.au';
                    obj.telephone = '+61' + atob('MDQwNjA1Nzc5OQ==').substring(1);
                    scripts[i].textContent = JSON.stringify(obj);
                }
            } catch (e) { /* skip non-matching blocks */ }
        }
    }

    revealEmail('obf-email-1');
    revealPhone('obf-phone');
    patchStructuredData();
})();

// ── Contact Form Handling ──
var contactForm = document.getElementById('contactForm');
var formStatus = document.getElementById('formStatus');
var _lastSubmitTime = 0;
var _submitCount = 0;
var RATE_LIMIT_WINDOW = 60000;
var MAX_SUBMITS_PER_WINDOW = 3;
var MIN_FILL_TIME_MS = 3000;

// Record the time the form was loaded (bots submit instantly)
(function () {
    var ts = document.getElementById('formLoadedAt');
    if (ts) ts.value = Date.now().toString();
})();

var getEmailApiUrl = function () {
    if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('blastenergy.com.au')) {
        return '/api/send-email';
    }
    return 'http://localhost:3000/api/send-email';
};

function sanitise(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, '').trim();
}

function containsSuspiciousContent(text) {
    var patterns = [
        /<script/i, /<iframe/i, /javascript:/i,
        /on\w+\s*=/i, /data:text\/html/i,
        /\[url/i, /\[link/i, /\bhttp\S+\bhttp/i
    ];
    return patterns.some(function (p) { return p.test(text); });
}

contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    var formData = new FormData(contactForm);
    var data = Object.fromEntries(formData);

    // Honeypot checks
    if (data.company || data.website) {
        showFormStatus('Thank you for reaching out! We\'ve received your enquiry and will get back to you very soon.', 'success');
        return;
    }

    // Time-trap: reject if filled in less than 3 seconds
    var loadedAt = parseInt(data.formLoadedAt, 10) || 0;
    if (Date.now() - loadedAt < MIN_FILL_TIME_MS) {
        showFormStatus('Thank you for reaching out! We\'ve received your enquiry and will get back to you very soon.', 'success');
        return;
    }

    // Rate limiting
    var now = Date.now();
    if (now - _lastSubmitTime < RATE_LIMIT_WINDOW) {
        _submitCount++;
    } else {
        _submitCount = 1;
        _lastSubmitTime = now;
    }
    if (_submitCount > MAX_SUBMITS_PER_WINDOW) {
        showFormStatus('Too many submissions. Please wait a moment before trying again.', 'error');
        return;
    }

    // Sanitise all text fields
    data.name = sanitise(data.name);
    data.email = sanitise(data.email);
    data.phone = sanitise(data.phone);
    data.propertyAddress = sanitise(data.propertyAddress);
    data.message = sanitise(data.message);
    delete data.company;
    delete data.website;
    delete data.formLoadedAt;

    if (!data.name || !data.email || !data.propertyType || !data.serviceType) {
        showFormStatus('Please fill in all required fields.', 'error');
        return;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFormStatus('Please enter a valid email address.', 'error');
        return;
    }

    if (data.name.length > 100 || data.email.length > 254 || (data.message && data.message.length > 2000)) {
        showFormStatus('One or more fields exceed the maximum length.', 'error');
        return;
    }

    // Check for suspicious / injected content
    var allText = [data.name, data.email, data.phone, data.propertyAddress, data.message].join(' ');
    if (containsSuspiciousContent(allText)) {
        showFormStatus('Your submission contains invalid content. Please remove any links or special characters and try again.', 'error');
        return;
    }

    var submitBtn = contactForm.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        var response = await fetch(getEmailApiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        var result = await response.json();

        if (response.ok && result.success) {
            showFormStatus('Thank you for reaching out! We\'ve received your enquiry and will get back to you very soon.', 'success');
            contactForm.reset();
            var ts = document.getElementById('formLoadedAt');
            if (ts) ts.value = Date.now().toString();
        } else {
            throw new Error(result.error || 'Failed to send enquiry');
        }
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
        console.error('Form submission error:', error);
        showFormStatus('Sorry, there was an error sending your enquiry. Please try again or contact us directly.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;
    formStatus.style.display = 'block';

    if (type === 'success') {
        setTimeout(function () {
            formStatus.style.display = 'none';
        }, 5000);
    }
}

var formInputs = contactForm.querySelectorAll('input, select, textarea');
formInputs.forEach(function (input) {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
});

function validateField(e) {
    var field = e.target;
    var value = field.value.trim();

    field.style.borderColor = '#e0e0e0';

    if (field.hasAttribute('required') && !value) {
        field.style.borderColor = '#dc3545';
        return false;
    }

    if (field.type === 'email' && value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.style.borderColor = '#dc3545';
            return false;
        }
    }

    return true;
}

function clearFieldError(e) {
    e.target.style.borderColor = '#e0e0e0';
}

// Intersection Observer for animations
const observerOptions = {
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .step, .compliance-info, .standard-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Only add loading animation for form submission
        if (this.type === 'submit') return;
        
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Close scroll to top with Escape key for accessibility
    if (e.key === 'Escape' && scrollToTopBtn.matches(':focus')) {
        scrollToTopBtn.blur();
    }
});

// Form accessibility improvements
contactForm.addEventListener('keydown', (e) => {
    // Allow Enter key to submit form
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        contactForm.dispatchEvent(new Event('submit'));
    }
});

// Add ARIA labels for better accessibility
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels to form
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    if (nameInput) nameInput.setAttribute('aria-label', 'Full name');
    if (emailInput) emailInput.setAttribute('aria-label', 'Email address');
    if (phoneInput) phoneInput.setAttribute('aria-label', 'Phone number');
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add error handling for missing elements
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`Element not found: ${selector}`, error);
        return null;
    }
}

// Initialize all functionality safely
document.addEventListener('DOMContentLoaded', () => {
    const criticalElements = ['navbar', 'nav-menu', 'contactForm'];
    const missingElements = criticalElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.warn('Missing critical elements:', missingElements);
    }
});
