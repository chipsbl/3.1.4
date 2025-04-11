let editModal; // Для модалки обновления
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

// Инициализация при полной загрузке страницы для модалки обновления
window.addEventListener('load', () => {

    const modalElement = document.getElementById('editModal');
    if (!modalElement) {
        console.error('Элемент модального окна не найден');
        return;
    }

    editModal = new bootstrap.Modal(modalElement);

    loadUsers();
});

// Загрузка всех пользователей для таблицы
function loadUsers() {
    fetch('/api/rest')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки пользователей');
            }
            return response.json();
        })
        .then(users => {
            renderUsersTable(users);
        })
        .catch(error => {
            console.error('Ошибка загрузки пользователей:', error);
        });
}

// Загрузка таблицы и ее данных
function renderUsersTable(users) {
    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = '';
    users.sort((a, b) => a.id - b.id);  // Для сортировки пользователей по айдишнику

    users.forEach(user => {
        const row = document.createElement('tr');
        const role = user.roles.map(r => r.name.replace('ROLE_', '')).join(', ');

        row.innerHTML = `
            <tr class="border-top">
                <td>${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.age}</td>
                <td>${role}</td>
                <td>
                    <button class="btn btn-success" onclick="editUser(${user.id})">Edit</button>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `;
        row.setAttribute('data-user-id', user.id);
        tableBody.appendChild(row);
    });
}


// Функция для редактирования пользователя
async function editUser(id) {
    try {
        const editModalElement = document.getElementById('editModal');
        const editForm = document.getElementById('editUserForm');

        const response = await fetch(`/api/rest/${id}`, {credentials: 'include'});
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const user = await response.json();

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editFirstName').value = user.firstName;
        document.getElementById('editLastName').value = user.lastName;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editAge').value = user.age;
        document.getElementById('editUsername').value = user.username;

        const rolesSelect = document.getElementById('editRoles');
        if (rolesSelect) {
            const userRoleIds = user.roles.map(role => role.id);

            Array.from(rolesSelect.options).forEach(option => {
                option.selected = userRoleIds.includes(parseInt(option.value));
            });
        }

        const editModal = new bootstrap.Modal(editModalElement);
        editModal.show();

        // Обработчик для редактирования пользователя (Сгружает данные из формы и обновляет юзера)
        editModalElement.addEventListener('shown.bs.modal', function () {
            editForm.onsubmit = async function (e) {
                e.preventDefault();

                try {
                    const csrfToken = document.querySelector('meta[name="_csrf"]').content;
                    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

                    const formData = {
                        username: document.getElementById('editUsername').value.trim(),
                        email: document.getElementById('editEmail').value.trim(),
                        firstName: document.getElementById('editFirstName').value.trim(),
                        lastName: document.getElementById('editLastName').value.trim(),
                        age: parseInt(document.getElementById('editAge').value),
                        roleIds: Array.from(document.getElementById('editRoles').selectedOptions)
                            .map(option => parseInt(option.value)), // Просто массив ID
                        password: document.getElementById('editPassword').value || null
                    };

                    const response = await fetch(`/api/rest/${document.getElementById('editUserId').value}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            [csrfHeader]: csrfToken
                        },
                        credentials: 'include',
                        body: JSON.stringify(formData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        if (response.status === 400) {
                            showValidationErrors(errorData, 'editUserForm');
                            return;
                        }
                        return;
                    }

                    if (response.ok) {
                        const updatedUser = await response.json();
                        updateUserInTable(updatedUser); //Функция обновления таблицы после редактирования юзера из другого JS файла
                        bootstrap.Modal.getInstance(editModalElement).hide();
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка сохранения: ' + error.message);
                }
            };
        });

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка: ' + error.message);
    }
}

// Получение токена
function getCsrfToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
}

// Обработчик для отпрафки формы создания нового юзера
document.getElementById('createUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        age: document.getElementById('Age').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        roles: Array.from(document.querySelector('[name="roles"]').selectedOptions)
            .map(option => ({id: option.value}))
    };

    fetch('/api/rest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken()
        },
        credentials: 'include',
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    if (response.status === 400) {
                        console.log(errorData)
                        showValidationErrors(errorData);
                        return null;
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            if (data) {                                // Условие что таб переключается только в случае успешного создания
                document.getElementById('createUserForm').reset();
                new bootstrap.Tab(document.querySelector('#pills-users-tab')).show();
                loadUsers();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
});

// Функция для открытия модалки с данными юзера для его удаления
function deleteUser(userId) {
    const user = getUserData(userId);

    document.getElementById('deleteId').value = user.id;
    document.getElementById('deleteFirstName').value = user.firstName;
    document.getElementById('deleteLastName').value = user.lastName;
    document.getElementById('deleteAge').value = user.age;
    document.getElementById('deleteEmail').value = user.email;
    document.getElementById('deleteUsername').value = user.username;

    const rolesSelect = document.getElementById('deleteRoles');
    Array.from(rolesSelect.options).forEach(option => {
        option.selected = user.roles.includes(option.value);
    });

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// Обработчик для отправки формы и удаления юзера
document.getElementById('deleteUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const userId = document.getElementById('deleteId').value;
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

    fetch(`/api/rest/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        }
    })
        .then(response => {
            if (response.ok) {
                // Закрываем модальное окно
                const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                deleteModal.hide()
                removeUserFromTable(userId);
            } else {
                alert('Ошибка при удалении пользователя');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Функция что бы получить данные юзера для форм из модалок
function getUserData(userId) {

    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    return {
        id: userId,
        firstName: row.cells[1].textContent,
        lastName: row.cells[2].textContent,
        age: row.cells[4].textContent,
        email: row.cells[3].textContent,
        roles: row.cells[5].textContent.split(',').map(r => r.trim())
    };
}

//Функция для отображения ошибок валидации
function showValidationErrors(errorData, formId = 'createUserForm') {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Форма с ID ${formId} не найдена!`);
        return;
    }

    form.querySelectorAll('.invalid-feedback').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });

    Object.entries(errorData).forEach(([fieldName, errorMessage]) => {
        const input = form.querySelector(`[name="${fieldName}"]`);

        if (formId === 'editUserForm' && fieldName === 'password' && document.getElementById('editPassword').value === '') {
            return;
        }

        if (input) {
            input.classList.add('is-invalid');
            const errorElement = input.nextElementSibling;

            if (errorElement && errorElement.classList.contains('invalid-feedback')) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }
        }
    });
}