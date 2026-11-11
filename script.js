'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach(item => observer.observe(item));
}
const progress = document.querySelector('.reading-progress');
let scrollPending = false;
function updateProgress() {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${height > 0 ? Math.min(100, Math.max(0, window.scrollY / height * 100)) : 0}%`;
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateProgress);
  }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
if ('IntersectionObserver' in window) {
  const links = document.querySelectorAll('.site-header nav a');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}
const audio = document.getElementById('piano');
const musicToggle = document.getElementById('music-toggle');
const musicLabel = document.getElementById('music-label');
const musicStatus = document.getElementById('music-status');
const volume = document.getElementById('music-volume');
audio.volume = Number(volume.value);
function syncMusic() {
  const playing = !audio.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Tắt nhạc piano' : 'Bật nhạc piano');
  musicLabel.textContent = playing ? 'Chill đang phát' : 'Piano chill';
  musicToggle.closest('.music-player').classList.toggle('is-playing', playing);
}
musicToggle.addEventListener('click', async () => {
  musicToggle.disabled = true;
  try {
    if (audio.paused) await audio.play();
    else audio.pause();
    musicStatus.textContent = audio.paused ? 'Đã tắt nhạc piano.' : 'Đang phát piano chill chậm, êm dịu.';
  } catch (error) {
    musicStatus.textContent = 'Chưa phát được nhạc. Vui lòng kiểm tra tệp assets/piano-chill.wav và thử lại.';
    musicLabel.textContent = 'Thử lại piano';
  } finally {
    musicToggle.disabled = false;
  }
});
audio.addEventListener('play', syncMusic);
audio.addEventListener('pause', syncMusic);
audio.addEventListener('error', () => {
  syncMusic();
  musicLabel.textContent = 'Nhạc chưa khả dụng';
  musicStatus.textContent = 'Không tải được nhạc piano. Vui lòng kiểm tra tệp assets/piano-chill.wav.';
});
volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
document.getElementById('print-cv').addEventListener('click', () => window.print());

// Hiện từng nhóm nội dung theo nhịp ngắn, không tách rời từng chữ.
document.querySelectorAll('.reveal').forEach(section => {
  const items = section.querySelectorAll('.education-item, .skill-list > span, .about-copy > p');
  items.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index * 85, 255)}ms`);
  });
});

// Chỉ cập nhật theo con trỏ trên máy tính; không chạy vòng lặp nền liên tục.
const heroArt = document.querySelector('.hero-art');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (heroArt) {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  function resetArt() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    ['--art-x', '--art-y', '--light-x', '--light-y'].forEach(property => heroArt.style.removeProperty(property));
  }
  heroArt.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const bounds = heroArt.getBoundingClientRect();
    pointerX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    pointerY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      heroArt.style.setProperty('--art-x', `${(pointerX - .5) * 10}px`);
      heroArt.style.setProperty('--art-y', `${(pointerY - .5) * 10}px`);
      heroArt.style.setProperty('--light-x', `${pointerX * 100}%`);
      heroArt.style.setProperty('--light-y', `${pointerY * 100}%`);
      pointerFrame = 0;
    });
  }, { passive: true });
  heroArt.addEventListener('pointerleave', resetArt);
  reducedMotion.addEventListener('change', resetArt);
  finePointer.addEventListener('change', resetArt);
}

// Dừng hoạt ảnh trang khi chuyển sang tab khác để tiết kiệm tài nguyên.
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('motion-paused', document.hidden);
});

