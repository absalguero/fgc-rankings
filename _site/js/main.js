document.addEventListener('DOMContentLoaded', () => {
   // --- START: FINAL HAMBURGER MENU SCRIPT ---
const navToggle = document.querySelector('.nav-toggle');
const sidebar = document.querySelector('nav.sidebar');
const mainContent = document.querySelector('main.content');

// CHECKPOINT 1: See if the script is finding the elements when the page loads.
console.log('Nav Toggle Element:', navToggle);
console.log('Sidebar Element:', sidebar);

if (navToggle && sidebar && mainContent) {
    const closeSidebar = () => {
        navToggle.classList.remove('is-active');
        sidebar.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };
    navToggle.addEventListener('click', (event) => {
        // CHECKPOINT 2: See if the click is being registered.
        console.log('Nav toggle button was clicked!');

        event.stopPropagation();
        navToggle.classList.toggle('is-active');
        sidebar.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    mainContent.addEventListener('click', () => {
        if (sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}
// --- END: FINAL HAMBURGER MENU SCRIPT ---

    // --- START: EXPANDABLE CARDS SCRIPT ---
    const rankingsTable = document.getElementById('rankings-table');
    const tournamentTable = document.getElementById('tournament-results-table');

    const setupCardExpansion = (tableElement) => {
        if (tableElement) {
            tableElement.querySelector('tbody').addEventListener('click', (event) => {
                const clickedRow = event.target.closest('tr');
                if (clickedRow) {
                    clickedRow.classList.toggle('is-expanded');
                }
            });
        }
    };
    setupCardExpansion(rankingsTable);
    setupCardExpansion(tournamentTable);
    // --- END: EXPANDABLE CARDS SCRIPT ---
    
    // --- START: GOOGLE SHEET & TABLE SCRIPT ---
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBIqTU9Vjqm4lAYt4gGj4QMaxG4eXSsgbDzi2GVHVvrZX0Dba6b1_SlyrVI9ARnlG-xc_b0NVq5lmU/pub?gid=1862929315&single=true&output=csv';
    const tableBody = document.querySelector('#rankings-table tbody'); // Use a more specific selector
    const desktopHeaders = document.querySelectorAll('#rankings-table th');
    const mobileHeaders = document.querySelectorAll('#mobile-sort-container .mobile-sort-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');

    let allPlayers = [];
    let playersToShow = 10;
    const playersPerLoad = 10;
    const maxPlayers = 40;

    let currentSortColumn = 0;
    let currentSortDirection = 'asc';
    let currentSortDataType = 'number';

    function createRowHtml(player) {
        const rank = player['Rank'] || 'N/A';
        const change = player['Rank Change'] || '';
        const playerName = player['Player'] || 'Unknown Player';
        const playerIcon = player['Player Icon'] || '';
        const characterName = player['Main Character'] || 'N/A';
        const countryName = player['Country'] || 'N/A';
        const rating = player['Rating'] || '0';

        const countryNameLower = String(countryName).toLowerCase();
        const characterNameLower = String(characterName).toLowerCase();
        
        const changeContent = (() => {
            if (change === 'New') return `<div class="change-cell"><span style="color: #007bff;">New</span></div>`;
            if (change.startsWith('+')) return `<div class="change-cell"><span style="color: green;">${change}</span></div>`;
            if (change.startsWith('-')) return `<div class="change-cell"><span style="color: red;">${change}</span></div>`;
            return `<div class="change-cell"><span style="color: #6c757d;">${change}</span></div>`;
        })();

        return `
            <td data-label="Rank"><div class="mobile-value">${rank}</div></td>
            <td data-label="Change">${changeContent}</td>
            <td data-label="Player"><div class="player-cell"><img src="${playerIcon}" alt="${playerName}" class="player-icon" onerror="this.style.display='none'"><span class="player-name">${playerName}</span></div></td>
            <td data-label="Character"><div class="character-cell"><img src="/images/characters/${characterNameLower}.png" alt="${characterName}" class="character-icon" onerror="this.style.display='none'"><span>${characterName}</span></div></td>
            <td data-label="Country"><div class="flag-cell"><img src="/images/flags/${countryNameLower}.png" alt="${countryName}" class="flag-icon" onerror="this.style.display='none'"><span>${countryName}</span></div></td>
            <td data-label="Rating"><div class="mobile-value"><span class="points-value">${rating}</span></div></td>
        `;
    }

    function renderTable(playersToRender) {
        tableBody.innerHTML = '';
        playersToRender.forEach(player => {
            const rank = parseInt(player['Rank'], 10);
            if (!isNaN(rank)) {
                const row = document.createElement('tr');
                // Updated logic to add classes for all ranks 1 through 5 and 6-40
                if (rank === 1) row.classList.add('rank-1');
                else if (rank === 2) row.classList.add('rank-2');
                else if (rank === 3) row.classList.add('rank-3');
                else if (rank === 4) row.classList.add('rank-4');
                else if (rank === 5) row.classList.add('rank-5');
                else if (rank >= 6 && rank <= 40) row.classList.add('ranked-6-40');
                // Removed the code that adds the 'ranked-6-40' class.
                
                row.innerHTML = createRowHtml(player);
                tableBody.appendChild(row);
            }
        });
    }

    function sortPlayers(playersArray, columnIndex, dataType, sortDirection) {
        const headersMap = { 0: 'Rank', 1: 'Rank Change', 2: 'Player', 3: 'Main Character', 4: 'Country', 5: 'Rating' };
        const headerKey = headersMap[columnIndex];
        if (!headerKey) return playersArray;

        playersArray.sort((a, b) => {
            let aValue = a[headerKey];
            let bValue = b[headerKey];
            if (dataType === 'number') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            } else {
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return playersArray;
    }

    function refreshTable() {
        let visiblePlayers = allPlayers.slice(0, playersToShow);
        sortPlayers(visiblePlayers, currentSortColumn, currentSortDataType, currentSortDirection);
        renderTable(visiblePlayers);
        if (loadMoreBtn) {
            loadMoreBtn.style.display = (playersToShow < allPlayers.length && playersToShow < maxPlayers) ? 'inline-block' : 'none';
        }
    }

    function setupSorting() {
        const headers = document.querySelectorAll('#rankings-table th, #mobile-sort-container .mobile-sort-btn');
        headers.forEach(header => {
            header.addEventListener('click', (event) => {
                const clickedHeader = event.currentTarget;
                const columnIndex = parseInt(clickedHeader.getAttribute('data-column-index'));
                const dataType = clickedHeader.getAttribute('data-type');
                
                currentSortDirection = (columnIndex === currentSortColumn && currentSortDirection === 'asc') ? 'desc' : 'asc';
                currentSortColumn = columnIndex;
                currentSortDataType = dataType;
                
                refreshTable();
                
                document.querySelectorAll('[data-column-index]').forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
                document.querySelectorAll(`[data-column-index="${columnIndex}"]`).forEach(h => h.classList.add(`sorted-${currentSortDirection}`));
            });
        });
    }
    
    async function fetchDataAndRenderTable() {
        if (!tableBody) return;
        try {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading data...</td></tr>';
            const response = await fetch(`${sheetURL}&cachebuster=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();

            const rows = csvText.trim().split('\n');
            const csvHeaders = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
            allPlayers = rows.slice(1).map(row => {
                const player = {};
                const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
                csvHeaders.forEach((header, i) => {
                    player[header] = values[i];
                });
                return player;
            }).slice(0, maxPlayers);

            setupSorting();
            refreshTable();

            document.querySelectorAll(`[data-column-index="0"]`).forEach(h => h.classList.add('sorted-asc'));

        } catch (error) {
            console.error("Failed to fetch or parse rankings data:", error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data.</td></tr>';
        }
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            playersToShow = Math.min(playersToShow + playersPerLoad, maxPlayers);
            refreshTable();
        });
    }
    
    fetchDataAndRenderTable();
    // --- END: GOOGLE SHEET & TABLE SCRIPT ---
});
