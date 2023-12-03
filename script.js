let users = []; // Array to store users
let currentPage = 1;
const itemsPerPage = 10;

async function fetchData() {
    const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
    users = await response.json();
    renderTable();
}


function renderTable() {
    console.log('Rendering table...');

    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const displayedUsers = users.slice(start, end);

    displayedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" data-id="${user.id}" onclick="toggleRowSelection(${user.id})"></td>
            <td>${user.id}</td>
            <td contenteditable="true">${user.name}</td>
            <td contenteditable="true">${user.email}</td>
            <td contenteditable="true">${user.role}</td>
            <td>
                <button class="edit" onclick="editUser(${user.id})"><img src="pen-to-square-regular.svg" alt="Edit" style="width: 20px; height: 20px;"></button>
                <button class="delete" onclick="deleteUser(${user.id})"><img src="trash-solid.svg" alt="Delete" style="width: 20px; height: 20px;"></button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
    console.log('Table rendered.');
}

function toggleRowSelection(userId) {
    const checkbox = document.querySelector(`tbody input[data-id="${userId}"]`);
    const row = checkbox.closest('tr');

    if (checkbox.checked) {
        row.classList.add('selected-row');
    } else {
        row.classList.remove('selected-row');
    }

    updateDeleteSelectedButtonState();
}

function updateDeleteSelectedButtonState() {
    const selectedRows = document.querySelectorAll('.selected-row');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');
    deleteSelectedButton.disabled = selectedRows.length === 0;
}

function deleteSelected() {
    const selectedRows = document.querySelectorAll('.selected-row');
    selectedRows.forEach(row => {
        const userId = parseInt(row.querySelector('input[type="checkbox"]').dataset.id);
        deleteUser(userId);
    });

    updateDeleteSelectedButtonState();
}

function updatePagination() {
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');

    // Clear existing content of the pagination container
    paginationContainer.innerHTML = '';

    const paginationButtons = [];

    // Create and append "Page X of Y" element
    const pageInfoSpan = document.createElement('span');
    pageInfoSpan.innerText = `Page ${currentPage} of ${totalPages}`;
    paginationContainer.appendChild(pageInfoSpan);

    // Add the "<<" (First Page) button
    paginationButtons.push(`&nbsp;<button class="first-page" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>&lt;&lt;</button>&nbsp;`);

    // Add the "<" (Previous Page) button
    paginationButtons.push(`<button class="previous-page" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>&nbsp;`);

    // Add page numbers with spaces between them
    for (let i = 1; i <= totalPages; i++) {
        paginationButtons.push(`<button onclick="goToPage(${i})" ${currentPage === i ? 'class="active"' : ''}>${i}</button>&nbsp;`);
    }

    // Add the ">" (Next Page) button
    paginationButtons.push(`<button class="next-page" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>&nbsp;`);

    // Add the ">>" (Last Page) button
    paginationButtons.push(`<button class="last-page" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>&gt;&gt;</button>&nbsp;`);

    // Append pagination buttons to the container
    paginationContainer.innerHTML += paginationButtons.join('');
}

function selectRow(userId) {
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    const selectedRows = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const userId = parseInt(checkbox.dataset.id);
            selectedRows.push(userId);
        }
    });

    // Update the Delete Selected button state
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');
    deleteSelectedButton.disabled = selectedRows.length === 0;
}

function goToPage(page) {
    currentPage = Math.min(Math.max(1, page), Math.ceil(users.length / itemsPerPage));
    renderTable();
}

function search() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    users = users.filter(user =>
        Object.values(user).some(value => value.toLowerCase().includes(searchTerm))
    );
    currentPage = 1;
    renderTable();
}

function selectAll() {
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    const headerCheckbox = document.getElementById('headerCheckbox');

    checkboxes.forEach(checkbox => checkbox.checked = headerCheckbox.checked);

    // Update the header checkbox state
    headerCheckbox.checked = checkboxes.length > 0 && checkboxes.length === [...checkboxes].filter(checkbox => checkbox.checked).length;
}

function editUser(userId) {
    // Set the selected user for editing
    selectedUserId = userId;

    // Display the selected user's information for editing
    const userToEdit = users.find(user => user.id === selectedUserId);
    if (userToEdit) {
        // Assuming you have input fields for the edited information, update them with the user's data
        document.getElementById('editNameInput').value = userToEdit.name;
        document.getElementById('editEmailInput').value = userToEdit.email;
        document.getElementById('editRoleInput').value = userToEdit.role;
        // Add similar lines for other fields
    }
}

function saveEditedUser() {
    if (selectedUserId !== null) {
        // Find the selected user in the array
        const userToEditIndex = users.findIndex(user => user.id === selectedUserId);

        // Update the user's information
        if (userToEditIndex !== -1) {
            // Assuming you have input fields for the edited information, update the user object
            users[userToEditIndex].name = document.getElementById('NameInput').value;
            users[userToEditIndex].email = document.getElementById('EmailInput').value;
            users[userToEditIndex].role = document.getElementById('RoleInput').value;
            // Add similar lines for other fields
        }

        // Clear the selected user after editing
        selectedUserId = null;

        // Update the UI or rerender the table
        renderTable();
    }
}

function deleteUser(userId) {
    console.log(`Deleting user with ID: ${userId}`);
    // Find the index of the user with the specified userId
    const userIndex = users.findIndex(user => user.id === userId);

    // If the user is found, remove them from the array
    if (userIndex !== -1) {
        users.splice(userIndex, 1);

        // Update the UI by re-rendering the table
        renderTable();
    }
}
// Initial data fetch and rendering
fetchData();
