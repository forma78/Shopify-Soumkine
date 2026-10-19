/* Soumkine — theme scripts. No dependencies. */
(() => {
  const root = document.documentElement;
  const theme = window.theme || { routes: {}, strings: {} };
  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const debounce = (fn, wait = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const parseHTML = (text) => new DOMParser().parseFromString(text, 'text/html');

  /* ------------------------------------------------------------------------
     Drawers: menu, cart, search, filters. One open at a time.
     ------------------------------------------------------------------------ */
  const overlay = () => document.querySelector('[data-drawer-overlay]');
  let activeDrawer = null;

  class ThemeDrawer extends HTMLElement {
    connectedCallback() {
      // Drawers rendered inside the sticky header would be trapped in its stacking context,
      // under the page overlay. Move them to <body>, replacing a copy left by an earlier render.
      if (this.hasAttribute('data-portal') && this.parentElement !== document.body) {
        document.querySelectorAll(`body > #${this.id}`).forEach((old) => old.remove());
        document.body.appendChild(this);
        return;
      }
      if (this.initialized) return;
      this.initialized = true;
      this.addEventListener('keydown', (event) => this.onKeydown(event));
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-drawer-close]')) this.close();
      });
    }

    open(trigger, panel) {
      if (activeDrawer && activeDrawer !== this) activeDrawer.close(false);
      this.trigger = trigger || document.activeElement;
      if (typeof this.showPanel === 'function') this.showPanel(panel);
      const shade = overlay();
      if (shade) {
        shade.hidden = false;
        requestAnimationFrame(() => shade.classList.add('is-visible'));
      }
      this.classList.add('is-open');
      this.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-open-drawer');
      document
        .querySelectorAll(`[aria-controls="${this.id}"]`)
        .forEach((el) => el.setAttribute('aria-expanded', 'false'));
      if (this.trigger && this.trigger.setAttribute) this.trigger.setAttribute('aria-expanded', 'true');
      activeDrawer = this;
      setTimeout(() => {
        const target = this.querySelector('[data-autofocus]') || this;
        target.focus({ preventScroll: true });
      }, 80);
    }

    close(restoreFocus = true) {
      if (!this.classList.contains('is-open')) return;
      this.classList.remove('is-open');
      this.setAttribute('aria-hidden', 'true');
      document
        .querySelectorAll(`[aria-controls="${this.id}"]`)
        .forEach((el) => el.setAttribute('aria-expanded', 'false'));
      if (activeDrawer === this) {
        activeDrawer = null;
        document.body.classList.remove('has-open-drawer');
        const shade = overlay();
        if (shade) {
          shade.classList.remove('is-visible');
          setTimeout(() => {
            if (!activeDrawer) shade.hidden = true;
          }, 450);
        }
      }
      if (restoreFocus && this.trigger && this.trigger.focus) this.trigger.focus({ preventScroll: true });
    }

    onKeydown(event) {
      if (event.key === 'Escape') {
        this.close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(this.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  customElements.define('theme-drawer', ThemeDrawer);

  class MenuDrawer extends ThemeDrawer {
    showPanel(name) {
      const panels = this.querySelectorAll('[data-menu-panel]');
      let target = name && this.querySelector(`[data-menu-panel="${name}"]`);
      if (!target) target = this.querySelector('[data-menu-panel="all"]') || panels[0];
      panels.forEach((panel) => panel.classList.toggle('is-active', panel === target));
    }
  }
  customElements.define('menu-drawer', MenuDrawer);

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-drawer-open]');
    if (opener) {
      const drawer = document.getElementById(opener.dataset.drawerOpen);
      if (drawer && typeof drawer.open === 'function') {
        event.preventDefault();
        const samePanel = activeDrawer === drawer && drawer.dataset.panel === (opener.dataset.panel || '');
        if (samePanel) {
          drawer.close();
        } else {
          drawer.dataset.panel = opener.dataset.panel || '';
          drawer.open(opener, opener.dataset.panel);
        }
      }
      return;
    }
    if (event.target.matches('[data-drawer-overlay]') && activeDrawer) activeDrawer.close();
  });

  /* ------------------------------------------------------------------------
     Header: shadow state and hide on scroll down.
     ------------------------------------------------------------------------ */
  const initHeader = () => {
    const section = document.querySelector('.section-header');
    if (!section) return;
    const header = section.querySelector('.header');
    const autoHide = header && header.dataset.sticky === 'auto';
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 10);
      if (autoHide && !activeDrawer) {
        section.classList.toggle('is-hidden', y > lastY && y > 200);
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* ------------------------------------------------------------------------
     Fit text: scales a single line to the full width of its container.
     ------------------------------------------------------------------------ */
  class FitText extends HTMLElement {
    connectedCallback() {
      this.inner = this.querySelector('.fit-text__inner') || this;
      this.fit = this.fit.bind(this);
      this.observer = new ResizeObserver(() => this.fit());
      this.observer.observe(this);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(this.fit);
      this.fit();
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
    }

    fit() {
      const available = this.clientWidth;
      if (!available) return;
      this.style.fontSize = '100px';
      const width = this.inner.getBoundingClientRect().width;
      if (width) this.style.fontSize = `${(100 * available) / width}px`;
    }
  }
  customElements.define('fit-text', FitText);

  /* ------------------------------------------------------------------------
     Reveal on scroll + parallax.
     ------------------------------------------------------------------------ */
  let revealObserver;
  const initReveal = (scope = document) => {
    if (!root.classList.contains('motion-reveal')) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px' }
      );
    }
    scope.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => revealObserver.observe(el));
  };

  let parallaxItems = [];
  let parallaxTicking = false;
  const parallaxEnabled = () =>
    root.classList.contains('motion-parallax') && window.matchMedia('(min-width: 750px)').matches;

  const updateParallax = () => {
    parallaxTicking = false;
    const enabled = parallaxEnabled();
    const vh = window.innerHeight;
    parallaxItems.forEach((el) => {
      if (!enabled) {
        el.style.transform = '';
        return;
      }
      // Measure the untransformed parent so the offset does not feed back into itself.
      const rect = el.parentElement ? el.parentElement.getBoundingClientRect() : null;
      if (!rect || rect.bottom < -vh || rect.top > vh * 2) return;
      const speed = parseFloat(el.dataset.parallax) || 0;
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`;
    });
  };

  const requestParallax = () => {
    if (!parallaxTicking) {
      parallaxTicking = true;
      requestAnimationFrame(updateParallax);
    }
  };

  const initParallax = () => {
    parallaxItems = Array.from(document.querySelectorAll('[data-parallax]'));
    requestParallax();
  };

  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);

  /* ------------------------------------------------------------------------
     Slider with previous / next buttons.
     ------------------------------------------------------------------------ */
  class SliderComponent extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-slider-track]');
      this.prev = this.querySelector('[data-slider-prev]');
      this.next = this.querySelector('[data-slider-next]');
      if (!this.track) return;
      this.update = this.update.bind(this);
      if (this.prev) this.prev.addEventListener('click', () => this.go(-1));
      if (this.next) this.next.addEventListener('click', () => this.go(1));
      this.track.addEventListener('scroll', debounce(this.update, 60), { passive: true });
      window.addEventListener('resize', debounce(this.update, 120));
      this.update();
    }

    step() {
      const slide = this.track.firstElementChild;
      if (!slide) return this.track.clientWidth;
      const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
      return slide.getBoundingClientRect().width + gap;
    }

    go(direction) {
      this.track.scrollBy({ left: direction * this.step(), behavior: 'smooth' });
    }

    update() {
      const max = this.track.scrollWidth - this.track.clientWidth - 2;
      if (this.prev) this.prev.disabled = this.track.scrollLeft <= 2;
      if (this.next) this.next.disabled = this.track.scrollLeft >= max;
      const controls = this.querySelector('.slider-controls');
      if (controls) controls.hidden = max <= 0;
    }
  }
  customElements.define('slider-component', SliderComponent);

  /* ------------------------------------------------------------------------
     Quantity input.
     ------------------------------------------------------------------------ */
  class QuantityInput extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input');
      this.querySelectorAll('[data-quantity]').forEach((button) =>
        button.addEventListener('click', (event) => {
          event.preventDefault();
          const min = parseInt(this.input.min || '0', 10);
          const max = this.input.max ? parseInt(this.input.max, 10) : Infinity;
          const value = (parseInt(this.input.value, 10) || 0) + parseInt(button.dataset.quantity, 10);
          const next = Math.min(Math.max(value, min), max);
          if (next === parseInt(this.input.value, 10)) return;
          this.input.value = next;
          this.input.dispatchEvent(new Event('change', { bubbles: true }));
        })
      );
    }
  }
  customElements.define('quantity-input', QuantityInput);

  /* ------------------------------------------------------------------------
     Cart: AJAX updates for the drawer and the cart page.
     ------------------------------------------------------------------------ */
  const setCartCount = (count) => {
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
    });
  };

  const renderCartSections = (sections) => {
    if (!sections) return;
    document.querySelectorAll('cart-items').forEach((items) => {
      const html = sections[items.dataset.sectionId];
      if (!html) return;
      const fresh = parseHTML(html).querySelector('cart-items');
      if (!fresh) return;
      items.innerHTML = fresh.innerHTML;
      if (fresh.dataset.cartCountValue !== undefined) setCartCount(fresh.dataset.cartCountValue);
    });
  };

  const cartSectionIds = () =>
    Array.from(new Set(Array.from(document.querySelectorAll('cart-items')).map((el) => el.dataset.sectionId)));

  class CartItems extends HTMLElement {
    connectedCallback() {
      this.addEventListener('change', (event) => {
        const input = event.target.closest('[data-line-quantity]');
        if (input) this.update(input.dataset.lineQuantity, input.value);
      });
      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-line-remove]');
        if (remove) {
          event.preventDefault();
          this.update(remove.dataset.lineRemove, 0);
        }
      });
    }

    async update(line, quantity) {
      this.classList.add('cart-is-loading');
      try {
        const response = await fetch(`${theme.routes.cartChange}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            line: Number(line),
            quantity: Number(quantity),
            sections: cartSectionIds(),
            sections_url: window.location.pathname,
          }),
        });
        const cart = await response.json();
        if (cart.status) throw new Error(cart.description || cart.message);
        setCartCount(cart.item_count);
        renderCartSections(cart.sections);
      } catch (error) {
        const message = this.querySelector('[data-cart-error]');
        if (message) {
          message.textContent = error.message || theme.strings.cartError;
          message.hidden = false;
        }
      } finally {
        this.classList.remove('cart-is-loading');
      }
    }
  }
  customElements.define('cart-items', CartItems);

  /* ------------------------------------------------------------------------
     Product form: add to cart without leaving the page.
     ------------------------------------------------------------------------ */
  class ProductForm extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      if (!this.form) return;
      this.error = this.querySelector('[data-product-error]');
      this.form.addEventListener('submit', (event) => this.onSubmit(event));
    }

    async onSubmit(event) {
      if (theme.cartType !== 'drawer' || !document.getElementById('CartDrawer')) return;
      event.preventDefault();
      const submit = this.form.querySelector('[type="submit"]');
      if (submit) submit.setAttribute('aria-disabled', 'true');
      if (this.error) this.error.hidden = true;

      const body = new FormData(this.form);
      body.append('sections', cartSectionIds().join(','));
      body.append('sections_url', window.location.pathname);

      try {
        const response = await fetch(`${theme.routes.cartAdd}.js`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body,
        });
        const data = await response.json();
        if (data.status) throw new Error(data.description || data.message);
        renderCartSections(data.sections);
        const drawer = document.getElementById('CartDrawer');
        if (drawer) drawer.open(submit);
      } catch (error) {
        if (this.error) {
          this.error.textContent = error.message || theme.strings.cartError;
          this.error.hidden = false;
        }
      } finally {
        if (submit) submit.removeAttribute('aria-disabled');
      }
    }
  }
  customElements.define('product-form', ProductForm);

  /* ------------------------------------------------------------------------
     Variant picker: re-renders price and buttons from the section.
     ------------------------------------------------------------------------ */
  class VariantPicker extends HTMLElement {
    connectedCallback() {
      const data = this.querySelector('script[type="application/json"]');
      this.variants = data ? JSON.parse(data.textContent) : [];
      this.addEventListener('change', () => this.onChange());
    }

    selectedOptions() {
      return Array.from(this.querySelectorAll('fieldset')).map((fieldset) => {
        const checked = fieldset.querySelector('input:checked');
        return checked ? checked.value : null;
      });
    }

    onChange() {
      const options = this.selectedOptions();
      const variant = this.variants.find((v) => v.options.every((value, i) => value === options[i]));
      const section = this.closest('[data-product-section]');
      if (!section) return;

      section.querySelectorAll('input[name="id"]').forEach((input) => {
        input.value = variant ? variant.id : '';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      if (!variant) {
        section.querySelectorAll('[data-add-button]').forEach((button) => {
          button.disabled = true;
          const label = button.querySelector('[data-add-label]');
          if (label) label.textContent = theme.strings.unavailable;
        });
        return;
      }

      const url = `${this.dataset.url}?variant=${variant.id}`;
      window.history.replaceState({}, '', url);

      if (variant.featured_media) {
        section.dispatchEvent(new CustomEvent('variant:media', { detail: variant.featured_media.id, bubbles: true }));
      }

      fetch(`${url}&section_id=${this.dataset.section}`)
        .then((response) => response.text())
        .then((text) => {
          const doc = parseHTML(text);
          section.querySelectorAll('[data-update]').forEach((el) => {
            const fresh = doc.querySelector(`[data-update="${el.dataset.update}"]`);
            if (fresh) el.innerHTML = fresh.innerHTML;
          });
        });
    }
  }
  customElements.define('variant-picker', VariantPicker);

  /* ------------------------------------------------------------------------
     Product gallery: thumbnails + swipe.
     ------------------------------------------------------------------------ */
  class ProductGallery extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-gallery-track]');
      this.thumbs = Array.from(this.querySelectorAll('[data-gallery-thumb]'));
      this.counter = this.querySelector('[data-gallery-current]');
      if (!this.track) return;
      this.thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => this.go(index)));
      this.track.addEventListener('scroll', debounce(() => this.sync(), 50), { passive: true });
      const section = this.closest('[data-product-section]');
      if (section) {
        section.addEventListener('variant:media', (event) => {
          const slide = this.track.querySelector(`[data-media-id="${event.detail}"]`);
          if (slide) this.go(Array.from(this.track.children).indexOf(slide));
        });
      }
    }

    go(index) {
      const slide = this.track.children[index];
      if (!slide) return;
      this.track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
      this.mark(index);
    }

    sync() {
      const index = Math.round(this.track.scrollLeft / Math.max(this.track.clientWidth, 1));
      this.mark(index);
    }

    mark(index) {
      this.thumbs.forEach((thumb, i) => thumb.setAttribute('aria-current', i === index ? 'true' : 'false'));
      if (this.counter) this.counter.textContent = index + 1;
    }
  }
  customElements.define('product-gallery', ProductGallery);

  /* ------------------------------------------------------------------------
     Product recommendations.
     ------------------------------------------------------------------------ */
  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      // Already rendered (e.g. when the section itself came from the recommendations endpoint).
      if (this.querySelector('[data-slider-track]')) return;
      const load = () => {
        fetch(this.dataset.url)
          .then((response) => {
            if (!response.ok) throw new Error(response.status);
            return response.text();
          })
          .then((text) => {
            const fresh = parseHTML(text).querySelector('product-recommendations');
            if (fresh && fresh.innerHTML.trim().length) {
              this.innerHTML = fresh.innerHTML;
              initReveal(this);
            } else {
              this.closest('.shopify-section')?.setAttribute('hidden', '');
            }
          })
          .catch(() => {});
      };
      new IntersectionObserver(
        (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          observer.disconnect();
          load();
        },
        { rootMargin: '0px 0px 400px 0px' }
      ).observe(this);
    }
  }
  customElements.define('product-recommendations', ProductRecommendations);

  /* ------------------------------------------------------------------------
     Predictive search.
     ------------------------------------------------------------------------ */
  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input[type="search"]');
      this.results = this.querySelector('[data-predictive-results]');
      if (!this.input || !this.results || !theme.routes.predictiveSearch) return;
      this.input.addEventListener(
        'input',
        debounce(() => this.search(), 260)
      );
    }

    search() {
      const query = this.input.value.trim();
      if (query.length < 2) {
        this.results.innerHTML = '';
        return;
      }
      const params = new URLSearchParams({
        q: query,
        'resources[type]': 'product',
        'resources[limit]': '8',
        section_id: 'predictive-search',
      });
      fetch(`${theme.routes.predictiveSearch}?${params}`)
        .then((response) => response.text())
        .then((text) => {
          const fresh = parseHTML(text).querySelector('[data-predictive-results]');
          this.results.innerHTML = fresh ? fresh.innerHTML : '';
        })
        .catch(() => {
          this.results.innerHTML = '';
        });
    }
  }
  customElements.define('predictive-search', PredictiveSearch);

  /* ------------------------------------------------------------------------
     Background video: play / pause toggle.
     ------------------------------------------------------------------------ */
  class VideoFeature extends HTMLElement {
    connectedCallback() {
      this.video = this.querySelector('video');
      this.toggle = this.querySelector('[data-video-toggle]');
      if (!this.video) return;
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.loop = true;
      this.video.removeAttribute('autoplay');
      // Whether the video should run while it is on screen: autoplay setting, then the visitor's button.
      this.wantsPlay = this.shouldAutoplay();
      if (this.toggle) {
        this.toggle.addEventListener('click', () => {
          this.wantsPlay = this.video.paused;
          if (this.wantsPlay) this.play();
          else this.video.pause();
        });
      }
      this.video.addEventListener('play', () => this.sync());
      this.video.addEventListener('pause', () => this.sync());
      // Rest while off screen; resume on return if it should be playing.
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (this.wantsPlay) this.play();
          } else if (!this.video.paused) {
            this.video.pause();
          }
        },
        { threshold: 0.1 }
      );
      this.observer.observe(this);
      this.sync();
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
    }

    shouldAutoplay() {
      const mode = this.dataset.autoplay || 'always';
      if (mode === 'never') return false;
      if (mode === 'desktop' && !window.matchMedia('(min-width: 990px)').matches) return false;
      if (this.dataset.respectMotion === 'true' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }
      return true;
    }

    play() {
      const attempt = this.video.play();
      if (attempt) attempt.catch(() => this.sync());
    }

    sync() {
      if (!this.toggle) return;
      const paused = this.video.paused;
      this.toggle.querySelector('[data-label-play]').hidden = !paused;
      this.toggle.querySelector('[data-label-pause]').hidden = paused;
    }
  }
  customElements.define('video-feature', VideoFeature);

  /* ------------------------------------------------------------------------
     Small behaviours.
     ------------------------------------------------------------------------ */
  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-autosubmit]')) event.target.form.submit();
  });

  /* Commissions: buttons preselect the project in the enquiry form; in-page anchors close the menu. */
  const selectProject = (value) => {
    if (!value) return;
    document.querySelectorAll('[data-project-select]').forEach((select) => {
      const match = Array.from(select.options).find((option) => option.value.toLowerCase() === value.toLowerCase());
      if (match) select.value = match.value;
    });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link) return;
    if (link.dataset.project) selectProject(link.dataset.project);
    const url = new URL(link.href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash && activeDrawer) activeDrawer.close(false);
  });

  selectProject(new URLSearchParams(window.location.search).get('project'));

  let heroObserver;
  const initHeroWordmark = () => {
    if (heroObserver) heroObserver.disconnect();
    const wordmark = document.querySelector('.hero-collage__wordmark');
    root.classList.remove('hero-wordmark-out');
    if (!wordmark) return;
    const header = document.querySelector('.header');
    const offset = header ? header.offsetHeight : 0;
    heroObserver = new IntersectionObserver(
      ([entry]) => root.classList.toggle('hero-wordmark-out', !entry.isIntersecting),
      { rootMargin: `-${offset}px 0px 0px 0px` }
    );
    heroObserver.observe(wordmark);
  };

  const init = (scope) => {
    initReveal(scope);
    initParallax();
    initHeroWordmark();
  };

  initHeader();
  init(document);

  document.addEventListener('shopify:section:load', (event) => init(event.target));
})();
