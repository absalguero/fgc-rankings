document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    if (navToggle && sidebar) {
        navToggle.addEventListener('click', () => {
            const isActive = sidebar.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
            body.classList.toggle('no-scroll', isActive);
        });

        // Close sidebar when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !navToggle.contains(e.target)) {
                sidebar.classList.remove('active');
                navToggle.setAttribute('aria-expanded', false);
                body.classList.remove('no-scroll');
            }
        });

        // Hide sidebar if the user resizes to desktop view
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                navToggle.setAttribute('aria-expanded', false);
                body.classList.remove('no-scroll');
            }
        });
    }
});