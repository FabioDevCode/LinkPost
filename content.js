/**
 * LinkPost Extension - Content Script
 *
 * Ce script observe les changements dans le DOM pour injecter un lien "Posts programmés"
 * dans le menu de navigation gauche du feed LinkedIn.
 */

(function () {
    'use strict';

    // Configuration
    const TARGET_SELECTOR = '.feed-left-nav-common-module__widgets';
    const LINK_ID = 'linkpost-scheduled-posts-link';
    const LINK_TEXT = 'Posts programmés';
    const LINK_URL = 'https://www.linkedin.com/feed/?shareActive=true&view=management';

    /**
     * Crée et retourne l'élément <li> à injecter.
     * Utilise les classes LinkedIn pour s'intégrer naturellement.
     */
    function createNavItem() {
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
     * Tente d'injecter le lien si les conditions sont réunies.
     */
    function tryInjectLink() {
        // 1. Chercher le ul de navigation
        const targetUl = document.querySelector(TARGET_SELECTOR);

        // 2. Si le ul n'existe pas, ou si le lien existe déjà, on ne fait rien
        if (!targetUl || document.getElementById(LINK_ID)) {
            return;
        }

        // 3. Créer et ajouter le li à la fin du ul
        const navItem = createNavItem();
        targetUl.appendChild(navItem);
    }

    /**
     * Initialise l'observateur de mutations pour gérer le chargement dynamique (SPA).
     */
    function initObserver() {
        // Observer le corps du document pour détecter l'apparition de la carte de profil
        const observer = new MutationObserver((mutations) => {
            // Optimisation : on ne vérifie que si des noeuds ont été ajoutés
            let shouldCheck = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldCheck = true;
                    break;
                }
            }

            if (shouldCheck) {
                tryInjectLink();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Essayer une première fois au cas où le DOM est déjà prêt
        tryInjectLink();
    }

    // Démarrage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initObserver);
    } else {
        initObserver();
    }

})();
