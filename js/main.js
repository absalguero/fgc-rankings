document.addEventListener('DOMContentLoaded', () => {
    // This is the code for your tournament results page
    const fullData = {{ tournamentResults.rows | dump | safe }};

    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const pageInfoSpan = document.getElementById('page-info');
    const noDataMessage = document.getElementById('no-data-message');

    let currentPage = 1;
    const rowsPerPage = 50;  
    let filteredData = [];

    function createRowHtml(row) {
      return `
        <td data-label="Event">${row.Event}</td>
        <td data-label="Date">${row.Date}</td>
        <td data-label="Entrants">${row.Entrants}</td>
        <td data-label="Player">${row.Player}</td>
        <td data-label="Placing">${row.Placing}</td>
      `;
    }

    const renderTable = (data) => {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedItems = data.slice(start, end);

        if (paginatedItems.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `<td colspan="5" style="text-align: center; color: #888; padding: 20px;">No results found.</td>`;
            tableBody.appendChild(noResultsRow);
        } else {
            paginatedItems.forEach((row) => {
                const tr = document.createElement('tr');
                tr.innerHTML = createRowHtml(row);
                
                // Conditionally add a class for a gold background
                if (row.Placing && row.Placing.trim().toLowerCase() === '1st') {
                    tr.classList.add('first-place');
                }
                
                tableBody.appendChild(tr);
            });
        }

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = end >= data.length;
        pageInfoSpan.textContent = `Page ${currentPage} of ${Math.ceil(data.length / rowsPerPage)}`;
    };

    const filterData = (query) => {
        if (!query) {
            filteredData = fullData;
        } else {
            const lowerCaseQuery = query.toLowerCase();
            filteredData = fullData.filter(row =>
                (row.Player && row.Player.toLowerCase().includes(lowerCaseQuery)) ||
                (row.Event && row.Event.toLowerCase().includes(lowerCaseQuery))
            );
        }
        currentPage = 1;
        renderTable(filteredData);
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable(filteredData);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage * rowsPerPage < filteredData.length) {
                currentPage++;
                renderTable(filteredData);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterData(e.target.value);
        });
    }

    if (fullData && fullData.length > 0) {
        if (noDataMessage) {
            noDataMessage.style.display = 'none';
        }
        filteredData = fullData;
        renderTable(filteredData);
    } else {
        if (noDataMessage) {
            noDataMessage.style.display = 'block';
        }
    }

    // This is the code for your sidebar toggle
    const toggleButton = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        const isActive = sidebar.classList.toggle('active');
        toggleButton.setAttribute('aria-expanded', isActive);
        
        // Add/remove the no-scroll class to the body to prevent background scrolling
        if (isActive) {
            body.classList.add('no-scroll');
        } else {
            body.classList.remove('no-scroll');
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggleButton.contains(e.target)) {
        sidebar.classList.remove('active');
        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', false);
        }
        
        // Remove the no-scroll class when the menu closes
        body.classList.remove('no-scroll');
      }
    });

});