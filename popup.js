/**
 * LinkPost Extension - Popup Script
 * Gère les paramètres utilisateur avec chrome.storage.sync
 */
document.addEventListener('DOMContentLoaded', () => {
    const scheduledPostsToggle = document.getElementById('scheduledPosts');
    const hidePremiumAdsToggle = document.getElementById('hidePremiumAds');
    const pinShareBoxToggle = document.getElementById('pinShareBox');
    const hideGamesToggle = document.getElementById('hideGames');

    // Charger l'état actuel depuis le storage
    chrome.storage.sync.get({
        scheduledPostsEnabled: true,
        hidePremiumAdsEnabled: false,
        pinShareBoxEnabled: false,
        hideGamesEnabled: false
    }, (result) => {
        scheduledPostsToggle.checked = result.scheduledPostsEnabled;
        hidePremiumAdsToggle.checked = result.hidePremiumAdsEnabled;
        pinShareBoxToggle.checked = result.pinShareBoxEnabled;
        hideGamesToggle.checked = result.hideGamesEnabled;
    });

    // Sauvegarder lors du changement - Posts programmés
    scheduledPostsToggle.addEventListener('change', () => {
        chrome.storage.sync.set({
            scheduledPostsEnabled: scheduledPostsToggle.checked
        });
    });

    // Sauvegarder lors du changement - Masquer pub Premium
    hidePremiumAdsToggle.addEventListener('change', () => {
        chrome.storage.sync.set({
            hidePremiumAdsEnabled: hidePremiumAdsToggle.checked
        });
    });

    // Sauvegarder lors du changement - Création de posts
    pinShareBoxToggle.addEventListener('change', () => {
        chrome.storage.sync.set({
            pinShareBoxEnabled: pinShareBoxToggle.checked
        });
    });

    // Sauvegarder lors du changement - Masquer les jeux
    hideGamesToggle.addEventListener('change', () => {
        chrome.storage.sync.set({
            hideGamesEnabled: hideGamesToggle.checked
        });
    });
});
