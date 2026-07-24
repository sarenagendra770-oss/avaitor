document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.leaderboard-item');
  items.forEach((item, index) => {
    item.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 450, delay: index * 120, fill: 'forwards' }
    );
  });
});
