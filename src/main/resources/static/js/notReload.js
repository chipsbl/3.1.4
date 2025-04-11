//Функция для обновления данных таблицы после обновления пользователя
function updateUserInTable(updatedUser) {
    const row = document.querySelector(`tr[data-user-id="${updatedUser.id}"]`);
    if (row) {
        const roleNames = updatedUser.roles.map(r => r.name.replace('ROLE_', '')).join(', ');
        row.innerHTML = `
            <td>${updatedUser.id}</td>
            <td>${updatedUser.firstName}</td>
            <td>${updatedUser.lastName}</td>
            <td>${updatedUser.email}</td>
            <td>${updatedUser.age}</td>
            <td>${roleNames}</td>
            <td>
                <button class="btn btn-success" onclick="editUser(${updatedUser.id})">Edit</button>
            </td>
            <td>
                <button class="btn btn-danger" onclick="deleteUser(${updatedUser.id})">Delete</button>
            </td>
        `;
        row.setAttribute('data-user-id', updatedUser.id);
    }
}

// Функция для удаления строки после удаления пользователя
function removeUserFromTable(userId) {
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    if (row) {
        row.remove();
    }
}