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

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

// Email API endpoint - will be set based on environment
const getEmailApiUrl = () => {
    // Check if we're on Vercel (production)
    if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('blastenergy.com.au')) {
        return '/api/send-email';
    }
    // For local development, use the full URL
    return 'http://localhost:3000/api/send-email';
};

contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Honeypot check (bots often fill hidden fields)
    if (data.company) {
        console.warn('Honeypot triggered, dropping submission');
        return;
    }
    
    // Validate required fields
    if (!data.name || !data.email || !data.propertyType || !data.serviceType) {
        showFormStatus('Please fill in all required fields.', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFormStatus('Please enter a valid email address.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        // Send form data to our email API
        const response = await fetch(getEmailApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showFormStatus('Thank you! Your enquiry has been sent successfully. We\'ll get back to you within 24 hours.', 'success');
            contactForm.reset();
        } else {
            throw new Error(result.error || 'Failed to send enquiry');
        }
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Form submission error:', error);
        showFormStatus('Sorry, there was an error sending your enquiry. Please try again or contact us directly.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate 95% success rate
            if (Math.random() > 0.05) {
                console.log('Form data submitted:', data);
                resolve(data);
            } else {
                reject(new Error('Network error'));
            }
        }, 1500);
    });
}

// Show form status message
function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
}

// Form validation on input
const formInputs = contactForm.querySelectorAll('input, select, textarea');
formInputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
});

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    field.style.borderColor = '#e0e0e0';
    
    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        field.style.borderColor = '#dc3545';
        return false;
    }
    
    // Validate email format
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.style.borderColor = '#dc3545';
            return false;
        }
    }
    
    return true;
}

function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '#e0e0e0';
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
    console.log('Blast Energy website loaded successfully');
    
    // Check if all critical elements exist
    const criticalElements = ['navbar', 'nav-menu', 'hamburger', 'contactForm'];
    const missingElements = criticalElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.warn('Missing critical elements:', missingElements);
    }
});
