document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle the sidebar visibility on button click
    if (navToggle && sidebar) {
        navToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Close the sidebar when a link is clicked (for mobile)
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    // Hide sidebar if the user resizes to desktop view
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
});