/* site.js · 作品集网页层行为（无依赖、无外链）
   ① 当前页导航状态
   ② 视频位：文件未放入时显示柔和占位；点击后才挂载媒体
   ③ 入场动效：淡入上浮 16px；尊重减少动态效果
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  var page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll('.nav-links a[data-page]').forEach(function (link) {
      if (link.getAttribute('data-page') === page) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  document.querySelectorAll('[data-video]').forEach(function (figure) {
    var video = figure.querySelector('video');
    var fallback = figure.querySelector('.video-fallback');
    var button = figure.querySelector('.video-fallback .btn');
    if (!video || !fallback || !button) return;

    var src = figure.getAttribute('data-video');
    var note = fallback.querySelector('.video-fallback-note');
    var originalNote = note ? note.innerHTML : '';
    var hasStarted = false;

    function showFallback(message) {
      fallback.hidden = false;
      fallback.classList.remove('is-loading');
      video.hidden = true;
      button.textContent = '播放演示';
      if (note && message) note.innerHTML = message;
    }

    button.addEventListener('click', function () {
      if (hasStarted) return;
      hasStarted = true;
      fallback.classList.add('is-loading');
      button.textContent = '正在载入…';
      if (note) note.textContent = '正在读取演示视频…';
      video.hidden = false;
      video.setAttribute('controls', '');
      video.src = src;
      video.load();
    });

    video.addEventListener('loadeddata', function () {
      fallback.hidden = true;
      fallback.classList.remove('is-loading');
      var result = video.play();
      if (result && result.catch) result.catch(function () {});
    });

    video.addEventListener('error', function () {
      hasStarted = false;
      showFallback('还没找到 <code>' + src + '</code>。把成片放到这个路径，刷新后即可播放。');
    });

    video.addEventListener('empty', function () {
      showFallback(originalNote);
    });
  });

  var toc = document.querySelector('.section-toc');
  if (toc) {
    var tocLinks = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    var tocTargets = tocLinks.map(function (link) {
      return document.getElementById(link.getAttribute('href').slice(1));
    });
    var tocProgress = toc.querySelector('.section-toc__progress');
    var tocTicking = false;

    function updateToc() {
      tocTicking = false;
      var header = document.querySelector('.site-header');
      var headerH = header ? header.offsetHeight : 0;
      var line = window.scrollY + headerH + toc.offsetHeight + 28;
      var activeIndex = 0;

      tocTargets.forEach(function (target, index) {
        if (target && target.getBoundingClientRect().top + window.scrollY <= line) {
          activeIndex = index;
        }
      });

      tocLinks.forEach(function (link, index) {
        if (index === activeIndex) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'location');
        } else {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        }
      });

      if (tocProgress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
        tocProgress.style.width = pct.toFixed(2) + '%';
      }
    }

    function requestTocUpdate() {
      if (!tocTicking) {
        tocTicking = true;
        window.requestAnimationFrame(updateToc);
      }
    }

    window.addEventListener('scroll', requestTocUpdate, { passive: true });
    window.addEventListener('resize', requestTocUpdate);
    updateToc();
  }

  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  items.forEach(function (el) { observer.observe(el); });
}());