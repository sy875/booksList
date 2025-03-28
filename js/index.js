// define variables for easy access
const API_URL = 'https://api.freeapi.app/api/v1/public/books';
let currentPage = 1;
let totalPages = 1;
let books = [];


//access html element by id to manipulate them by js
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const listViewBtn = document.getElementById('listViewBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const currentPageSpan = document.getElementById('currentPage');
const loader = document.getElementById('loader');

//loader function to show loader when data is being fetched
function showLoader() {
    loader.style.display = 'flex';
    booksContainer.style.display = 'none';
}

//function to hide laoder when data from api is received
function hideLoader() {
    loader.style.display = 'none';
    booksContainer.style.display = 'grid';
}


// asynchronus function to fetch books because api call will return promise
// it takes parameter page to fetch data based on page
async function fetchBooks(page = 1) {
    try {
        showLoader();
        const response = await fetch(`${API_URL}?page=${page}&limit=10&inc=kind,id,etag,volumeInfo`);
        const data = await response.json();

        books = data.data.data;
        totalPages = data.data.totalPages;

        updatePaginationControls(page);
        renderBooks(books);
        hideLoader();
    } catch (error) {
        console.error('Error fetching books:', error);
        hideLoader();
    }
}


//this function is used to create html elment by javascript
// and then append in hmlfile 
function renderBooks(booksToRender) {
    booksContainer.innerHTML = '';

    booksToRender.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book-item');

        const thumbnailUrl = book.volumeInfo.imageLinks?.thumbnail || '/api/placeholder/100/150';

        bookElement.innerHTML = `
            <img src="${thumbnailUrl}" alt="${book.volumeInfo.title}">
            <div class="book-details">
                <h2>${book.volumeInfo.title.slice(0,20)}</h2>
                <p>Author: ${book.volumeInfo.authors?.slice(0,20).join(', ') || 'Unknown'}</p>
                <p>Published: ${book.volumeInfo.publishedDate || 'N/A'}</p>
                <a href="bookDetail.html?id=${book.id}" target="_blank">More Details</a>
            </div>
        `;

        booksContainer.appendChild(bookElement);
    });
}

// update page based on user interaction with next and prev btn
function updatePaginationControls(page) {
    currentPage = page;
    currentPageSpan.textContent = `Page ${page} of ${totalPages}`;

    // Disable/enable pagination buttons based on current page and total pages
    prevPageBtn.disabled = page <= 1;
    nextPageBtn.disabled = page >= totalPages;
}


// filters based on search text authors 
function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(book =>
        book.volumeInfo.title.toLowerCase().includes(searchTerm) ||
        book.volumeInfo.authors?.some(author => author.toLowerCase().includes(searchTerm))
    );

    renderBooks(filteredBooks);
}


//function to sort books based on 
//title,author,and date
function sortBooks() {
    const [sortType, sortOrder] = sortSelect.value.split('-');

    const sortedBooks = [...books].sort((a, b) => {
        let valueA, valueB;

        switch (sortType) {
            case 'title':
                valueA = a.volumeInfo.title;
                valueB = b.volumeInfo.title;
                break;
            case 'author':
                valueA = a.volumeInfo.authors?.[0] || '';
                valueB = b.volumeInfo.authors?.[0] || '';
                break;
            case 'date':
                // Improve date sorting
                valueA = a.volumeInfo.publishedDate ? new Date(a.volumeInfo.publishedDate) : new Date(0);
                valueB = b.volumeInfo.publishedDate ? new Date(b.volumeInfo.publishedDate) : new Date(0);
                return sortOrder === 'asc' 
                    ? valueA.getTime() - valueB.getTime() 
                    : valueB.getTime() - valueA.getTime();
        }

        return sortOrder === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
    });

    renderBooks(sortedBooks);
}

function toggleView(view) {
    if (view === 'list') {
        booksContainer.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    } else {
        booksContainer.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    }
}

// Event Listeners to track user interactions 
searchInput.addEventListener('input', filterBooks);
sortSelect.addEventListener('change', sortBooks);
listViewBtn.addEventListener('click', () => toggleView('list'));
gridViewBtn.addEventListener('click', () => toggleView('grid'));

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        fetchBooks(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        fetchBooks(currentPage + 1);
    }
});

// call fetchbook when page intially loaded and also make grid layout default layout
fetchBooks();
gridViewBtn.classList.add('active');