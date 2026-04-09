/* =====================================================
   MedWear - E-Commerce Landing Page JavaScript
   ===================================================== */

(function () {
  'use strict';

  /* ---- Cart State ---- */
  const cart = {
    items: [],
    get count() { return this.items.reduce((sum, i) => sum + i.qty, 0); },
    get total() { return this.items.reduce((sum, i) => sum + i.price * i.qty, 0); },
    add(id, name, price) {
      const existing = this.items.find(i => i.id === id);
      if (existing) {
        existing.qty++;
      } else {
        this.items.push({ id, name, price: Number(price), qty: 1 });
      }
      this.save();
    },
    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.save();
    },
    save() {
      try {
        localStorage.setItem('medwear_cart', JSON.stringify(this.items));
      } catch (e) {}
    },
    load() {
      try {
        const saved = localStorage.getItem('medwear_cart');
        if (saved) this.items = JSON.parse(saved);
      } catch (e) {}
    }
  };

  /* ---- DOM Helpers ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---- Announcement Bar ---- */
  function initAnnouncement() {
    const bar = $('#announcement-bar');
    const closeBtn = $('#close-announcement');
    if (!bar || !closeBtn) return;

    if (sessionStorage.getItem('announcement_closed')) {
      bar.style.display = 'none';
      document.documentElement.style.setProperty('--announcement-height', '0px');
    }

    closeBtn.addEventListener('click', () => {
      bar.style.transition = 'height 0.3s ease, opacity 0.3s ease';
      bar.style.opacity = '0';
      bar.style.height = '0';
      setTimeout(() => {
        bar.style.display = 'none';
        document.documentElement.style.setProperty('--announcement-height', '0px');
      }, 300);
      sessionStorage.setItem('announcement_closed', '1');
    });
  }

  /* ---- Navbar Scroll Effect ---- */
  function initNavbar() {
    const navbar = $('#navbar');
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ---- Search ---- */
  function initSearch() {
    const searchBtn = $('#search-btn');
    const searchOverlay = $('#search-overlay');
    const searchClose = $('#search-close');
    const searchInput = $('#search-input');
    if (!searchBtn || !searchOverlay) return;

    const openSearch = () => {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput && searchInput.focus(), 200);
      document.body.style.overflow = 'hidden';
    };

    const closeSearch = () => {
      searchOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    searchBtn.addEventListener('click', openSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearch);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        closeSearch();
      }
    });
  }

  /* ---- Mobile Hamburger ---- */
  function initHamburger() {
    const hamburger = $('#hamburger');
    const navLinks = $('#nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'fixed';
      navLinks.style.top = 'var(--nav-height)';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'white';
      navLinks.style.padding = '16px 24px';
      navLinks.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
      navLinks.style.zIndex = '999';
      hamburger.style.opacity = isOpen ? '1' : '0.7';
    });
  }

  /* ---- Cart UI ---- */
  function updateCartUI() {
    const countEl = $('#cart-count');
    const itemsEl = $('#cart-items');
    const emptyEl = $('#cart-empty');
    const footerEl = $('#cart-footer');
    const totalEl = $('#cart-total');

    if (countEl) {
      countEl.textContent = cart.count;
      countEl.style.display = cart.count > 0 ? 'flex' : 'none';
    }

    if (!itemsEl) return;

    if (cart.items.length === 0) {
      if (emptyEl) emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      const existingItems = $$('.cart-item', itemsEl);
      existingItems.forEach(el => el.remove());
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';
    if (totalEl) totalEl.textContent = '₹' + cart.total.toLocaleString('en-IN');

    // Re-render cart items
    const existingItems = $$('.cart-item', itemsEl);
    existingItems.forEach(el => el.remove());

    cart.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')} × ${item.qty}</div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">✕</button>
      `;
      el.querySelector('.cart-item-remove').addEventListener('click', () => {
        cart.remove(item.id);
        updateCartUI();
      });
      itemsEl.insertBefore(el, emptyEl);
    });
  }

  function openCart() {
    const sidebar = $('#cart-sidebar');
    const overlay = $('#cart-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const sidebar = $('#cart-sidebar');
    const overlay = $('#cart-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function initCart() {
    cart.load();
    updateCartUI();

    const cartBtn = $('#cart-btn');
    const cartCloseBtn = $('#cart-close-btn');
    const cartOverlay = $('#cart-overlay');

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Add to cart buttons
    $$('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { id, name, price } = btn.dataset;
        cart.add(id, name, price);
        updateCartUI();

        // Button feedback
        const origText = btn.textContent;
        btn.textContent = '✓ Added!';
        btn.classList.add('added');
        setTimeout(() => {
          btn.textContent = origText;
          btn.classList.remove('added');
        }, 1500);

        // Open cart after short delay
        setTimeout(() => openCart(), 200);
      });
    });

    // Checkout
    const checkoutBtn = $('#checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        checkoutBtn.textContent = 'Redirecting...';
        setTimeout(() => {
          checkoutBtn.textContent = 'Proceed to Checkout';
          alert('This is a demo store. In production, this would redirect to the checkout page!');
        }, 1000);
      });
    }
  }

  /* ---- Product Category Tabs ---- */
  function initCategoryTabs() {
    const tabs = $$('.tab-btn');
    const cards = $$('.product-card');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        cards.forEach(card => {
          const category = card.dataset.category;
          const shouldShow = filter === 'all' || category === filter;

          if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.4s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---- Wishlist ---- */
  function initWishlist() {
    $$('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.toggle('active');
        btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
        
        // Little animation
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => btn.style.transform = '', 200);
      });
    });
  }

  /* ---- Quick View Modal ---- */
  const productData = {
    '1': {
      name: "Classic Women's V-Neck Scrub",
      desc: "The iconic MedWear Classic V-Neck is designed for every-day comfort. Crafted from our premium SuperSoft™ fabric blend, it features 5 deep pockets — including a dedicated phone pocket and scissor loop.",
      price: '₹1,099',
      rating: '4.8',
      fabric: 'SuperSoft™ Cotton Blend',
      pockets: '5 Pockets',
      fit: 'Regular & Plus Size Available',
    },
    '2': {
      name: "Classic Women's V-Neck Scrub (Wine)",
      desc: "Turn heads on every round. The Wine Classic is cut for a flattering fit with zero compromise on functionality. Available in S-3XL.",
      price: '₹1,099',
      rating: '4.9',
      fabric: 'SuperSoft™ Cotton Blend',
      pockets: '5 Pockets',
      fit: 'Regular & Plus Size Available',
    },
    '3': {
      name: 'Mandarin Collar Scrub Set',
      desc: "A professional silhouette with the comfort of ecoflex™ 4-way stretch fabric. The Mandarin Collar gives a polished, defined look perfect for clinical rounds.",
      price: '₹1,349',
      rating: '4.7',
      fabric: 'ecoflex™ 4-Way Stretch',
      pockets: '9 Pockets',
      fit: 'Regular & Petite',
    },
    '4': {
      name: 'Classic Nurse Scrub Set',
      desc: "Designed with input from nursing professionals. The Pastel Pink Nurse Set exudes warmth while keeping you fully equipped for your shift.",
      price: '₹1,199',
      rating: '4.9',
      fabric: 'SuperSoft™ Featherlight',
      pockets: '5 Pockets',
      fit: 'Regular, Plus Size & Petite',
    },
    '5': {
      name: "Chief Women's Lab Coat",
      desc: "Command the room with the Chief Lab Coat — full-length, anti-wrinkle, with a refined drape that looks sharp after 12 hours.",
      price: '₹1,799',
      rating: '4.8',
      fabric: 'Anti-Wrinkle Poly-Cotton',
      pockets: '6 Pockets (incl. chest)',
      fit: 'Regular & Tall',
    },
    '6': {
      name: '6Sense™ Stethoscope',
      desc: "Crystal clear acoustics with 40% noise reduction. The 6Sense™ stethoscope features a dual-sided chestpiece and ergonomic headset designed for prolonged use.",
      price: '₹2,499',
      rating: '4.9',
      fabric: 'Dual-Head · 70cm Tube',
      pockets: 'Comes with carry case',
      fit: 'Rose Gold / Black / White',
    },
    '7': {
      name: "DRIFT Women's Jacket",
      desc: "Built for transition — from clinical to casual. The DRIFT Jacket is water-resistant, breathable, and designed with concealed zip pockets for a sleek profile.",
      price: '₹2,199',
      rating: '4.7',
      fabric: 'Water-Resistant Softshell',
      pockets: '4 Zip Pockets',
      fit: 'Regular Fit',
    },
    '8': {
      name: "ecoflex™ Women's Joggers",
      desc: "Ultimate comfort from shift start to shift end. The ecoflex™ Joggers feature a 4-way stretch waistband, tapered fit, and 4 pockets — modern and functional.",
      price: '₹899',
      rating: '4.8',
      fabric: 'ecoflex™ 4-Way Stretch',
      pockets: '4 Pockets',
      fit: 'Regular & Plus Size',
    },
  };

  function initQuickView() {
    const overlay = $('#modal-overlay');
    const closeBtn = $('#modal-close');
    const modalContent = $('#modal-content');

    $$('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.product;
        const data = productData[id];
        if (!data || !modalContent) return;

        modalContent.innerHTML = `
          <h2 style="font-size:22px;font-weight:800;margin-bottom:8px;">${data.name}</h2>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
            <span style="color:#f6917e;font-size:18px;">★★★★★</span>
            <span style="font-weight:700;font-size:14px;">${data.rating} / 5</span>
          </div>
          <p style="color:#5e5a73;line-height:1.7;margin-bottom:20px;">${data.desc}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
            <div style="background:#f9f8ff;border-radius:12px;padding:16px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#a09ab8;margin-bottom:4px;">Fabric</div>
              <div style="font-weight:600;font-size:14px;">${data.fabric}</div>
            </div>
            <div style="background:#f9f8ff;border-radius:12px;padding:16px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#a09ab8;margin-bottom:4px;">Pockets</div>
              <div style="font-weight:600;font-size:14px;">${data.pockets}</div>
            </div>
            <div style="background:#f9f8ff;border-radius:12px;padding:16px;grid-column:1/-1;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#a09ab8;margin-bottom:4px;">Fit / Size</div>
              <div style="font-weight:600;font-size:14px;">${data.fit}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;background:#f4f2ff;border-radius:16px;padding:16px 20px;margin-bottom:20px;">
            <div>
              <div style="font-size:28px;font-weight:800;color:#5B3CC4;">${data.price}</div>
              <div style="font-size:11px;color:#a09ab8;">Incl. of all taxes · Free shipping available</div>
            </div>
            <button onclick="document.getElementById('modal-overlay').classList.remove('active'); document.getElementById('atc-${id}').click();" 
              style="padding:14px 24px;background:#5B3CC4;color:white;border:none;border-radius:50px;font-size:15px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;">
              Add to Bag
            </button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="padding:6px 14px;background:white;border:1px solid #e8e0ff;border-radius:50px;font-size:12px;font-weight:500;">✓ 7-Day Easy Returns</span>
            <span style="padding:6px 14px;background:white;border:1px solid #e8e0ff;border-radius:50px;font-size:12px;font-weight:500;">✓ Authentic Product</span>
            <span style="padding:6px 14px;background:white;border:1px solid #e8e0ff;border-radius:50px;font-size:12px;font-weight:500;">✓ EMI Available</span>
          </div>
        `;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
  }

  /* ---- Color Swatch Switching ---- */
  function initColorSwatches() {
    $$('.product-colors').forEach(container => {
      const dots = $$('.color-dot', container);
      dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          dots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
        });
      });
    });
  }

  /* ---- Scroll Animations ---- */
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const animatables = [
      ...$$('.product-card'),
      ...$$('.feature-card'),
      ...$$('.testimonial-card'),
      ...$$('.trust-item'),
      ...$$('.color-chip'),
      ...$$('.ef-card'),
      ...$$('.about-card'),
      ...$$('.contact-info-item'),
    ];

    animatables.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
      observer.observe(el);
    });
  }

  /* ---- Counter Animation ---- */
  function animateCounter(el, target, suffix = '') {
    const duration = 1500;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const stats = $$('.hero-stat strong');
    // The hero stats are text — just animate them slightly with a visual cue
    // (Already handled by scroll animation)
  }

  /* ---- Smooth scroll for anchor links ---- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---- Refer Widget ---- */
  function initReferWidget() {
    const widget = $('#refer-widget');
    if (!widget) return;

    setTimeout(() => {
      widget.style.transform = 'translateY(-50%) rotate(-90deg)';
      widget.style.transition = 'all 0.5s ease';
    }, 2000);
  }

  /* ---- Contact Form → WhatsApp Redirect ---- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = ($('#contact-name')    || {}).value || '';
      const email   = ($('#contact-email')   || {}).value || '';
      const phone   = ($('#contact-phone')   || {}).value || '';
      const message = ($('#contact-message') || {}).value || '';

      const text = [
        `👋 *New Enquiry from MedWear Website*`,
        ``,
        `*Name:* ${name}`,
        `*Email:* ${email}`,
        phone ? `*Phone:* ${phone}` : null,
        ``,
        `*Message:*`,
        message,
      ].filter(line => line !== null).join('\n');

      const whatsappNumber = '919876543210'; // Replace with actual number
      const encoded = encodeURIComponent(text);
      const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;

      // Visual feedback
      const btn = $('#contact-submit-btn');
      if (btn) {
        btn.textContent = '✓ Redirecting to WhatsApp...';
        btn.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
      }

      setTimeout(() => {
        window.open(url, '_blank');
        if (btn) {
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.484 2 12.017c0 1.988.522 3.853 1.433 5.467L2 22l4.651-1.408A9.955 9.955 0 0 0 12 22c5.522 0 10-4.477 10-10S17.522 2 11.999 2z"/></svg> Send via WhatsApp';
        }
        form.reset();
      }, 600);
    });
  }

  /* ---- Page Load Animation ---- */
  function initPageLoad() {
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
      document.body.style.transition = 'opacity 0.4s ease';
      document.body.style.opacity = '1';
    });
  }

  /* ---- Initialize All ---- */
  function init() {
    initPageLoad();
    initAnnouncement();
    initNavbar();
    initSearch();
    initHamburger();
    initCart();
    initCategoryTabs();
    initWishlist();
    initQuickView();
    initColorSwatches();
    initScrollAnimations();
    initCounters();
    initSmoothScroll();
    initReferWidget();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
