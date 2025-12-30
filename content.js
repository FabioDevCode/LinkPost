/**
 * LinkPost Extension - Content Script
 * 
 * Ce script observe les changements dans le DOM pour injecter un lien "Posts programmés"
 * dans la carte de profil de l'utilisateur sur le feed LinkedIn.
 */

(function () {
    'use strict';

    // Configuration
    const TARGET_SELECTOR = '.profile-card-member-details';
    const LINK_ID = 'linkpost-scheduled-posts-link';
    const LINK_TEXT = 'Posts programmés';
    const LINK_URL = 'https://www.linkedin.com/feed/?shareActive=true&view=management';

    /**
     * Crée et retourne l'élément lien à injecter.
     * Utilise les styles par défaut de LinkedIn pour les liens dans ce contexte.
     */
    function createLink() {
        const link = document.createElement('a');
        link.id = LINK_ID;
        link.href = LINK_URL;
        link.textContent = LINK_TEXT;
        link.target = '_self'; // S'ouvre dans le même onglet comme demandé

        // Styles pour s'intégrer proprement (au cas où le CSS parent ne suffirait pas)
        // On essaye de rester minimaliste pour hériter du style parent
        link.style.display = 'block';
        link.style.marginTop = '4px';
        link.style.fontSize = '12px';
        link.style.fontWeight = '600';
        link.style.textDecoration = 'none';
        link.style.color = '#0a66c2'; // Couleur standard bleu LinkedIn

        // Hover effect simple
        link.onmouseover = () => link.style.textDecoration = 'underline';
        link.onmouseout = () => link.style.textDecoration = 'none';

        return link;
    }

    /**
     * Tente d'injecter le lien si les conditions sont réunies.
     */
    function tryInjectLink() {
        // 1. Chercher la carte de profil
        const targetDiv = document.querySelector(TARGET_SELECTOR);

        // 2. Si la div n'existe pas, ou si le lien existe déjà, on ne fait rien
        if (!targetDiv || document.getElementById(LINK_ID)) {
            return;
        }

        // 3. Créer et ajouter le lien
        const link = createLink();
        targetDiv.appendChild(link);
        // console.log('LinkPost: Lien injecté avec succès.');
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
