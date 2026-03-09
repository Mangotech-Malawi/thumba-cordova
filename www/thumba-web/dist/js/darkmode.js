document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('toggleTheme');

    // Open IndexedDB
    const request = indexedDB.open('themePreferenceDB', 1);

    // Create object store if it doesn't exist
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('preferences', { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
        const db = event.target.result;

        // Retrieve the saved theme preference
        const transaction = db.transaction('preferences', 'readonly');
        const store = transaction.objectStore('preferences');
        const getPreference = store.get(1);

        getPreference.onsuccess = () => {
            const preference = getPreference.result;

            // Apply the saved theme preference
            if (preference && preference.theme === 'dark') {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
                document.getElementById('navbar').classList.remove('navbar-light');
                document.getElementById('navbar').classList.add('navbar-dark');
                document.getElementById('sidebar').classList.add('sidebar-dark-primary');
                button.textContent = 'Switch to Light Mode';
            } else {
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
                document.getElementById('navbar').classList.remove('navbar-dark');
                document.getElementById('navbar').classList.add('navbar-light');
                button.textContent = 'Switch to Dark Mode';
            }
        };

        // Add event listener to the button for toggling theme
        button.addEventListener('click', () => {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');

            // Update classes for navbar and sidebar
            if (isDarkMode) {
                document.getElementById('navbar').classList.remove('navbar-light');
                document.getElementById('navbar').classList.add('navbar-dark');
          
                document.getElementById('sidebar').classList.add('sidebar-dark-primary');
                button.textContent = 'Switch to Light Mode';
            } else {
                document.getElementById('navbar').classList.remove('navbar-dark');
                document.getElementById('navbar').classList.add('navbar-light');
                button.textContent = 'Switch to Dark Mode';
            }

            // Save the current theme preference to IndexedDB
            const transaction = db.transaction('preferences', 'readwrite');
            const store = transaction.objectStore('preferences');
            store.put({ id: 1, theme: isDarkMode ? 'dark' : 'light' });
        });
    };

    request.onerror = () => {
        console.error('Error opening IndexedDB');
    };
});
