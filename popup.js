/**
 * LinkPost Extension - Popup Script
 * Gère les paramètres utilisateur avec chrome.storage.sync
 */
document.addEventListener('DOMContentLoaded', () => {
    const scheduledPostsToggle = document.getElementById('scheduledPosts');
    const hidePremiumAdsToggle = document.getElementById('hidePremiumAds');

    // Charger l'état actuel depuis le storage
    chrome.storage.sync.get({
        scheduledPostsEnabled: true,
        hidePremiumAdsEnabled: false
    }, (result) => {
        scheduledPostsToggle.checked = result.scheduledPostsEnabled;
        hidePremiumAdsToggle.checked = result.hidePremiumAdsEnabled;
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
});
