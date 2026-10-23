/* ========================================
   WEDDING SITE — script.js
   ======================================== */
(function () {
  'use strict';

  /* ----------------------------------------
     0. CONFIGURAÇÃO — edite só aqui
     (data, prazo do RSVP e dicas dos espaços de imagem)
  ---------------------------------------- */
  const WEDDING = {
    year: 2026,
    month: 12,          // 1–12
    day: 25,
    hour: 16,
    minute: 0,
    rsvpDeadline: '1º de setembro de 2026',
    showSlotHints: true // false = esconde os rótulos tracejados dos espaços de imagem
  };

  const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const pad = (n) => String(n).padStart(2, '0');

  const weddingDate = new Date(WEDDING.year, WEDDING.month - 1, WEDDING.day, WEDDING.hour, WEDDING.minute, 0);
  const dateTexts = {
    long: `${WEDDING.day} de ${MONTHS[WEDDING.month - 1]} de ${WEDDING.year}`,
    dots: `${pad(WEDDING.day)}.${pad(WEDDING.month)}.${WEDDING.year}`,
    rsvp: WEDDING.rsvpDeadline
  };

  // Preenche todos os textos de data a partir da configuração acima
  document.querySelectorAll('[data-w]').forEach((el) => {
    const key = el.getAttribute('data-w');
    if (dateTexts[key]) el.textContent = dateTexts[key];
  });

  if (!WEDDING.showSlotHints) document.body.classList.add('no-hints');

  /* ----------------------------------------
     1. ESPAÇOS PARA IMAGENS
     Se a imagem não existir, o espaço fica visível com o nome do arquivo.
  ---------------------------------------- */
  function markEmpty(img) {
    const slot = img.closest('.slot');
    img.style.display = 'none';
    if (slot) {
      slot.setAttribute('data-slot', img.getAttribute('data-slot') || '');
      slot.classList.add('slot--empty');
    }
  }

  document.querySelectorAll('img[data-slot]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) {
      markEmpty(img);
    } else {
      img.addEventListener('error', () => markEmpty(img));
    }
  });

  /* ----------------------------------------
     2. TIMELINE DE ENTRADA (convite se abrindo → hero)
     Tudo controlado por JS + transições CSS (sem CSS animation).
  ---------------------------------------- */
  function initCinematicTimeline() {
    const loader         = document.querySelector('.loader');
    const loaderContent  = document.querySelector('.loader__content');
    const grain          = document.querySelector('.grain-overlay');
    const nav            = document.querySelector('.nav');
    const heroShadow     = document.querySelector('.hero__shadow');
    const heroItems      = document.querySelectorAll('.hero-reveal');
    const orchids        = document.querySelectorAll('.orchid');

    const revealPage = () => {
      if (heroShadow) heroShadow.style.opacity = '1';
      if (grain) grain.style.opacity = '0.35';
      if (nav) nav.style.opacity = '1';

      heroItems.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.1}s`;
        el.style.opacity = '1';
        el.style.transform = el.classList.contains('hero__note')
          ? 'rotate(-6deg) translateY(0)'
          : 'translateY(0)';
      });

      orchids.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.14}s`;
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      });
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const captionDelay = prefersReducedMotion ? 850 : 1350;
    const contentFadeDelay = prefersReducedMotion ? 2400 : 3300;
    const openingDelay = prefersReducedMotion ? 3200 : 4100;
    const openingDuration = prefersReducedMotion ? 1500 : 2800;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        if (loader) loader.classList.add('is-monogram-visible');

        setTimeout(() => {
          if (loader) loader.classList.add('is-caption-visible');
        }, captionDelay);

        setTimeout(() => {
          if (loaderContent) loaderContent.style.opacity = '0';
        }, contentFadeDelay);

        setTimeout(() => {
          document.body.classList.add('page-revealing');
          if (loader) loader.classList.add('is-opening');
          revealPage();
        }, openingDelay);

        setTimeout(() => {
          document.body.style.overflow = '';
          if (loader) loader.remove();
          document.body.classList.remove('page-revealing');
        }, openingDelay + openingDuration + 100);

      });
    });
  }

  /* ----------------------------------------
     3. SCROLL REVEAL GENÉRICO
  ---------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 0.08}s`;
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------
     4. STAGGER — O Dia e FAQ
  ---------------------------------------- */
  function staggerList(containerSel, itemSel, step, threshold) {
    const container = document.querySelector(containerSel);
    if (!container) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(itemSel).forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), i * step);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold });
    obs.observe(container);
  }

  staggerList('.day__grid', '.day__item', 140, 0.15);
  staggerList('.faq__list', '.faq-item', 110, 0.08);

  /* ----------------------------------------
     5. IMAGENS LADO A LADO
  ---------------------------------------- */
  function initSplitAnim(el, direction) {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = `translateX(${direction === 'left' ? '-40px' : '40px'})`;
    el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    obs.observe(el);
  }

  initSplitAnim(document.querySelector('.split-images__left'), 'left');
  initSplitAnim(document.querySelector('.split-images__right'), 'right');

  /* ----------------------------------------
     6. NOMES DO RODAPÉ (efeito de digitação)
  ---------------------------------------- */
  const footerNames = document.querySelector('.footer__names');

  if (footerNames) {
    const originalText = footerNames.textContent;
    footerNames.style.minHeight = footerNames.offsetHeight + 'px';
    footerNames.textContent = '';

    const namesObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let i = 0;
          const interval = setInterval(() => {
            footerNames.textContent += originalText[i];
            i++;
            if (i >= originalText.length) clearInterval(interval);
          }, 60);
          namesObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    namesObserver.observe(footerNames);
  }

  /* ----------------------------------------
     7. CONTAGEM REGRESSIVA
  ---------------------------------------- */
  function updateCountdown() {
    const distance = weddingDate.getTime() - Date.now();

    if (distance < 0) {
      const clock = document.getElementById('clock');
      if (clock) clock.innerHTML = '<span class="countdown-done">Chegou o grande dia!</span>';
      return true;
    }

    const days    = Math.floor(distance / 86400000);
    const hours   = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    document.getElementById('days').innerText    = pad(days);
    document.getElementById('hours').innerText   = pad(hours);
    document.getElementById('minutes').innerText = pad(minutes);
    document.getElementById('seconds').innerText = pad(seconds);
    return false;
  }

  if (!updateCountdown()) {
    const timer = setInterval(() => {
      if (updateCountdown()) clearInterval(timer);
    }, 1000);
  }

  /* ----------------------------------------
     8. INIT
  ---------------------------------------- */
  if (document.fonts && document.fonts.ready) {
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1500))
    ]).then(initCinematicTimeline);
  } else {
    window.addEventListener('load', initCinematicTimeline);
  }

})();