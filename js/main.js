document.addEventListener('DOMContentLoaded', () => {
    // --- START: HAMBURGER MENU SCRIPT ---
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.nav-sidebar');
    const mainContent = document.querySelector('main.content');

    if (navToggle && sidebar && mainContent) {
        const closeSidebar = () => {
            navToggle.classList.remove('active');
            sidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };
        navToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            navToggle.classList.toggle('active');
            sidebar.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        mainContent.addEventListener('click', () => {
            if (sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });
    }
    // --- END: HAMBURGER MENU SCRIPT ---

    // --- START: EXPANDABLE CARDS SCRIPT ---
    const rankingsTable = document.getElementById('rankings-table');
    if (rankingsTable) {
        rankingsTable.querySelector('tbody').addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                return;
            }
            const clickedRow = event.target.closest('tr');
            if (clickedRow) {
                clickedRow.classList.toggle('is-expanded');
            }
        });
    }
    // --- END: EXPANDABLE CARDS SCRIPT ---

    // --- START: SEARCH CLEAR BUTTON SCRIPT ---
    function setupSearchClearButton(inputId, clearBtnId) {
        const inputElement = document.getElementById(inputId);
        const clearBtnElement = document.getElementById(clearBtnId);
        if (inputElement && clearBtnElement) {
            inputElement.addEventListener('input', () => {
                clearBtnElement.classList.toggle('visible', inputElement.value.length > 0);
            });
            clearBtnElement.addEventListener('click', () => {
                inputElement.value = '';
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                inputElement.focus();
            });
        }
    }
    setupSearchClearButton('player-search-input', 'player-search-clear-btn'); // For the main rankings page
    setupSearchClearButton('search-input', 'search-clear-btn');           // For the tournament results page
    setupSearchClearButton('mobile-search-input', 'mobile-search-clear-btn'); // For the mobile header
    // --- END: SEARCH CLEAR BUTTON SCRIPT ---

    // --- START: GOOGLE SHEET & RANKINGS TABLE SCRIPT ---
    const rankingsTableBody = document.querySelector('#rankings-table tbody');
    if (rankingsTableBody) {
        const sheetURL = 'https://docs.google.com/spreadsheets/d/1otrfs8HN3Shq6U2-qrc4GDxTI4ragnqwbTjweecE12Q/gviz/tq?tqx=out:csv&gid=1862929315';
        const loadMoreBtn = document.getElementById('load-more-btn');
        const playerSearchInput = document.getElementById('player-search-input');

        let allPlayers = [];
        let playersToShow = 10;
        const playersPerLoad = 10;
        const maxPlayers = 40;
        let searchTerm = '';

        let currentSortColumn = 0;
        let currentSortDirection = 'asc';
        let currentSortDataType = 'number';
        
        function debounce(func, delay) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        }

        // The setupSearchClearButton function was moved out of this block.
        
        if (playerSearchInput) {
            playerSearchInput.addEventListener('input', debounce((e) => {
                searchTerm = e.target.value.toLowerCase();
                playersToShow = 10; 
                refreshTable();
            }, 300));
        }

        function updateSortHeadersUI() {
            document.querySelectorAll('#rankings-table [data-column-index], #rankings-mobile-sort [data-column-index]').forEach(h => {
                h.classList.remove('sorted', 'asc', 'desc');
            });
            document.querySelectorAll(`#rankings-mobile-sort [data-column-index="${currentSortColumn}"], #rankings-table th[data-column-index="${currentSortColumn}"]`).forEach(h => {
                h.classList.add('sorted', currentSortDirection);
            });
        }
        
        function parseCSV(text) {
            const rows = text.trim().split('\n');
            if (rows.length <= 1) return [];
            const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            return rows.slice(1).map(row => {
                const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                const player = {};
                headers.forEach((header, i) => {
                    const value = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
                    player[header] = value;
                });
                return player;
            });
        }

        function createRowHtml(player) {
            const rank = player['Rank'] || 'N/A';
            const change = player['Rank Change'] || '';
            const playerName = player['Player'] || 'Unknown Player';
            const playerIcon = player['Player Icon'] || '';
            const playerPhotoUrl = playerIcon ? `/images/players/${playerIcon}` : '';
            const characterName = player['Main Character'] || 'N/A';
            const countryName = player['Country'] || 'N/A';
            const rating = player['Rating'] || '0';
            const countryNameLower = String(countryName).toLowerCase();
            const characterNameLower = String(characterName)
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-');

            const changeContent = (() => {
                const value = change.replace('+', '').replace('-', '');
                if (change === 'New') return `<div class="change-cell new"><i class="fas fa-star"></i> New</div>`;
                if (change.startsWith('+')) return `<div class="change-cell positive"><i class="fas fa-arrow-up"></i> ${value}</div>`;
                if (change.startsWith('-')) return `<div class="change-cell negative"><i class="fas fa-arrow-down"></i> ${value}</div>`;
                return `<div class="change-cell no-change"><i class="fas fa-minus"></i></div>`;
            })();

            let playerHtml = playerName;
            let characterHtml = characterName;
            let countryHtml = countryName;

            if (searchTerm) {
                const regex = new RegExp(searchTerm.split(' ').filter(k => k).join('|'), 'gi');
                playerHtml = playerName.replace(regex, match => `<mark>${match}</mark>`);
                characterHtml = characterName.replace(regex, match => `<mark>${match}</mark>`);
                countryHtml = countryName.replace(regex, match => `<mark>${match}</mark>`);
            }

            return `
                <td data-label="Rank" class="rank-cell expandable-cell">${rank}</td>
                <td data-label="Change" class="cell-hidden-mobile">${changeContent}</td>
                <td data-label="Player" class="cell-player"><div class="player-cell-content"><img src="${playerIcon}" alt="${playerName}" class="player-icon" onerror="this.style.display='none'"><span>${playerHtml}</span></div></td>
                <td data-label="Main Character" class="cell-character cell-hidden-mobile">
                    <div class="player-cell-content">
                        <img src="/images/characters/${characterNameLower}.png" alt="${characterName}" class="character-icon" onerror="this.style.display='none'">
                        <span>${characterHtml}</span>
                    </div>
                </td>
                <td data-label="Country" class="cell-center cell-hidden-mobile"><div class="player-cell-content"><img src="/images/flags/${countryNameLower}.png" alt="${countryName}" class="flag-icon" onerror="this.style.display='none'"><span>${countryHtml}</span></div></td>
                <td data-label="Rating">${rating}</td>
            `;

            const backToTopBtn = document.getElementById('back-to-top-btn');
            const contentArea = document.querySelector('main.content');

            if (backToTopBtn && contentArea) {

                const checkOverflowAndShowButton = () => {
                    const hasScrollbar = contentArea.scrollHeight > contentArea.clientHeight;

                    if (hasScrollbar) {
                        backToTopBtn.classList.add('show');
                    } else {
                        backToTopBtn.classList.remove('show');
                    }
                };
                checkOverflowAndShowButton();
                window.addEventListener('resize', checkOverflowAndShowButton);
                backToTopBtn.addEventListener('click', () => {
                    contentArea.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        }

        function renderTable(playersToRender) {
            rankingsTableBody.innerHTML = '';
            if (playersToRender.length === 0) {
                rankingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No players found.</td></tr>';
                return;
            }
            playersToRender.forEach(player => {
                const rank = parseInt(player['Rank'], 10);
                if (!isNaN(rank)) {
                    const row = document.createElement('tr');
                    if (rank === 1) row.classList.add('rank-1');
else if (rank === 2) row.classList.add('rank-2');
else if (rank === 3) row.classList.add('rank-3');
else if (rank === 4) row.classList.add('rank-4');
else if (rank >= 5 && rank <= 40) row.classList.add('ranked-6-40'); 
                    row.innerHTML = createRowHtml(player);
                    rankingsTableBody.appendChild(row);
                }
            });
        }

        function sortPlayers(playersArray) {
            const headersMap = { 0: 'Rank', 1: 'Rank Change', 2: 'Player', 3: 'Main Character', 4: 'Country', 5: 'Rating' };
            const headerKey = headersMap[currentSortColumn];
            if (!headerKey) return playersArray;
            
            return [...playersArray].sort((a, b) => {
                let aValue = a[headerKey];
                let bValue = b[headerKey];
                if (currentSortDataType === 'number') {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                } else {
                    aValue = String(aValue).toLowerCase();
                    bValue = String(bValue).toLowerCase();
                }
                if (aValue < bValue) return currentSortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return currentSortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        function refreshTable() {
            let filteredPlayers = allPlayers;
            if (searchTerm) {
                filteredPlayers = allPlayers.filter(player => {
                    const playerName = (player['Player'] || '').toLowerCase();
                    const character = (player['Main Character'] || '').toLowerCase();
                    const country = (player['Country'] || '').toLowerCase();
                    return playerName.includes(searchTerm) || 
                               character.includes(searchTerm) || 
                               country.includes(searchTerm);
                });
            }
            
            const sortedPlayers = sortPlayers(filteredPlayers);
            
            let visiblePlayers = sortedPlayers.slice(0, playersToShow);
            renderTable(visiblePlayers);
            
            if (loadMoreBtn) {
                const canLoadMore = visiblePlayers.length < sortedPlayers.length && playersToShow < maxPlayers;
                loadMoreBtn.style.display = canLoadMore ? 'inline-flex' : 'none';
            }
        }

        function setupSorting() {
            const headers = document.querySelectorAll('#rankings-table th, #rankings-mobile-sort .btn');
            headers.forEach(header => {
                header.addEventListener('click', (event) => {
                    const clickedHeader = event.currentTarget;
                    const columnIndex = parseInt(clickedHeader.getAttribute('data-column-index'));
                    const dataType = clickedHeader.getAttribute('data-type');
                    
                    if (columnIndex === currentSortColumn) {
                        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSortDirection = 'asc';
                        currentSortColumn = columnIndex;
                        currentSortDataType = dataType;
                    }
                    
                    refreshTable();
                    updateSortHeadersUI();
                });
            });
        }
        
        async function fetchDataAndRenderTable() {
            try {
                rankingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading rankings...</td></tr>';
                const response = await fetch(`${sheetURL}&cachebuster=${Date.now()}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const csvText = await response.text();
                const allPlayersRaw = parseCSV(csvText);

                allPlayers = allPlayersRaw.filter(player => {
                    const rank = parseInt(player['Rank'], 10);
                    return !isNaN(rank) && rank >= 1 && rank <= maxPlayers;
                });
                
                currentSortColumn = 0;
                currentSortDirection = 'asc';
                currentSortDataType = 'number';

                refreshTable();
                updateSortHeadersUI();
                setupSorting();

            } catch (error) {
                console.error("An error occurred in fetchDataAndRenderTable:", error);
                rankingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data. See console for error.</td></tr>';
            }
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.disabled = true;
                loadMoreBtn.innerHTML = 'Loading...';
                
                playersToShow = Math.min(playersToShow + playersPerLoad, maxPlayers);
                
                setTimeout(() => {
                    refreshTable();
                    if(playersToShow < maxPlayers && allPlayers.length > playersToShow) {
                        loadMoreBtn.disabled = false;
                        loadMoreBtn.innerHTML = 'Load More';
                    } else {
                        loadMoreBtn.style.display = 'none';
                    }
                }, 100);
            });
        }
        
        fetchDataAndRenderTable();
    }
    // --- END: GOOGLE SHEET & RANKINGS TABLE SCRIPT ---

    // --- START: RANKING SYSTEM TOC SCROLL FIX (CORRECTED) ---
    const tocLinks = document.querySelectorAll('.page-ranking-system .toc a[href^="#"]');
    const mobileHeader = document.querySelector('.mobile-header');

    if (tocLinks.length > 0 && mobileHeader) {
        tocLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerHeight = mobileHeader.offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    // Increased the offset from 15 to 20 for a little more space
                    const offsetPosition = targetPosition - headerHeight - 20; 

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    // --- END: RANKING SYSTEM TOC SCROLL FIX ---

    // --- START: BACK TO TOP BUTTON SCRIPT (CORRECTED) ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const contentArea = document.querySelector('main.content'); 

    if (backToTopBtn && contentArea) {
        // Check if the ranking system's unique desktop layout is active,
        // otherwise default to the standard logic.
        const isRankingSystemPageDesktop = document.body.classList.contains('page-ranking-system') && window.innerWidth >= 769;
        
        // On the ranking system page on desktop, the main content doesn't scroll, so the window does.
        const scrollContainer = isRankingSystemPageDesktop ? window : (window.innerWidth >= 769 ? contentArea : window);
        
        scrollContainer.addEventListener('scroll', () => {
            const scrollPosition = scrollContainer.scrollTop || window.scrollY;
            if (scrollPosition > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            scrollContainer.scrollTo({ top: 0 });
        });
    }
    // --- END: BACK TO TOP BUTTON SCRIPT ---
});