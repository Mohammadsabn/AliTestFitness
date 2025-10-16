// // Mobile navbar toggle
// document.querySelector('.menu-toggle').addEventListener('click', () => {
//   document.querySelector('.nav-links').classList.toggle('active');
// });

// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Select the two key elements from the HTML
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // 2. Add an event listener for the 'click' on the button
    menuToggle.addEventListener('click', () => {
        
        // 3. Toggle the 'aria-expanded' attribute for accessibility
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        
        // 4. THE KEY STEP: Toggle the 'open' class on the navigation
        // This is the class that changes the CSS property (max-height: 0 to max-height: 300px)
        navLinks.classList.toggle('open');
    });
});