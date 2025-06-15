document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navAuth = document.querySelector('.nav-auth');
    
    hamburger?.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        navAuth.classList.toggle('active');
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Testimonials slider
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Hide all testimonials
        testimonialCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current testimonial and activate dot
        if (testimonialCards[index]) {
            testimonialCards[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonialCards.length;
        showSlide(currentSlide);
    }

    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    // Initialize testimonials slider
    if (testimonialCards.length > 0) {
        showSlide(0);
        startSlideshow();

        // Dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentSlide = index;
                showSlide(currentSlide);
                stopSlideshow();
                startSlideshow();
            });
        });

        // Pause slideshow on hover
        const testimonialsSection = document.querySelector('.testimonials-slider');
        testimonialsSection?.addEventListener('mouseenter', stopSlideshow);
        testimonialsSection?.addEventListener('mouseleave', startSlideshow);
    }

    // Dropdown menus
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        let hideTimeout;

        dropdown.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
            dropdownContent.style.opacity = '1';
            dropdownContent.style.visibility = 'visible';
            dropdownContent.style.transform = 'translateY(0)';
        });

        dropdown.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(() => {
                dropdownContent.style.opacity = '0';
                dropdownContent.style.visibility = 'hidden';
                dropdownContent.style.transform = 'translateY(-10px)';
            }, 150);
        });
    });

    // Course card hover effects
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.course-card, .guide-card, .testimonial-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const floatingCards = document.querySelectorAll('.card');
    
    if (hero && floatingCards.length > 0) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            floatingCards.forEach((card, index) => {
                const speed = (index + 1) * 0.3;
                card.style.transform = `translateY(${rate * speed}px)`;
            });
        });
    }

    // CTA button click effects
    const ctaButtons = document.querySelectorAll('.cta-btn');
    
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Form validation (if forms are added later)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Loading animation for course cards
    function animateCounter(element, target, duration = 2000) {
        let current = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Initialize animations when elements come into view
    const statsElements = document.querySelectorAll('[data-count]');
    statsElements.forEach(el => {
        observer.observe(el);
        el.addEventListener('animateIn', function() {
            const target = parseInt(this.dataset.count);
            animateCounter(this, target);
        });
    });

    // Search functionality (placeholder)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            // Implement search logic here
            console.log('Searching for:', query);
        });
    }

    // Filter functionality for courses
    const filterButtons = document.querySelectorAll('.filter-btn');
    const courseItems = document.querySelectorAll('.course-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter courses
            courseItems.forEach(course => {
                if (filter === 'all' || course.dataset.category === filter) {
                    course.style.display = 'block';
                    course.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    course.style.display = 'none';
                }
            });
        });
    });

    // Add loading states for buttons
    function addLoadingState(button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 로딩중...';
        
        setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
        }, 2000);
    }

    // Handle course enrollment clicks
    const enrollButtons = document.querySelectorAll('.enroll-btn');
    enrollButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            addLoadingState(this);
        });
    });

    // Accessibility improvements
    document.addEventListener('keydown', function(e) {
        // Escape key closes dropdowns
        if (e.key === 'Escape') {
            dropdowns.forEach(dropdown => {
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                dropdownContent.style.opacity = '0';
                dropdownContent.style.visibility = 'hidden';
            });
        }
        
        // Arrow keys for testimonials navigation
        if (e.key === 'ArrowLeft' && testimonialCards.length > 0) {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : testimonialCards.length - 1;
            showSlide(currentSlide);
            stopSlideshow();
            startSlideshow();
        }
        
        if (e.key === 'ArrowRight' && testimonialCards.length > 0) {
            nextSlide();
            stopSlideshow();
            startSlideshow();
        }
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

    // Apply debounce to scroll handler
    const debouncedScrollHandler = debounce(function() {
        // Scroll-based animations
        const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
        document.documentElement.style.setProperty('--scroll-percent', scrollPercent);
    }, 16);

    window.addEventListener('scroll', debouncedScrollHandler);

    // Initialize tooltips (if needed)
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top - 40 + 'px';
        });
        
        el.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });

    // 회원가입 모달 기능
    const signupModal = document.getElementById('signupModal');
    const successModal = document.getElementById('successModal');
    const signupBtns = document.querySelectorAll('#signupBtn, #heroSignupBtn');
    const closeBtn = document.querySelector('.close');
    const signupForm = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    const successOkBtn = document.getElementById('successOkBtn');

    // 모달 열기
    signupBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            signupModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    // 모달 닫기
    closeBtn.addEventListener('click', closeModal);
    successOkBtn.addEventListener('click', closeSuccessModal);

    // 모달 외부 클릭 시 닫기
    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            closeModal();
        }
    });

    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (signupModal.classList.contains('show')) {
                closeModal();
            }
            if (successModal.classList.contains('show')) {
                closeSuccessModal();
            }
        }
    });

    function closeModal() {
        signupModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        resetForm();
    }

    function closeSuccessModal() {
        successModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    function resetForm() {
        signupForm.reset();
        clearAllErrors();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-check"></i> 회원가입 완료';
        submitBtn.classList.remove('loading');
    }

    // 폼 유효성 검증
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const phoneInput = document.getElementById('phone');
    const agreeTermsInput = document.getElementById('agreeTerms');

    // 실시간 유효성 검증
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    phoneInput.addEventListener('blur', validatePhone);

    function validateName() {
        const name = nameInput.value.trim();
        const nameRegex = /^[가-힣a-zA-Z\s]{2,20}$/;
        
        if (!name) {
            showError('nameError', '이름을 입력해주세요.');
            setFieldState(nameInput, 'error');
            return false;
        } else if (!nameRegex.test(name)) {
            showError('nameError', '올바른 이름을 입력해주세요. (2-20자, 한글/영문만 가능)');
            setFieldState(nameInput, 'error');
            return false;
        } else {
            hideError('nameError');
            setFieldState(nameInput, 'success');
            return true;
        }
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showError('emailError', '이메일을 입력해주세요.');
            setFieldState(emailInput, 'error');
            return false;
        } else if (!emailRegex.test(email)) {
            showError('emailError', '올바른 이메일 형식을 입력해주세요.');
            setFieldState(emailInput, 'error');
            return false;
        } else {
            hideError('emailError');
            setFieldState(emailInput, 'success');
            return true;
        }
    }

    function validatePassword() {
        const password = passwordInput.value;
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!password) {
            showError('passwordError', '비밀번호를 입력해주세요.');
            setFieldState(passwordInput, 'error');
            return false;
        } else if (!passwordRegex.test(password)) {
            showError('passwordError', '8자 이상, 영문+숫자+특수문자를 포함해주세요.');
            setFieldState(passwordInput, 'error');
            return false;
        } else {
            hideError('passwordError');
            setFieldState(passwordInput, 'success');
            
            // 비밀번호 확인도 다시 검증
            if (confirmPasswordInput.value) {
                validateConfirmPassword();
            }
            return true;
        }
    }

    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            showError('confirmPasswordError', '비밀번호 확인을 입력해주세요.');
            setFieldState(confirmPasswordInput, 'error');
            return false;
        } else if (password !== confirmPassword) {
            showError('confirmPasswordError', '비밀번호가 일치하지 않습니다.');
            setFieldState(confirmPasswordInput, 'error');
            return false;
        } else {
            hideError('confirmPasswordError');
            setFieldState(confirmPasswordInput, 'success');
            return true;
        }
    }

    function validatePhone() {
        const phone = phoneInput.value.trim();
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        
        if (phone && !phoneRegex.test(phone)) {
            showError('phoneError', '올바른 연락처 형식을 입력해주세요. (010-1234-5678)');
            setFieldState(phoneInput, 'error');
            return false;
        } else {
            hideError('phoneError');
            if (phone) {
                setFieldState(phoneInput, 'success');
            } else {
                setFieldState(phoneInput, 'normal');
            }
            return true;
        }
    }

    function validateAgreement() {
        if (!agreeTermsInput.checked) {
            showError('agreeError', '이용약관에 동의해주세요.');
            return false;
        } else {
            hideError('agreeError');
            return true;
        }
    }

    function showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function hideError(errorId) {
        const errorElement = document.getElementById(errorId);
        errorElement.classList.remove('show');
    }

    function setFieldState(field, state) {
        field.classList.remove('error', 'success');
        if (state === 'error') {
            field.classList.add('error');
        } else if (state === 'success') {
            field.classList.add('success');
        }
    }

    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('.form-group input, .form-group select');
        
        errorElements.forEach(error => error.classList.remove('show'));
        inputElements.forEach(input => input.classList.remove('error', 'success'));
    }

    // 연락처 자동 포맷팅
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d]/g, '');
        
        if (value.length >= 3 && value.length <= 7) {
            value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
        } else if (value.length >= 8) {
            value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
        }
        
        e.target.value = value;
    });

    // 폼 제출 처리
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 모든 필드 유효성 검증
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isPhoneValid = validatePhone();
        const isAgreementValid = validateAgreement();
        
        if (!isNameValid || !isEmailValid || !isPasswordValid || 
            !isConfirmPasswordValid || !isPhoneValid || !isAgreementValid) {
            return;
        }
        
        // 로딩 상태
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 가입 중...';
        submitBtn.classList.add('loading');
        
        // 폼 데이터 수집
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            phone: phoneInput.value.trim(),
            childGrade: document.getElementById('childGrade').value,
            agreeMarketing: document.getElementById('agreeMarketing').checked
        };
        
        try {
            // API 호출
            const response = await fetch('http://localhost:5500/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // 성공
                closeModal();
                setTimeout(() => {
                    successModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }, 300);
            } else {
                // 에러 처리
                if (result.field) {
                    showError(result.field + 'Error', result.message);
                    setFieldState(document.getElementById(result.field), 'error');
                } else {
                    alert('회원가입 중 오류가 발생했습니다: ' + result.message);
                }
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            // 로딩 상태 해제
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-check"></i> 회원가입 완료';
            submitBtn.classList.remove('loading');
        }
    });

    console.log('AI 부모 교육 사이트가 성공적으로 로드되었습니다!');
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .cta-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.6s ease-out;
    }
    
    .course-card:not(.animate-in) {
        opacity: 0;
        transform: translateY(30px);
    }
    
    .guide-card:not(.animate-in) {
        opacity: 0;
        transform: translateX(-30px);
    }
    
    .tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 1000;
        transform: translateX(-50%);
        white-space: nowrap;
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.8);
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1rem;
        }
        
        .nav-auth.active {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(style);