document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.hero-card, .card, .panel, .auth-card');
  cards.forEach((card, index) => {
    card.animate(
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 550, delay: index * 80, fill: 'forwards' }
    );
  });
});
