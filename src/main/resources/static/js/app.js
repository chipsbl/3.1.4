let editModal;

document.addEventListener('DOMContentLoaded', () => {
    loadUsers(); // Загружаем данные при открытии страницы
});

// Инициализация при полной загрузке страницы
window.addEventListener('load', () => {
    // 1. Проверяем, что Bootstrap загружен
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap не загружен!');
        return;
    }

    // 2. Находим элемент модального окна
    const modalElement = document.getElementById('editModal');
    if (!modalElement) {
        console.error('Элемент модального окна не найден!');
        return;
    }

    // 3. Инициализируем модальное окно
    editModal = new bootstrap.Modal(modalElement);

    // 4. Загружаем пользователей
    loadUsers();
});

// Загрузка пользователей из REST API
function loadUsers() {
    fetch('/api/rest')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(users => {
            renderUsersTable(users); // Отрисовываем таблицу
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
}

// Отрисовка таблицы
function renderUsersTable(users) {
    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = ''; // Очищаем старые данные
    users.sort((a, b) => a.id - b.id);  // Сортировка по возрастанию ID

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


// Пример функций для кнопок
async function editUser(id) {
    try {
        // 1. Получаем элементы
        const editModalElement = document.getElementById('editModal');
        const editForm = document.getElementById('editUserForm');

        if (!editModalElement || !editForm) {
            throw new Error('Не найдены необходимые элементы');
        }

        // 2. Получаем данные пользователя
        const response = await fetch(`/api/rest/${id}`, {credentials: 'include'});
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const user = await response.json();

        // 3. Заполняем форму
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editFirstName').value = user.firstName;
        document.getElementById('editLastName').value = user.lastName;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editAge').value = user.age;
        document.getElementById('editUsername').value = user.username;

        // 4. Настройка ролей
        const rolesSelect = document.getElementById('editRoles');
        if (rolesSelect) {
            const userRoleIds = user.roles.map(role => role.id);

            // Устанавливаем selected для соответствующих ролей
            Array.from(rolesSelect.options).forEach(option => {
                option.selected = userRoleIds.includes(parseInt(option.value));
            });
        }

        // 5. Показываем модальное окно
        const editModal = new bootstrap.Modal(editModalElement);
        editModal.show();

        // 6. Обработчик формы (после открытия модалки)
        editModalElement.addEventListener('shown.bs.modal', function () {
            editForm.onsubmit = async function (e) {
                e.preventDefault();

                try {
                    // 1. Получаем CSRF-токен
                    const csrfToken = document.querySelector('meta[name="_csrf"]').content;
                    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

                    // 2. Собираем данные (ключевое изменение в формате ролей)
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

                    console.log('Отправляемые данные:', formData); // Для отладки

                    // 3. Отправка запроса
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
                        // Для других ошибок показываем модальное окно
                        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                        document.getElementById('errorMessage').textContent = errorData.message || 'Произошла ошибка';
                        errorModal.show();
                        return;
                    }

                    location.reload();
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

// Получаем CSRF-токен из cookies
function getCsrfToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
}

// Обработчик отправки формы
document.getElementById('createUserForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Предотвращаем стандартную отправку

    // Собираем данные формы
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

    // Отправляем данные на сервер
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
                    }
                    throw new Error(errorData.message || 'Ошибка создания пользователя');
                });
            }
            return response.json();
        })
        .then(data => {
            // Очищаем форму
            document.getElementById('createUserForm').reset();
            // Переключаемся на вкладку с таблицей
            new bootstrap.Tab(document.querySelector('#pills-users-tab')).show();
            // Обновляем таблицу
            loadUsers();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
});

// Функция для открытия модального окна с данными пользователя
function deleteUser(userId) {
    // Получаем данные пользователя (это может быть AJAX запрос или данные из таблицы)
    const user = getUserData(userId); // Нужно реализовать эту функцию

    // Заполняем форму в модальном окне
    document.getElementById('deleteId').value = user.id;
    document.getElementById('deleteFirstName').value = user.firstName;
    document.getElementById('deleteLastName').value = user.lastName;
    document.getElementById('deleteAge').value = user.age;
    document.getElementById('deleteEmail').value = user.email;
    document.getElementById('deleteUsername').value = user.username;

    // Устанавливаем выбранные роли
    const rolesSelect = document.getElementById('deleteRoles');
    Array.from(rolesSelect.options).forEach(option => {
        option.selected = user.roles.includes(option.value);
    });

    // Показываем модальное окно
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// Обработчик отправки формы удаления
document.getElementById('deleteUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const userId = document.getElementById('deleteId').value;
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

    // Отправляем AJAX запрос на удаление
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
                deleteModal.hide();

                // Обновляем таблицу или удаляем строку
                location.reload(); // Или более точечное обновление
            } else {
                alert('Ошибка при удалении пользователя');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Вспомогательная функция для получения данных пользователя
function getUserData(userId) {
    // Это может быть AJAX запрос или поиск данных в таблице
    // Пример реализации через поиск в таблице:
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

//Функция для отображение ошибок валидации
function showValidationErrors(errorData, formId = 'createUserForm') {
    // 1. Находим форму, в которой показываем ошибки
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Форма с ID ${formId} не найдена!`);
        return;
    }

    // 2. Сбрасываем предыдущие ошибки только внутри этой формы
    form.querySelectorAll('.invalid-feedback').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });

    // 3. Обрабатываем ошибки
    Object.entries(errorData).forEach(([fieldName, errorMessage]) => {
        // Ищем поле ТОЛЬКО внутри формы
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
            } else {
                console.warn(`Для поля ${fieldName} не найден блок .invalid-feedback`);
            }
        } else {
            console.warn(`Поле ${fieldName} не найдено в форме ${formId}`);
        }
    });
}