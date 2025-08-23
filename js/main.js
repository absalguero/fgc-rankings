document.addEventListener('DOMContentLoaded', () => {
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBIqTU9Vjqm4lAYt4gGj4QMaxG4eXSsgbDzi2GVHVvrZX0Dba6b1_SlyrVI9ARnlG-xc_b0NVq5lmU/pub?gid=1862929315&single=true&output=csv';
    const table = document.getElementById('rankings-table');
    const tbody = table.querySelector('tbody');
    const desktopHeaders = table.querySelectorAll('th');
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
        const rank = player['Rank'];
        const change = player['Rank Change'];
        const playerName = player['Player'];
        const playerIcon = player['Player Icon'];
        const characterName = player['Main Character'];
        const countryName = player['Country'];
        const rating = player['Rating'];

        const countryNameLower = String(countryName).toLowerCase();
        const characterNameLower = String(characterName).toLowerCase();
        
        const changeContent = (() => {
            if (change === 'New') {
                return `<div class="change-cell"><span style="color: #007bff;">New</span></div>`;
            } else if (change.startsWith('+')) {
                return `<div class="change-cell"><span style="color: green;">${change}</span></div>`;
            } else if (change.startsWith('-')) {
                return `<div class="change-cell"><span style="color: red;">${change}</span></div>`;
            }
            return `<div class="change-cell"><span style="color: #6c757d;">${change}</span></div>`;
        })();

        return `
            <td data-label="Rank"><div class="mobile-value">${rank}</div></td>
            <td data-label="Change">${changeContent}</td>
            <td data-label="Player">
                <div class="player-cell">
                    <img src="${playerIcon}" alt="${playerName}" class="player-icon" onerror="this.src='https://placehold.co/40x40/aaa/fff?text=?';">
                    <span>${playerName}</span>
                </div>
            </td>
            <td data-label="Character">
                <div class="character-cell">
                    <img src="/images/characters/${characterNameLower}.png" alt="${characterName}" class="character-icon" onerror="this.src='https://placehold.co/40x40/aaa/fff?text=N/A';">
                    <span>${characterName}</span>
                </div>
            </td>
            <td data-label="Country">
                <div class="flag-cell">
                    <img src="/images/flags/${countryNameLower}.png" alt="${countryName}" class="flag-icon" onerror="this.src='https://placehold.co/40x40/aaa/fff?text=?';">
                    <span>${countryName}</span>
                </div>
            </td>
            <td data-label="Rating"><div class="mobile-value"><span class="points-value">${rating}</span></div></td>
        `;
    }

    function renderTable(playersToRender) {
        tbody.innerHTML = '';
        playersToRender.forEach(player => {
            if (player['Rank']) {
                const row = document.createElement('tr');
                if (player['Rank'] <= 5) {
                    row.classList.add(`rank-${player['Rank']}`);
                }
                row.innerHTML = createRowHtml(player);
                tbody.appendChild(row);
            }
        });
    }

    function sortPlayers(playersArray, columnIndex, dataType, sortDirection) {
        const headersMap = {
            0: 'Rank',
            1: 'Rank Change',
            2: 'Player',
            3: 'Main Character',
            4: 'Country',
            5: 'Rating'
        };
        const headerKey = headersMap.hasOwnProperty(columnIndex) ? headersMap[columnIndex] : null;
        if (!headerKey) {
            return playersArray;
        }

        playersArray.sort((a, b) => {
            let aValue = a[headerKey];
            let bValue = b[headerKey];

            if (dataType === 'number') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (dataType === 'string') {
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }

            if (sortDirection === 'asc') {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
            } else {
                if (aValue > bValue) return -1;
                if (aValue < bValue) return 1;
            }
            return 0;
        });
        return playersArray;
    }

    function clearAllSortIndicators() {
        desktopHeaders.forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
            h.removeAttribute('data-sort-direction');
        });
        mobileHeaders.forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
        });
    }

    // NEW FUNCTION to update the indicator on a specific element and its desktop/mobile counterpart
    function updateActiveSortIndicator(clickedElement) {
        clearAllSortIndicators();
        
        const columnIndex = clickedElement.getAttribute('data-column-index');

        // Update the clicked element
        clickedElement.classList.add(`sorted-${currentSortDirection}`);
        if (clickedElement.tagName === 'TH') {
            clickedElement.setAttribute('data-sort-direction', currentSortDirection);
        }

        // Find and update the corresponding element
        if (clickedElement.tagName === 'TH') {
            const mobileBtn = document.querySelector(`#mobile-sort-container .mobile-sort-btn[data-column-index="${columnIndex}"]`);
            if (mobileBtn) {
                mobileBtn.classList.add(`sorted-${currentSortDirection}`);
            }
        } else {
            const desktopTh = document.querySelector(`th[data-column-index="${columnIndex}"]`);
            if (desktopTh) {
                desktopTh.classList.add(`sorted-${currentSortDirection}`);
                desktopTh.setAttribute('data-sort-direction', currentSortDirection);
            }
        }
    }

    function refreshTable() {
        // First, get the players that are currently visible
        let visiblePlayers = allPlayers.slice(0, playersToShow);
        
        // Then, sort only this visible subset of players
        sortPlayers(visiblePlayers, currentSortColumn, currentSortDataType, currentSortDirection);
        
        // Now, render the sorted visible players
        renderTable(visiblePlayers);
        
        if (playersToShow < allPlayers.length) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    function setupSorting() {
        desktopHeaders.forEach(header => {
            header.addEventListener('click', (event) => {
                const columnIndex = parseInt(event.currentTarget.getAttribute('data-column-index'));
                const dataType = event.currentTarget.getAttribute('data-type');
                
                let newSortDirection = columnIndex === currentSortColumn ? (currentSortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
                
                currentSortColumn = columnIndex;
                currentSortDirection = newSortDirection;
                currentSortDataType = dataType;
                
                refreshTable();
                updateActiveSortIndicator(event.currentTarget);
            });
        });
        
        mobileHeaders.forEach(header => {
            header.addEventListener('click', (event) => {
                const columnIndex = parseInt(event.currentTarget.getAttribute('data-column-index'));
                const dataType = event.currentTarget.getAttribute('data-type');
                
                let newSortDirection = columnIndex === currentSortColumn ? (currentSortDirection === 'asc' ? 'desc' : 'asc') : 'asc';

                currentSortColumn = columnIndex;
                currentSortDirection = newSortDirection;
                currentSortDataType = dataType;
                
                refreshTable();
                updateActiveSortIndicator(event.currentTarget);
            });
        });
    }

    function loadMorePlayers() {
        playersToShow = Math.min(playersToShow + playersPerLoad, maxPlayers);
        refreshTable();
    }

    async function fetchDataAndRenderTable() {
        try {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading data...</td></tr>';

            const cacheBuster = Math.floor(Date.now() / (1000 * 60 * 10));
            const urlWithCacheBuster = `${sheetURL}&cachebuster=${cacheBuster}`;

            const response = await fetch(urlWithCacheBuster);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();

            const rows = csvText.trim().split('\n').map(row => row.split(','));
            const csvHeaders = rows[0].map(h => h.trim().replace(/"/g, ''));
            allPlayers = rows.slice(1).map(row => {
                const player = {};
                row.forEach((value, i) => {
                    player[csvHeaders[i]] = value.trim().replace(/"/g, '');
                });
                return player;
            }).slice(0, maxPlayers);

            setupSorting();
            refreshTable();

        } catch (error) {
            console.error("Failed to fetch or parse rankings data:", error);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data. Please try again later.</td></tr>';
        }
    }

    loadMoreBtn.addEventListener('click', loadMorePlayers);
    
    fetchDataAndRenderTable();
});