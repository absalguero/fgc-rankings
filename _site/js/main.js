document.addEventListener('DOMContentLoaded', () => {
    // --- START: FINAL HAMBURGER MENU SCRIPT ---
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('nav.sidebar');
    const mainContent = document.querySelector('main.content');

    if (navToggle && sidebar && mainContent) {
        const closeSidebar = () => {
            navToggle.classList.remove('is-active');
            sidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };
        navToggle.addEventListener('click', (event) => {
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
    const sheetURL = 'https://docs.google.com/spreadsheets/d/1otrfs8HN3Shq6U2-qrc4GDxTI4ragnqwbTjweecE12Q/gviz/tq?tqx=out:csv&gid=1862929315';
    const tableBody = document.querySelector('#rankings-table tbody');
    const loadMoreBtn = document.getElementById('load-more-btn');

    let allPlayers = [];
    let playersToShow = 10;
    const playersPerLoad = 10;
    const maxPlayers = 40;

    let currentSortColumn = 0;
    let currentSortDirection = 'asc';
    let currentSortDataType = 'number';

    function updateSortHeadersUI() {
    // First, remove the highlight from all buttons/headers
    document.querySelectorAll('[data-column-index]').forEach(h => {
        h.classList.remove('sorted-asc', 'sorted-desc');
    });

    // Then, add the correct highlight to the currently active column
    document.querySelectorAll(`[data-column-index="${currentSortColumn}"]`).forEach(h => {
        h.classList.add(`sorted-${currentSortDirection}`);
    });
}

    // 💡 THIS IS THE CORRECTED, ROBUST CSV PARSING FUNCTION
    function parseCSV(text) {
        const rows = text.trim().split('\n');
        if (rows.length <= 1) return [];
        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const data = rows.slice(1).map(row => {
            // This regex correctly handles commas inside of quoted fields
            const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            const player = {};
            headers.forEach((header, i) => {
                // Clean up the value by removing surrounding quotes
                const value = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
                player[header] = value;
            });
            return player;
        });
        return data;
    }

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
        if (!tableBody) return;
        tableBody.innerHTML = '';
        playersToRender.forEach(player => {
            const rank = parseInt(player['Rank'], 10);
            if (!isNaN(rank)) {
                const row = document.createElement('tr');
                if (rank === 1) row.classList.add('rank-1');
                else if (rank === 2) row.classList.add('rank-2');
                else if (rank === 3) row.classList.add('rank-3');
                else if (rank === 4) row.classList.add('rank-4');
                else if (rank === 5) row.classList.add('rank-5');
                else if (rank >= 6 && rank <= 40) row.classList.add('ranked-6-40');
                row.innerHTML = createRowHtml(player);
                tableBody.appendChild(row);
            }
        });
    }

    function sortPlayers(playersArray, columnIndex, dataType, sortDirection) {
        const headersMap = { 0: 'Rank', 1: 'Rank Change', 2: 'Player', 3: 'Main Character', 4: 'Country', 5: 'Rating' };
        const headerKey = headersMap[columnIndex];
        if (!headerKey) return playersArray;
        return playersArray.sort((a, b) => {
            let aValue = a[headerKey];
            let bValue = b[headerKey];
            if (headerKey === 'Rank') {
                aValue = parseInt(aValue, 10) || Infinity;
                bValue = parseInt(bValue, 10) || Infinity;
            } else if (dataType === 'number') {
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
    }

    function refreshTable() {
        sortPlayers(allPlayers, currentSortColumn, currentSortDataType, currentSortDirection);
        let visiblePlayers = allPlayers.slice(0, playersToShow);
        renderTable(visiblePlayers);
        if (loadMoreBtn) {
            loadMoreBtn.style.display = (playersToShow < allPlayers.length) ? 'inline-block' : 'none';
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
                updateSortHeadersUI();
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

        const allPlayersRaw = parseCSV(csvText);

        allPlayers = allPlayersRaw.filter(player => {
            const rank = parseInt(player['Rank'], 10);
            return !isNaN(rank) && rank >= 1 && rank <= maxPlayers;
        });

        refreshTable();

        // 💡 FIX: This line sets the initial highlight on the correct column.
        updateSortHeadersUI();

        setupSorting();

    } catch (error) {
        console.error("An error occurred in fetchDataAndRenderTable:", error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data. See console for error.</td></tr>';
    }
}

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            playersToShow = Math.min(playersToShow + playersPerLoad, maxPlayers);
            refreshTable();
        });
    }
    
    if (document.getElementById('rankings-table')) {
        fetchDataAndRenderTable();
    }
    // --- END: GOOGLE SHEET & TABLE SCRIPT ---
});