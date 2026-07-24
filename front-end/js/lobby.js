document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.room-item').forEach((room, index) => {
    room.animate(
      [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'translateX(0)' }],
      { duration: 400, delay: index * 120, fill: 'forwards' }
    );
  });
});
