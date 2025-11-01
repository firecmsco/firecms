// Mouse spotlight effect for cards
document.addEventListener('astro:page-load', () => {
  const cards = document.querySelectorAll('[data-spotlight-card]');

  cards.forEach(card => {
    const spotlight = card.querySelector('[data-spotlight]') as HTMLElement;
    if (!spotlight) return;

    card.addEventListener('mousemove', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const rect = card.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;

      // Create radial gradient that follows mouse
      spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(56, 189, 248, 0.15), transparent 40%)`;
    });

    card.addEventListener('mouseleave', () => {
      spotlight.style.background = '';
    });
  });

  // Intersection Observer for scroll animations
  if ((window as any).pageObserver) {
    (window as any).pageObserver.disconnect();
  }

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log('Animation triggered for:', entry.target);
        entry.target.classList.add('in-view');
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  (window as any).pageObserver = observer;

  // Observe all elements with animate-on-scroll class
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  animatedElements.forEach(el => {
    el.classList.remove('in-view');
    observer.observe(el);
  });
});

