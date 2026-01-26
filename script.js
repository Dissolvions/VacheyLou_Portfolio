document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SÉLECTION DES ÉLÉMENTS ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const sidebar = document.getElementById('sidebar');
    const burgerBtn = document.getElementById('burger-btn');
    const themeBtnPC = document.getElementById('theme-toggle-pc');
    const themeBtnMobile = document.getElementById('theme-toggle-mobile');
    const sidebarDrawing = document.getElementById('sidebar-drawing'); 
    const transitionImages = document.querySelectorAll('.trans-img');
    const mobileLogo = document.querySelector('.mobile-logo-box img');
    
    // Éléments pour le Curseur
    const cursor = document.getElementById('custom-cursor');
    const interactiveElements = document.querySelectorAll('.interactive-link, a, button, input, textarea, .gallery-img, .video-expand-btn, .lb-close, .lb-prev, .lb-next, iframe');

    // --- 2. ASSETS (Images du site uniquement, le curseur est géré en CSS) ---
    const assets = {
        light: {
            drawDef: 'assets/portfolio/acceuillight1.PNG', 
            drawHov: 'assets/portfolio/acceuillight2.PNG',
            trans: 'assets/portfolio/transitionlight.PNG'
        },
        dark: {
            drawDef: 'assets/portfolio/acceuildark1.PNG',
            drawHov: 'assets/portfolio/acceuildark2.PNG',
            trans: 'assets/portfolio/transitiondark.PNG'
        }
    };

    // --- 3. CURSEUR (NOUVELLE VERSION CORRIGÉE) ---
    if (cursor) {
        // A. Mouvement : suit la souris
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // B. Interactions (changement d'état au survol)
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                // Gestion spéciale pour les iframes (Youtube)
                if (el.tagName === 'IFRAME') {
                    cursor.style.opacity = "0"; // On cache le curseur perso pour laisser celui de Youtube
                } else {
                    cursor.classList.add("hovered"); // Passe en mode "clic" via CSS
                    updateDrawingState(true); // Change le dessin de la sidebar
                }
            });

            el.addEventListener('mouseleave', () => {
                if (el.tagName === 'IFRAME') {
                    cursor.style.opacity = "1"; // On réaffiche le curseur perso
                } else {
                    cursor.classList.remove("hovered"); // Retour en mode normal
                    updateDrawingState(false); // Remet le dessin normal
                }
            });
        });
    }

    // --- 4. FONCTIONS THEME ---
    function updateDrawingState(isHovering) {
        if(!sidebarDrawing) return;
        const isDark = document.body.classList.contains('dark-mode');
        const theme = isDark ? 'dark' : 'light';
        sidebarDrawing.src = isHovering ? assets[theme].drawHov : assets[theme].drawDef;
    }

    function updateAssets(isDark) {
        const theme = isDark ? 'dark' : 'light';
        if(sidebarDrawing) sidebarDrawing.src = assets[theme].drawDef;
        if(mobileLogo) mobileLogo.src = assets[theme].drawDef;
        transitionImages.forEach(img => { img.src = assets[theme].trans; });

        const iconName = isDark ? 'ph:sun-bold' : 'ph:moon-stars-bold';
        if(themeBtnPC) themeBtnPC.querySelector('.iconify').setAttribute('data-icon', iconName);
        if(themeBtnMobile) themeBtnMobile.querySelector('.iconify').setAttribute('data-icon', iconName);
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateAssets(isDark);
    }

    // Vérification du thème au chargement
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        updateAssets(true);
    } else {
        updateAssets(false);
    }

    if(themeBtnPC) themeBtnPC.addEventListener('click', toggleTheme);
    if(themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

    // --- 5. NAVIGATION ---
    if(burgerBtn && sidebar) {
        burgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    function showSection(id) {
        sections.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
        }
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${id}"]`);
        if (activeLink) activeLink.classList.add('active');
        if(sidebar) sidebar.classList.remove('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    if(sidebarDrawing) {
        sidebarDrawing.addEventListener('click', () => showSection('accueil'));
    }

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById("myBar");
        if(progressBar) progressBar.style.height = scrolled + "%";
    });

    // --- 6. MODALE MENTIONS LÉGALES ---
    const legalModal = document.getElementById("legal-modal");
    const legalLinks = document.querySelectorAll(".legal-link"); 
    const closeLegal = document.querySelector(".close-modal");

    if(legalModal) {
        legalLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                legalModal.style.display = "block";
            });
        });
        if(closeLegal) {
            closeLegal.addEventListener("click", () => {
                legalModal.style.display = "none";
            });
        }
        window.addEventListener("click", (e) => {
            if (e.target == legalModal) legalModal.style.display = "none";
        });
    }

    // --- 7. LIGHTBOX MIXTE (IMAGES + VIDÉOS) ---
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbVideoContainer = document.getElementById('lightbox-video-container');
    const lbVideo = document.getElementById('lightbox-video');
    const lbClose = document.getElementById('lightbox-close');
    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');
    
    let currentProjectItems = [];
    let currentIndex = 0;

    // A. Injection du bouton "Zoom" sur les vidéos
    document.querySelectorAll('.video-placeholder').forEach(placeholder => {
        const btn = document.createElement('div');
        btn.className = 'video-expand-btn';
        btn.innerHTML = '<span class="iconify" data-icon="mdi:arrow-expand-all" style="font-size: 20px;"></span>';
        placeholder.appendChild(btn);
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const iframe = placeholder.querySelector('iframe');
            openLightbox(iframe);
        });
    });

    // B. Fonction d'ouverture
    function openLightbox(element) {
        // Trouver le conteneur parent (article)
        const projectContainer = element.closest('.project-item');
        
        if (projectContainer) {
            // Récupérer TOUS les items média (Images ET Vidéos)
            const images = Array.from(projectContainer.querySelectorAll('.gallery-img'));
            const iframes = Array.from(projectContainer.querySelectorAll('.video-placeholder iframe'));
            
            // On doit les trier par ordre d'apparition dans le DOM
            currentProjectItems = [...images, ...iframes].sort((a, b) => {
                return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
            });
        } else {
            currentProjectItems = [element];
        }

        currentIndex = currentProjectItems.indexOf(element);
        updateLightboxContent();
        
        if(lightbox) {
            lightbox.style.display = "flex"; // Flex pour centrer
            document.body.style.overflow = "hidden"; // Bloque le scroll
        }
    }

    // C. Mise à jour du contenu (Image ou Vidéo)
    function updateLightboxContent() {
        if (!currentProjectItems[currentIndex]) return;
        
        const item = currentProjectItems[currentIndex];
        
        if (item.tagName === 'IMG') {
            // C'est une image
            lbVideoContainer.style.display = "none";
            lbImg.style.display = "block";
            lbImg.src = item.src;
            lbVideo.src = ""; // Stop video
        } else if (item.tagName === 'IFRAME') {
            // C'est une vidéo
            lbImg.style.display = "none";
            lbVideoContainer.style.display = "block";
            lbVideo.src = item.src; // Copie l'URL de la vidéo
        }
    }

    // Écouteurs sur les images
    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', () => openLightbox(img));
    });

    // Navigation Lightbox
    if(lbClose) lbClose.addEventListener('click', closeLightbox);
    
    function closeLightbox() {
        lightbox.style.display = "none";
        document.body.style.overflow = "auto";
        lbVideo.src = ""; // Stop le son de la vidéo
    }

    if(lbPrev) {
        lbPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + currentProjectItems.length) % currentProjectItems.length;
            updateLightboxContent();
        });
    }

    if(lbNext) {
        lbNext.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % currentProjectItems.length;
            updateLightboxContent();
        });
    }

    if(lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    // Clavier (Echap, Gauche, Droite)
    document.addEventListener('keydown', (e) => {
        if(lightbox.style.display === "flex") {
            if(e.key === "Escape") closeLightbox();
            if(e.key === "ArrowLeft") lbPrev.click();
            if(e.key === "ArrowRight") lbNext.click();
        }
    });
});