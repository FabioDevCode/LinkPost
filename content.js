/**
 * LinkPost Extension - Content Script
 *
 * Ce script observe les changements dans le DOM pour injecter des liens
 * dans le menu de navigation gauche du feed LinkedIn.
 * Il écoute les changements de storage pour afficher/masquer les liens dynamiquement.
 * Il peut également masquer les publicités Premium LinkedIn.
*/

(function () {
    'use strict';

    console.log('LinkPost: Script loaded');

    // Configuration - Posts programmés
    const LINK_ID = 'linkpost-scheduled-posts-link';
    const LINK_TEXT = 'Posts programmés';
    const LINK_URL = 'https://www.linkedin.com/feed/?shareActive=true&view=management';

    // Configuration - Création de posts
    const CREATE_POST_ID = 'linkpost-create-post-link';
    const CREATE_POST_TEXT = 'Créer un post';
    const CREATE_POST_URL = 'https://www.linkedin.com/feed/?shareActive=true';

    // Configuration - Masquer pub Premium
    const PREMIUM_LINK_SELECTOR = 'a[href*="/premium/"]';
    const HIDDEN_CLASS = 'linkpost-hidden';

    // Configuration - Masquer les jeux
    const GAMES_SELECTOR = 'a[href*="/games/"]';

    // État local
    let isScheduledPostsEnabled = true;
    let isHidePremiumAdsEnabled = false;
    let isCreatePostEnabled = false;
    let isHideGamesEnabled = false;

    // Injecter le style CSS pour masquer les éléments
    function injectHiddenStyle() {
        try {
            if (document.getElementById('linkpost-style')) return;
            const style = document.createElement('style');
            style.id = 'linkpost-style';
            style.textContent = `.${HIDDEN_CLASS} { display: none !important; visibility: hidden !important; }`;
            document.head.appendChild(style);
        } catch (e) {
            console.error('LinkPost: Error injecting style', e);
        }
    }

    /**
     * Trouve le conteneur DIV parent des liens de navigation.
     * Cherche un lien avec l'URL des événements (ou groupes) qui est plus stable
     * que les classes obfusquées ou les attributs de vue (data-view-name).
     */
    function findNavContainer() {
        // Chercher le lien "Événements" via son href
        let navLink = document.querySelector('a[href*="linkedin.com/events/"]');
        
        // Plan B : Essayer avec "Groupes" ou l'URL relative
        if (!navLink) {
            navLink = document.querySelector('a[href^="/events/"]') || document.querySelector('a[href*="/groups/"]');
        }

        if (!navLink) return null;

        // Le lien <a> est généralement directement dans une <div> parent qui contient tous les liens
        const parentDiv = navLink.parentElement;
        if (parentDiv && parentDiv.tagName === 'DIV') {
            return parentDiv;
        }

        return null;
    }

    /**
     * Crée et retourne l'élément <a> pour "Posts programmés".
     */
    function createScheduledPostsItem() {
        const link = document.createElement('a');
        link.href = LINK_URL;
        link.id = LINK_ID;
        link.setAttribute('tabindex', '0');
        link.setAttribute('class', "_5c38935e c8688ca6 c4a80bc9 _4b6e327d _20ff3d72 _54b5eab8 f01356cf a870f353 _192b9ca2 _2e1b23f2 _2663c39a _45b859fd fd2651f1")

        link.innerHTML = `
            <div style="display: flex; align-items: center; padding: 8px 16px; height: 40px; color: #3D3D3D; font-size: 14px !important; font-weight: 600;">
                <svg role="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" style="margin-right: 8px; margin-left: 0px;">
                    <path fill="#3D3D3D" d="M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/>
                </svg>

                <p class="_7040b4e5 _80ee3fa5 efc776bd _8094c057 _257153ee _11daf7fc _7f504a6b _8b957603 bf376958">${LINK_TEXT}</p>
            </div>
        `;

        return link;
    }

    /**
     * Crée et retourne l'élément <a> pour "Créer un post".
     */
    function createCreatePostItem() {
        const link = document.createElement('a');
        link.href = CREATE_POST_URL;
        link.id = CREATE_POST_ID;
        link.setAttribute('tabindex', '0');
        link.setAttribute('class', "_6ee5d24a _188dd678 _73d748cb c3772e31 _9b83bc80 _3b033628 d74054cf _70b0b4ae _21fc90f6 c06f7ac1 ce8728d9")

        link.innerHTML = `
            <div style="display: flex; align-items: center; padding: 8px 16px; height: 40px; color: #3D3D3D; font-size: 14px !important; font-weight: 600;">
                <svg role="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="26" height="26" style="margin-right: 6px; margin-left: 0px;">
                    <path fill="#3D3D3D" d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM296 408L296 344L232 344C218.7 344 208 333.3 208 320C208 306.7 218.7 296 232 296L296 296L296 232C296 218.7 306.7 208 320 208C333.3 208 344 218.7 344 232L344 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L344 344L344 408C344 421.3 333.3 432 320 432C306.7 432 296 421.3 296 408z"/>
                </svg>

                <p class="_7040b4e5 _80ee3fa5 efc776bd _8094c057 _257153ee _11daf7fc _7f504a6b _8b957603 bf376958">${CREATE_POST_TEXT}</p>
            </div>
        `;

        return link;
    }

    /**
     * Supprime le lien "Posts programmés" s'il existe.
     */
    function removeScheduledPostsLink() {
        const existingLink = document.getElementById(LINK_ID);
        if (existingLink) {
            existingLink.remove();
        }
    }

    /**
     * Supprime le lien "Créer un post" s'il existe.
     */
    function removeCreatePostLink() {
        const existingLink = document.getElementById(CREATE_POST_ID);
        if (existingLink) {
            existingLink.remove();
        }
    }

    /**
     * Tente d'injecter le lien "Posts programmés".
     */
    function tryInjectScheduledPostsLink() {
        try {
            if (!isScheduledPostsEnabled) return;

            // Trouver le conteneur UL via les liens existants avec l'attribut data-view-name
            const targetUl = findNavContainer();

            if (!targetUl) {
                // Debug log silencieux pour ne pas spammer si l'élément n'est pas encore là
                return;
            }

            if (document.getElementById(LINK_ID)) return;

            const navItem = createScheduledPostsItem();
            targetUl.appendChild(navItem);
        } catch (e) {
            console.error('LinkPost: Error injecting ScheduledPostsLink', e);
        }
    }

    /**
     * Tente d'injecter le lien "Créer un post".
     */
    function tryInjectCreatePostLink() {
        try {
            if (!isCreatePostEnabled) return;

            // Trouver le conteneur UL via les liens existants avec l'attribut data-view-name
            const targetUl = findNavContainer();
            if (!targetUl || document.getElementById(CREATE_POST_ID)) return;

            const navItem = createCreatePostItem();
            targetUl.appendChild(navItem);
        } catch (e) {
            console.error('LinkPost: Error injecting CreatePostLink', e);
        }
    }

    /**
     * Met à jour l'affichage du lien "Posts programmés".
     */
    function updateScheduledPostsVisibility() {
        if (isScheduledPostsEnabled) {
            tryInjectScheduledPostsLink();
        } else {
            removeScheduledPostsLink();
        }
    }

    /**
     * Met à jour l'affichage du lien "Créer un post".
     */
    function updateCreatePostVisibility() {
        if (isCreatePostEnabled) {
            tryInjectCreatePostLink();
        } else {
            removeCreatePostLink();
        }
    }

    function getPremiumContainer(link) {
        // Cas 1 — navbar : div avec min-width inline
        let el = link;
        while (el && el !== document.body) {
            el = el.parentElement;
            if (el?.tagName === 'DIV' && el.style?.minWidth) {
                return el;
            }
        }
    
        // Cas 2 — aside : remonter jusqu'au bon niveau
        // On cherche la div dont le grand-parent est l'aside
        el = link;
        while (el && el !== document.body) {
            el = el.parentElement;
            if (
                el?.tagName === 'DIV' &&
                el.parentElement?.tagName === 'DIV' &&
                el.parentElement?.parentElement?.tagName === 'DIV' &&
                el.parentElement?.parentElement?.parentElement?.tagName === 'DIV' &&
                el.parentElement?.parentElement?.parentElement?.parentElement?.tagName === 'ASIDE'
            ) {
                return el;
            }
        }
    
        return link.closest('div'); // fallback
    }
    
    /**
     * Masque ou affiche les DIVs contenant des liens Premium.
     */
    function updatePremiumAdsVisibility() {
        try {
            document.querySelectorAll(PREMIUM_LINK_SELECTOR).forEach(link => {
                const container = getPremiumContainer(link);
                if (container) {
                    container.style.display = isHidePremiumAdsEnabled ? 'none' : '';
                }
            });
        } catch (e) {
            console.error('LinkPost: Error updating PremiumAds', e);
        }
    }

    function getGamesContainer(link) {
        let el = link;
        while (el && el !== document.body) {
            el = el.parentElement;
            // On remonte jusqu'à la div dont le parent direct est aside > div > div
            if (
                el?.tagName === 'DIV' &&
                el.parentElement?.tagName === 'DIV' &&
                el.parentElement?.parentElement?.tagName === 'DIV' &&
                el.parentElement?.parentElement?.parentElement?.tagName === 'ASIDE'
            ) {
                return el;
            }
        }
        return null;
    }

    /**
     * Masque ou affiche les liens vers les jeux et les éléments associés.
     */
    function updateGamesVisibility() {
        try {
            // On prend seulement le PREMIER lien /games/ trouvé
            // pour cibler le bloc entier une seule fois
            const firstGameLink = document.querySelector(GAMES_SELECTOR);
            if (!firstGameLink) return;
    
            const container = getGamesContainer(firstGameLink);
            if (container) {
                container.style.display = isHideGamesEnabled ? 'none' : '';
            }
        } catch (e) {
            console.error('LinkPost: Error updating Games visibility', e);
        }
    }

    /**
     * Initialise l'observateur de mutations pour gérer le chargement dynamique (SPA).
     */
    function initObserver() {
        console.log('LinkPost: Initializing Observer');
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldCheck = true;
                    break;
                }
            }

            if (shouldCheck) {
                tryInjectScheduledPostsLink();
                tryInjectCreatePostLink();
                if (isHidePremiumAdsEnabled) {
                    updatePremiumAdsVisibility();
                }
                if (isHideGamesEnabled) {
                    updateGamesVisibility();
                }
            }
        });

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            console.error('LinkPost: document.body not available for observer');
        }

        // Essayer une première fois
        tryInjectScheduledPostsLink();
        tryInjectCreatePostLink();
        updatePremiumAdsVisibility();
        updateGamesVisibility();
    }

    /**
     * Initialise l'écoute des changements de storage.
     */
    function initStorageListener() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync') {
                if (changes.scheduledPostsEnabled) {
                    isScheduledPostsEnabled = changes.scheduledPostsEnabled.newValue;
                    updateScheduledPostsVisibility();
                }
                if (changes.hidePremiumAdsEnabled) {
                    isHidePremiumAdsEnabled = changes.hidePremiumAdsEnabled.newValue;
                    updatePremiumAdsVisibility();
                }
                if (changes.pinShareBoxEnabled) {
                    isCreatePostEnabled = changes.pinShareBoxEnabled.newValue;
                    updateCreatePostVisibility();
                }
                if (changes.hideGamesEnabled) {
                    isHideGamesEnabled = changes.hideGamesEnabled.newValue;
                    updateGamesVisibility();
                }
            }
        });
    }

    /**
     * Démarrage principal.
     */
    function init() {
        try {
            injectHiddenStyle();

            if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
                console.warn('LinkPost: chrome.storage non disponible, mode par défaut activé.');
                isScheduledPostsEnabled = true;
                isHidePremiumAdsEnabled = false;
                isCreatePostEnabled = false;
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initObserver);
                } else {
                    initObserver();
                }
                return;
            }

            chrome.storage.sync.get({
                scheduledPostsEnabled: true,
                hidePremiumAdsEnabled: false,
                pinShareBoxEnabled: false,
                hideGamesEnabled: false
            }, (result) => {
                console.log('LinkPost: Config loaded', result);
                isScheduledPostsEnabled = result.scheduledPostsEnabled;
                isHidePremiumAdsEnabled = result.hidePremiumAdsEnabled;
                isCreatePostEnabled = result.pinShareBoxEnabled;
                isHideGamesEnabled = result.hideGamesEnabled;

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initObserver);
                } else {
                    initObserver();
                }

                initStorageListener();
            });
        } catch (e) {
            console.error('LinkPost: Critical error in init', e);
        }
    }

    init();
})();




