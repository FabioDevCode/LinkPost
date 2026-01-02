/**
 * LinkPost Extension - Popup Script
 * Gère les paramètres utilisateur avec chrome.storage.sync
 */
document.addEventListener('DOMContentLoaded', () => {
    const scheduledPostsToggle = document.getElementById('scheduledPosts');

    // Charger l'état actuel depuis le storage
    chrome.storage.sync.get({ scheduledPostsEnabled: true }, (result) => {
        scheduledPostsToggle.checked = result.scheduledPostsEnabled;
    });

    // Sauvegarder lors du changement
    scheduledPostsToggle.addEventListener('change', () => {
        chrome.storage.sync.set({
            scheduledPostsEnabled: scheduledPostsToggle.checked
        });
    });
});
