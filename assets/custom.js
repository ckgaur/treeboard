/*
* Story Theme
*
* Use this file to add custom Javascript to Story.  Keeping your custom
* Javascript in this fill will make it easier to update Story. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*
*/

(function () {
  console.log("test");
  var MQ = window.matchMedia('(max-width: 1023px)');
  var DELAY = 3500;
  var sliders = [];

  function TickerSlider(frame) {
    var self = this;
    var scale = frame.querySelector('[data-ticker-scale]');
    if (!scale) return;

    self.index = 0;
    self.slides = [];
    self.timer = null;

    function collect() {
      var seen = {};
      self.slides = [];
      scale.querySelectorAll('[data-ticker-text]').forEach(function (el) {
        var key = el.textContent.replace(/\s+/g, ' ').trim();
        if (seen[key]) {
          el.classList.add('is-duplicate');
        } else {
          seen[key] = true;
          el.classList.remove('is-duplicate');
          self.slides.push(el);
        }
      });
      if (self.index >= self.slides.length) self.index = 0;
      render(null);
    }

    function render(prev) {
      self.slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === self.index);
        s.classList.toggle('is-prev', i === prev);
      });
    }

    self.go = function (n) {
      if (self.slides.length < 2) return;
      var prev = self.index;
      self.index = (n + self.slides.length) % self.slides.length;
      render(prev);
    };

    self.start = function () {
      self.stop();
      self.timer = setInterval(function () { self.go(self.index + 1); }, DELAY);
    };
    self.stop = function () { clearInterval(self.timer); };

    // Swipe
    var x0 = 0;
    frame.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; self.stop(); }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      var d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 40) self.go(d < 0 ? self.index + 1 : self.index - 1);
      self.start();
    });

    // Rebuild if the theme adds or removes items
    self.observer = new MutationObserver(collect);
    self.observer.observe(scale, { childList: true });

    self.destroy = function () {
      self.stop();
      self.observer.disconnect();
      frame.classList.remove('ticker-slider');
      scale.querySelectorAll('[data-ticker-text]').forEach(function (el) {
        el.classList.remove('is-active', 'is-prev', 'is-duplicate');
      });
    };

    frame.classList.add('ticker-slider');
    collect();
    self.start();
  }

  function setup() {
    sliders.forEach(function (s) { s.destroy && s.destroy(); });
    sliders = [];
    if (!MQ.matches) return;
    document.querySelectorAll('[data-ticker-frame]').forEach(function (frame) {
      sliders.push(new TickerSlider(frame));
    });
    console.log('[ticker-slider] initialised:', sliders.length);
  }

  // Run no matter when this script loads, then again after the theme's JS has run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
  window.addEventListener('load', function () { setTimeout(setup, 300); });

  if (MQ.addEventListener) MQ.addEventListener('change', setup);
  else MQ.addListener(setup);
})();

