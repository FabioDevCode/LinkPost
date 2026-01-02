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
    const TARGET_SELECTOR = '.feed-left-nav-common-module__widgets';
    const LINK_ID = 'linkpost-scheduled-posts-link';
    const LINK_TEXT = 'Posts programmés';
    const LINK_URL = 'https://www.linkedin.com/feed/?shareActive=true&view=management';

    // Configuration - Création de posts
    const CREATE_POST_ID = 'linkpost-create-post-link';
    const CREATE_POST_TEXT = 'Créer un post';
    const CREATE_POST_URL = 'https://www.linkedin.com/feed/?shareActive';

    // Configuration - Masquer pub Premium
    const PREMIUM_LINK_SELECTOR = 'a[href*="/premium/products"]';
    const HIDDEN_CLASS = 'linkpost-hidden';

    // Configuration - Masquer les jeux
    const GAMES_SELECTOR = '[aria-labelledby="todays-games-entrypoint-title"]';

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
     * Crée et retourne l'élément <li> pour "Posts programmés".
     */
    function createScheduledPostsItem() {
        const li = document.createElement('li');
        li.className = 'list-style-none mt4';
        li.id = LINK_ID;

        li.innerHTML = `
            <a href="${LINK_URL}" class="ember-view feed-left-nav-common-module__link">
                <p class="t-12 t-black t-bold v-align-middle display-flex" style="padding-left: 2px;">
                    <svg role="none" aria-hidden="true" class="artdeco-button__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${LINK_TEXT}</span>
                </p>
            </a>
        `;

        return li;
    }

    /**
     * Crée et retourne l'élément <li> pour "Créer un post".
     */
    function createCreatePostItem() {
        const li = document.createElement('li');
        li.className = 'list-style-none mt4';
        li.id = CREATE_POST_ID;

        li.innerHTML = `
            <a href="${CREATE_POST_URL}" class="ember-view feed-left-nav-common-module__link">
                <p class="t-12 t-black t-bold v-align-middle display-flex" style="padding-left: 2px;">
                    <svg role="none" aria-hidden="true" class="artdeco-button__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin-right: 8px;" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                    </svg>
                    <span>${CREATE_POST_TEXT}</span>
                </p>
            </a>
        `;

        return li;
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

            // Utiliser une méthode plus robuste pour trouver le conteneur
            // On cherche n'importe quel élément qui ressemble à la liste de widgets
            const targetUl = document.querySelector(TARGET_SELECTOR);

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

            const targetUl = document.querySelector(TARGET_SELECTOR);
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

    /**
     * Masque ou affiche les DIVs contenant des liens Premium.
     */
    function updatePremiumAdsVisibility() {
        try {
            const premiumLinks = document.querySelectorAll(PREMIUM_LINK_SELECTOR);

            premiumLinks.forEach(link => {
                const parentDiv = link.closest('div');
                if (parentDiv) {
                    if (isHidePremiumAdsEnabled) {
                        parentDiv.classList.add(HIDDEN_CLASS);
                    } else {
                        parentDiv.classList.remove(HIDDEN_CLASS);
                    }
                }
            });
        } catch (e) {
            console.error('LinkPost: Error updating PremiumAds', e);
        }
    }

    /**
     * Masque ou affiche la section des jeux.
     */
    function updateGamesVisibility() {
        try {
            const gamesElements = document.querySelectorAll(GAMES_SELECTOR);

            gamesElements.forEach(element => {
                const parentDiv = element.parentElement;
                if (parentDiv) {
                    if (isHideGamesEnabled) {
                        parentDiv.classList.add(HIDDEN_CLASS);
                    } else {
                        parentDiv.classList.remove(HIDDEN_CLASS);
                    }
                }
            });
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




