document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     0. LUXURY DARK/LIGHT THEME CONTROLLER
     ========================================== */
  const themeToggle = document.getElementById('theme-toggle');
  let storedTheme = localStorage.getItem('aethera_theme');
  
  if (!storedTheme) {
    // Smart default: Obsidian Dark is the design identity of Aethera
    storedTheme = 'dark';
    localStorage.setItem('aethera_theme', 'dark');
  }

  if (storedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('aethera_theme', isLight ? 'light' : 'dark');
      showToast(`Concierge: ${isLight ? 'Alabaster Light' : 'Obsidian Dark'} mode activated.`);
    });
  }

  /* ==========================================
     1. LUXURY LOADING PRELOADER
     ========================================== */
  const preloader = document.getElementById('preloader');

  // Fade out preloader when page resources are fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 600);
  });

  // Fallback in case window load takes too long
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add('fade-out');
    }
  }, 2500);

  /* ==========================================
     2. HIGH-PRECISION CUSTOM CURSOR
     ========================================== */
  const cursor = document.getElementById('cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  // Physics factor (smooth trail follow)
  const cursorLerp = 0.25;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * cursorLerp;
    cursorY += (mouseY - cursorY) * cursorLerp;

    if (cursor) {
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hover States for Interactive Elements
  function updateCursorHoverListeners() {
    const hoverTargets = document.querySelectorAll('.hover-target');
    hoverTargets.forEach(target => {
      // Avoid duplicate event attachments
      target.removeEventListener('mouseenter', addHoverClass);
      target.removeEventListener('mouseleave', removeHoverClass);

      target.addEventListener('mouseenter', addHoverClass);
      target.addEventListener('mouseleave', removeHoverClass);
    });
  }

  function addHoverClass() {
    if (cursor) cursor.classList.add('hovering');
  }

  function removeHoverClass() {
    if (cursor) cursor.classList.remove('hovering');
  }

  updateCursorHoverListeners();

  // Hide cursor on window exit
  document.addEventListener('mouseleave', () => {
    if (cursor) cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursor) cursor.style.opacity = '1';
  });

  /* ==========================================
     3. HERO MOUSE PARALLAX
     ========================================== */
  const heroContent = document.getElementById('hero-content');
  const hero = document.getElementById('hero');

  if (hero && heroContent) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);

      const shiftX = (x / rect.width) * 35;
      const shiftY = (y / rect.height) * 25;

      heroContent.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });

    hero.addEventListener('mouseleave', () => {
      heroContent.style.transition = 'transform 1s var(--ease-elastic)';
      heroContent.style.transform = 'translate3d(0, 0, 0)';
    });

    hero.addEventListener('mouseenter', () => {
      heroContent.style.transition = 'none';
    });
  }

  /* ==========================================
     4. NAVBAR SCROLL STYLING
     ========================================== */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  /* ==========================================
     5. MOBILE NAVIGATION MENU DRAWER
     ========================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');

      const spans = menuToggle.querySelectorAll('span');
      if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  /* ==========================================
     6. 3D CARD TILT INTERACTION
     ========================================== */
  const cards = document.querySelectorAll('.property-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;

      const rect = card.getBoundingClientRect();
      const percentX = ((e.clientX - rect.left) / rect.width) - 0.5;
      const percentY = ((e.clientY - rect.top) / rect.height) - 0.5;

      const maxRotateX = 12;
      const maxRotateY = -12;

      const rotX = percentY * maxRotateX;
      const rotY = percentX * maxRotateY;

      card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;

      const glowColor = `rgba(184, 144, 71, ${Math.min(0.18, (Math.abs(percentX) + Math.abs(percentY)) * 0.3)})`;
      card.style.boxShadow = `0 25px 50px rgba(0,0,0,0.06), 0 0 30px ${glowColor}`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.8s var(--ease-elastic), box-shadow 0.8s var(--ease-elastic), border-color 0.8s var(--ease-elastic)';
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow = '';

      setTimeout(() => {
        card.style.transition = 'border-color var(--transition-medium), box-shadow var(--transition-medium)';
      }, 800);
    });
  });

  /* ==========================================
     7. PROPERTY CARD TOGGLE VIEW ENGINE
     ========================================== */
  cards.forEach(card => {
    const extBtn = card.querySelector('.exterior-btn');
    const intBtn = card.querySelector('.interior-btn');
    const badge = card.querySelector('.view-badge');

    if (extBtn && intBtn) {
      extBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('show-interior');
        extBtn.classList.add('active');
        intBtn.classList.remove('active');
        if (badge) badge.textContent = 'Exterior';
      });

      intBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.add('show-interior');
        intBtn.classList.add('active');
        extBtn.classList.remove('active');
        if (badge) badge.textContent = 'Interior';
      });
    }
  });

  /* ==========================================
     8. CATEGORY FILTER TAB ENGINE
     ========================================== */
  const filterTabs = document.querySelectorAll('.filter-tab');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const extBtn = card.querySelector('.exterior-btn');
        const intBtn = card.querySelector('.interior-btn');

        if (filterValue === 'all') {
          card.style.display = 'block';
          setTimeout(() => card.style.opacity = '1', 50);
        } else if (filterValue === 'exteriors') {
          card.style.display = 'block';
          if (extBtn) extBtn.click();
        } else if (filterValue === 'interiors') {
          card.style.display = 'block';
          if (intBtn) intBtn.click();
        }
      });
    });
  });

  /* ==========================================
     9. SCROLL-DRIVEN ENTRY REVEALS & PARALLAX
     ========================================== */
  const revealOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Scroll Parallax for About Image stack
  const aboutImgMain = document.getElementById('about-img-1');
  const aboutImgSub = document.getElementById('about-img-2');
  const aboutSection = document.getElementById('philosophy');

  if (aboutSection && aboutImgMain && aboutImgSub) {
    window.addEventListener('scroll', () => {
      const sectionRect = aboutSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (sectionRect.top < windowHeight && sectionRect.bottom > 0) {
        const scrolledPercentage = (windowHeight - sectionRect.top) / (windowHeight + sectionRect.height);

        const mainTranslate = (scrolledPercentage - 0.5) * 50;
        const subTranslate = (scrolledPercentage - 0.5) * -110;

        aboutImgMain.style.transform = `translate3d(0, ${mainTranslate}px, 0)`;
        aboutImgSub.style.transform = `translate3d(0, ${subTranslate}px, 0)`;
      }
    });
  }


  /* ==========================================
     10. VISITOR TRACKER & LOCAL STORAGE CONFIG
     ========================================== */
  function trackVisitorMetrics() {
    // Unique Session Check
    if (!sessionStorage.getItem('aethera_session_visited')) {
      sessionStorage.setItem('aethera_session_visited', 'true');

      // Update Persistent localStorage Traffic Counter
      let currentVisitors = parseInt(localStorage.getItem('aethera_visitors') || '0');
      currentVisitors += 1;
      localStorage.setItem('aethera_visitors', currentVisitors.toString());
    }
  }

  // Pre-seed mock inquiries if localStorage database is empty
  function preSeedMockData() {
    const inquiriesKey = 'aethera_inquiries';
    if (!localStorage.getItem(inquiriesKey)) {
      const demoInquiries = [
        {
          id: '1716942000000',
          name: 'Lady Seraphina Rothschild',
          email: 'seraphina@rothschild.ch',
          residence: 'The Luminary Crest',
          message: 'Requesting a private reservation block for August. We require direct helicopter landing authorization codes for our transfer from LAX. Please coordinate with our estate directors.',
          timestamp: '2026-05-28, 14:32:00'
        },
        {
          id: '1716945600000',
          name: 'Alexander Sterling',
          email: 'sterling@luxuryholdings.com',
          residence: 'The Obsidian Pavilion',
          message: 'My design team is reviewing Julian Aether\'s basalt structural layouts. We wish to negotiate terms for custom expansion parameters on the cliffside foundation layout.',
          timestamp: '2026-05-29, 09:15:10'
        }
      ];
      localStorage.setItem(inquiriesKey, JSON.stringify(demoInquiries));
    }

    // Seed initial visitors if 0
    if (!localStorage.getItem('aethera_visitors') || localStorage.getItem('aethera_visitors') === '0') {
      localStorage.setItem('aethera_visitors', '147'); // Premium starting metric
    }
  }

  trackVisitorMetrics();
  preSeedMockData();


  /* ==========================================
     11. TOAST NOTIFICATION ALERTS
     ========================================== */
  const toastContainer = document.getElementById('toast-container');

  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Smooth remove
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4000);
  }


  /* ==========================================
     12. FORM CAPTURE & INQUIRY SYSTEM
     ========================================== */
  const contactForm = document.getElementById('landing-contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('form-name').value;
      const emailVal = document.getElementById('form-email').value;
      const resVal = document.getElementById('form-residence').value;
      const msgVal = document.getElementById('form-message').value;

      const newInquiry = {
        id: Date.now().toString(),
        name: nameVal,
        email: emailVal,
        residence: resVal,
        message: msgVal,
        timestamp: new Date().toLocaleString()
      };

      // Save to localStorage
      const inquiriesKey = 'aethera_inquiries';
      let currentInquiries = JSON.parse(localStorage.getItem(inquiriesKey) || '[]');
      currentInquiries.unshift(newInquiry); // Insert at beginning of array
      localStorage.setItem(inquiriesKey, JSON.stringify(currentInquiries));

      // Reset form controls
      contactForm.reset();

      // Success Alert
      showToast('Concierge: Inquiry logged. A private representative will establish contact.');
    });
  }


  /* ==========================================
     13. SPA ROUTER: DETECT /#admin & /#/admin
     ========================================== */
  const landingPage = document.getElementById('landing-page');
  const adminPage = document.getElementById('admin-page');

  function resolveSPARouting() {
    const hash = window.location.hash;

    if (hash === '#admin' || hash === '#/admin') {
      if (landingPage) landingPage.style.display = 'none';
      if (adminPage) adminPage.style.display = 'block';

      // Smooth fade-in style
      adminPage.style.opacity = '0';
      setTimeout(() => {
        adminPage.style.opacity = '1';
      }, 50);

      renderAdminDashboard();
    } else {
      if (landingPage) landingPage.style.display = 'block';
      if (adminPage) adminPage.style.display = 'none';

      if (landingPage) {
        landingPage.style.opacity = '0';
        setTimeout(() => {
          landingPage.style.opacity = '1';
        }, 50);
      }
    }

    // Ensure hovering cursors update for dynamic new elements
    setTimeout(updateCursorHoverListeners, 100);
  }

  window.addEventListener('hashchange', resolveSPARouting);
  window.addEventListener('load', resolveSPARouting);

  // Also run router check immediately on execution
  resolveSPARouting();


  /* ==========================================
     14. ADMIN DASHBOARD VIEW CONTROLLER
     ========================================== */
  function renderAdminDashboard() {
    const statVisitors = document.getElementById('stats-visitors');
    const statInquiries = document.getElementById('stats-inquiries');
    const statPipeline = document.getElementById('stats-pipeline');
    const inquiryList = document.getElementById('admin-inquiry-list');

    const inquiriesKey = 'aethera_inquiries';
    const inquiries = JSON.parse(localStorage.getItem(inquiriesKey) || '[]');
    const totalVisitors = localStorage.getItem('aethera_visitors') || '147';

    // Update Stats counters
    if (statVisitors) statVisitors.textContent = totalVisitors;
    if (statInquiries) statInquiries.textContent = inquiries.length.toString();

    // Calculate Deal Pipeline sum
    let pipelineTotal = 0; // in Millions
    inquiries.forEach(inq => {
      if (inq.residence.includes('Obsidian')) pipelineTotal += 12.45;
      else if (inq.residence.includes('Aetheria')) pipelineTotal += 16.80;
      else if (inq.residence.includes('Luminary')) pipelineTotal += 24.00;
      else pipelineTotal += 5.00; // Average default deal size
    });

    if (statPipeline) {
      statPipeline.innerHTML = `<span>$</span>${pipelineTotal.toFixed(2)}M`;
    }

    // Render Message matrix
    if (!inquiryList) return;
    inquiryList.innerHTML = '';

    if (inquiries.length === 0) {
      inquiryList.innerHTML = '<div class="admin-empty-state">No inquiries received yet. Submit the contact form on the homepage to see live analytics!</div>';
      return;
    }

    inquiries.forEach(inq => {
      const card = document.createElement('div');
      card.className = 'inquiry-message-card hover-target';
      card.setAttribute('data-id', inq.id);

      card.innerHTML = `
        <div class="inquiry-sender-meta">
          <div class="sender-name">${inq.name}</div>
          <a href="mailto:${inq.email}" class="sender-email hover-target">${inq.email}</a>
          <div class="sender-timestamp">${inq.timestamp}</div>
        </div>
        <div class="inquiry-message-content">
          <div class="interest-residence-badge">${inq.residence}</div>
          <p class="inquiry-body-text">"${inq.message}"</p>
        </div>
        <div class="inquiry-actions">
          <button class="inquiry-btn inquiry-btn-respond hover-target" data-email="${inq.email}" data-name="${inq.name}">Respond</button>
          <button class="inquiry-btn inquiry-btn-delete hover-target" data-id="${inq.id}">Delete</button>
        </div>
      `;

      inquiryList.appendChild(card);
    });

    // Wire up Admin Actions click events
    wireAdminActionButtons();
  }

  function wireAdminActionButtons() {
    // Delete Button Logic
    document.querySelectorAll('.inquiry-btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToDelete = btn.getAttribute('data-id');
        const inquiriesKey = 'aethera_inquiries';
        let inquiries = JSON.parse(localStorage.getItem(inquiriesKey) || '[]');

        inquiries = inquiries.filter(item => item.id !== idToDelete);
        localStorage.setItem(inquiriesKey, JSON.stringify(inquiries));

        // Success feedback & re-render
        showToast('System: Inquiry record purged from local databases.');
        renderAdminDashboard();
      });
    });

    // Respond Email Modal trigger
    const modalOverlay = document.getElementById('response-modal-overlay');
    const modalRecipient = document.getElementById('modal-recipient');
    const modalSenderEmail = document.getElementById('modal-sender-email');
    const modalSubject = document.getElementById('modal-subject');
    const modalBody = document.getElementById('modal-body');

    document.querySelectorAll('.inquiry-btn-respond').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const name = btn.getAttribute('data-name');

        if (modalOverlay && modalRecipient && modalSenderEmail) {
          modalRecipient.value = `${name} <${email}>`;
          modalSenderEmail.value = email;

          // Custom beautiful subject template
          if (modalSubject) {
            modalSubject.value = 'AETHERA ACQUISITION: Private Commission Inquiry';
          }
          if (modalBody) {
            modalBody.value = `Dear ${name.split(' ')[0]},\n\nJulian Aether and the Aethera Concierge Team have received your requirements regarding our portfolio. We would be pleased to arrange an exclusive private flight transfer and tour.\n\nBest regards,\nAethera Acquisitions`;
          }

          modalOverlay.classList.add('active');
        }
      });
    });

    // Make sure dynamically created cursor-hovers register!
    updateCursorHoverListeners();
  }


  /* ==========================================
     15. RESPONSE EMAIL MODAL FORM ENGINE
     ========================================== */
  const modalOverlay = document.getElementById('response-modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const responseForm = document.getElementById('response-email-form');

  function hideModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      responseForm.reset();
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideModal();
    });
  }

  if (responseForm) {
    responseForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const recipientEmail = document.getElementById('modal-sender-email').value;

      // Success Response feedback
      hideModal();
      showToast(`Concierge: Response successfully dispatched to ${recipientEmail}`);
    });
  }

});
