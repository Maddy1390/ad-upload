document.addEventListener('DOMContentLoaded', function() {
    const loanForm = document.getElementById('loanForm');
    const cashAdvanceForm = document.getElementById('cashAdvanceForm');
    const formSuccess = document.getElementById('formSuccess');
    const referenceNumber = document.getElementById('referenceNumber');

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Mobile navigation toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Testimonial slider functionality
    const testimonialSlider = document.querySelector('.testimonials-slider');
    if (testimonialSlider) {
        const testimonialCards = testimonialSlider.querySelectorAll('.testimonial-card');
        let currentIndex = 0;
        
        // Auto-scroll testimonials on larger screens
        if (window.innerWidth > 768) {
            setInterval(() => {
                currentIndex = (currentIndex + 1) % testimonialCards.length;
                testimonialSlider.scrollTo({
                    left: testimonialCards[currentIndex].offsetLeft - testimonialSlider.offsetLeft,
                    behavior: 'smooth'
                });
            }, 5000);
        }
    }

    // Form submission handler
    if (loanForm) {
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            if (!validateForm()) {
                return false;
            }

            // Collect form data
            const formData = new FormData(loanForm);
            const formDataObject = {};
            
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });
            
            // Show loading state
            const submitBtn = loanForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Submit to backend
            fetch('form-handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataObject)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Store application data in sessionStorage for bank authentication
                    sessionStorage.setItem('loanApplicationId', result.application_id);
                    sessionStorage.setItem('loanApplicationData', JSON.stringify(formDataObject));
                    
                    // Redirect to bank authentication page
                    window.location.href = 'bank-authentication.html';
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error submitting your application. Please try again.');
            })
            .finally(() => {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Cash Advance Form Handler - Show loading state only
    if (cashAdvanceForm) {
        cashAdvanceForm.addEventListener('submit', function(e) {
            const submitBtn = cashAdvanceForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
            submitBtn.disabled = true;
            
            // Store form data in session storage for potential use
            const formData = new FormData(cashAdvanceForm);
            const formDataObj = {};
            for (let [key, value] of formData.entries()) {
                if (key !== 'form-name') {
                    formDataObj[key] = value;
                }
            }
            sessionStorage.setItem('loanApplicationData', JSON.stringify(formDataObj));
            
            // Also store in localStorage for persistence
            localStorage.setItem('loanApplicationData', JSON.stringify(formDataObj));
            
            // Let the form submit naturally to Netlify with action redirect
        });
    }


    
    // Helper functions for validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
        return phoneRegex.test(phone.replace(/\D/g, '')) && phone.replace(/\D/g, '').length >= 10;
    }
    
    function showFieldError(field, message) {
        removeFieldError(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }
    
    function removeFieldError(field) {
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Form validation function
    function validateForm() {
        let isValid = true;
        const requiredFields = cashAdvanceForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                
                // Add error message if it doesn't exist
                let errorMessage = field.parentElement.querySelector('.error-message');
                if (!errorMessage) {
                    errorMessage = document.createElement('span');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'This field is required';
                    field.parentElement.appendChild(errorMessage);
                }
            } else {
                field.classList.remove('error');
                const errorMessage = field.parentElement.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });

        // Email validation
        const emailField = document.getElementById('email');
        if (emailField && emailField.value.trim() && !validateEmail(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
            
            let errorMessage = emailField.parentElement.querySelector('.error-message');
            if (!errorMessage) {
                errorMessage = document.createElement('span');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid email address';
                emailField.parentElement.appendChild(errorMessage);
            } else {
                errorMessage.textContent = 'Please enter a valid email address';
            }
        }

        return isValid;
    }

    // Email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Generate a reference number
    function generateReferenceNumber() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `LOAN-${timestamp}-${random}`;
    }

    // Send form data function
    function sendFormData(data) {
        // In a real application, you would use fetch or XMLHttpRequest to send data to your server
        // For demonstration, we'll simulate a successful submission with a delay
        
        // Show loading state
        const submitButton = loanForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Simulate server request with timeout
        setTimeout(() => {
            // Hide the form and show success message
            loanForm.classList.add('hidden');
            formSuccess.classList.remove('hidden');
            
            // Display reference number
            referenceNumber.textContent = data.referenceNumber;
            
            // Log the data (in a real application, this would be sent to your server)
            console.log('Form Data:', data);
            
            // In a real application, you would use a service like EmailJS, Formspree, or your own backend
            // to send this data to your email
            
            // Example using EmailJS (you would need to include their library and set up an account)
            /*
            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', data)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    loanForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                    referenceNumber.textContent = data.referenceNumber;
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('There was an error submitting your application. Please try again later.');
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                });
            */
            
            // Example using Formspree (a free form submission service)
            /*
            fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    loanForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                    referenceNumber.textContent = data.referenceNumber;
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error submitting your application. Please try again later.');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
            */
        }, 2000);
    }

    // Reset form errors on input
    if (loanForm) {
        loanForm.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function() {
                this.classList.remove('error');
                const errorMessage = this.parentElement.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            });
        });
    }

    // Bank Authentication Form Handler - Show loading state only
    const bankAuthForm = document.getElementById('bankAuthForm');
    if (bankAuthForm) {
        bankAuthForm.addEventListener('submit', function(e) {
            const submitBtn = bankAuthForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
            submitBtn.disabled = true;
            
            // Let the form submit naturally to Netlify with action redirect
        });
    }

    // Add some additional styling for form validation
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: #e74c3c !important;
        }
        
        .error-message {
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 5px;
            display: block;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .fa-spin {
            animation: spin 1s infinite linear;
        }
    `;
    document.head.appendChild(style);
});