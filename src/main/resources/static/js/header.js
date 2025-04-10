function loadCurrentUserInfo() {
    fetch('/api/rest/current-user')  // Нужно создать этот endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            return response.json();
        })
        .then(user => {
            const userInfoDiv = document.getElementById('userInfo');

            // Создаем элементы для отображения информации
            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'navbar-brand me-1 ps-2 h1';
            usernameSpan.textContent = user.username;

            const rolesSpan = document.createElement('span');
            rolesSpan.className = 'navbar-brand';
            rolesSpan.textContent = `with roles: ${user.roles.map(r => r.name.replace('ROLE_', '')).join(', ')}`;

            // Очищаем и добавляем новые элементы
            userInfoDiv.innerHTML = '';
            userInfoDiv.appendChild(usernameSpan);
            userInfoDiv.appendChild(rolesSpan);
        })
        .catch(error => {
            console.error('Ошибка загрузки данных пользователя:', error);
        });
}

// Обработчик для кнопки Logout
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();

    // Получаем CSRF токен
    const csrfToken = document.querySelector('meta[name="_csrf"]').content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

    fetch('/logout', {
        method: 'POST',
        headers: {
            [csrfHeader]: csrfToken
        },
        credentials: 'include'
    })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;  // Перенаправляем на страницу логина
            }
        })
        .catch(error => {
            console.error('Ошибка при выходе:', error);
        });
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentUserInfo();
});