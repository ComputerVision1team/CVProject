document.addEventListener('DOMContentLoaded', () => {
  function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    timeElement.dateTime = now.toISOString();
    timeElement.textContent = now.toLocaleTimeString();
  }

  // Initial call to display time immediately
  updateTime();

  // Schedule updates every second
  setInterval(updateTime, 1000);
});

document.querySelectorAll('.startTest .dash').forEach(button => {
  button.addEventListener('mouseover', () => {
    const img = button.querySelector('.dashsvg');
    img.src = '/images/dashWhite.svg';
  });
  button.addEventListener('mouseout', () => {
    const img = button.querySelector('.dashsvg');
    img.src = '/images/dash.svg';
  });

  button.addEventListener('mouseover', () => {
    const img = button.querySelector('.supportsvg');
    img.src = '/images/supportWhite.svg';
  });
  button.addEventListener('mouseout', () => {
    const img = button.querySelector('.supportsvg');
    img.src = '/images/support.svg';
  });

  button.addEventListener('mouseover', () => {
    const img = button.querySelector('.notisvg');
    img.src = '/images/newNoti.svg';
  });
  button.addEventListener('mouseout', () => {
    const img = button.querySelector('.notisvg');
    img.src = '/images/noti.svg';
  });



});