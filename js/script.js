// Wait for the entire page (DOM) to load before running any scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Header Stickiness and Styling ---
    const header = document.querySelector('header');
    
    // Function to check scroll position and apply 'sticky' class
    function handleHeaderStickiness() {
        // If the user scrolls down more than 50 pixels, make the header sticky
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleHeaderStickiness);

    // Run once on load in case the user reloads the page while scrolled down
    handleHeaderStickiness();


    // --- 2. Mobile Navigation Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        // Toggle the 'is-active' class on the hamburger icon
        menuToggle.classList.toggle('is-active');
        // Toggle the 'open' class on the nav container to show/hide it
        navLinks.classList.toggle('open');
    });


    // --- 3. Smooth Scrolling and Mobile Menu Closing on Link Click ---
    const navLinksList = navLinks.querySelectorAll('a');

    navLinksList.forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');

            // Check if it's an internal anchor link (starts with # but is not just #)
            if (targetId.startsWith('#') && targetId.length > 1) {
                // Prevent default jump behavior
                event.preventDefault(); 
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Get the fixed header height for calculation
                    const headerHeight = header.offsetHeight;
                    
                    // Calculate the position to scroll to (element top minus header height)
                    const offsetTop = targetElement.offsetTop - headerHeight;

                    // Scroll smoothly to the calculated position
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // IMPORTANT: Close the mobile menu after clicking a link (Good UX)
                    if (navLinks.classList.contains('open')) {
                        menuToggle.classList.remove('is-active');
                        navLinks.classList.remove('open');
                    }
                }
            }
        });
    });

    // --- 4. Simple Contact Form Submission Feedback (No Server Integration) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Stop the form from actually submitting (for demo purposes)
            
            // Display success message
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Message Sent! Thank you.';
            submitButton.style.backgroundColor = 'var(--primary-glow)'; // Change button style
            submitButton.disabled = true;

            // Optional: Reset form fields after a delay
            setTimeout(() => {
                contactForm.reset();
                submitButton.textContent = 'Send Message';
                submitButton.style.backgroundColor = 'var(--accent-blue)';
                submitButton.disabled = false;
            }, 3000);
        });
    }
});
