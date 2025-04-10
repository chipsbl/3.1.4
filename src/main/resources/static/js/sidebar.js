// Основная функция загрузки sidebar
async function loadUsersSidebar() {
    try {
        // Получаем список видимых пользователей
        const response = await fetch('/api/rest/visible-users', {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Ошибка загрузки пользователей');

        const users = await response.json();
        renderSidebar(users);

    } catch (error) {
        console.error('Ошибка sidebar:', error);
        document.getElementById('usersSidebar').innerHTML = `
            <li class="nav-item text-danger">Ошибка загрузки</li>
        `;
    }
}

// Отрисовка sidebar
async function renderSidebar(users) {
    const sidebar = document.getElementById('usersSidebar');
    sidebar.innerHTML = '';

    // Получаем текущего пользователя
    const currentUser = await fetchCurrentUser();
    const isAdmin = currentUser.roles.some(r => r.name === 'ROLE_ADMIN');
    const currentPath = window.location.pathname;

    users.forEach(user => {
        const isCurrentUser = user.id === currentUser.id;

        // Создаем элементы только для текущего пользователя
        if (isCurrentUser) {
            // Если текущий пользователь - админ, создаем две ссылки
            if (isAdmin) {
                // Ссылка "Admin"
                const adminItem = document.createElement('li');
                adminItem.className = 'nav-item';

                const adminLink = document.createElement('a');
                adminLink.className = 'nav-link';
                adminLink.href = '/admin';
                adminLink.textContent = 'Admin';

                if (currentPath === '/admin') {
                    adminLink.classList.add('active');
                    adminLink.setAttribute('aria-current', 'page');
                }

                adminItem.appendChild(adminLink);
                sidebar.appendChild(adminItem);

                // Ссылка "User"
                const userItem = document.createElement('li');
                userItem.className = 'nav-item';

                const userLink = document.createElement('a');
                userLink.className = 'nav-link';
                userLink.href = '/user';
                userLink.textContent = 'User';

                if (currentPath === '/user') {
                    userLink.classList.add('active');
                    userLink.setAttribute('aria-current', 'page');
                }

                userItem.appendChild(userLink);
                sidebar.appendChild(userItem);
            }
            // Если обычный пользователь - только одну ссылку
            else {
                const userItem = document.createElement('li');
                userItem.className = 'nav-item';

                const userLink = document.createElement('a');
                userLink.className = 'nav-link';
                userLink.href = '/user';
                userLink.textContent = 'User';

                if (currentPath === '/user') {
                    userLink.classList.add('active');
                    userLink.setAttribute('aria-current', 'page');
                }

                userItem.appendChild(userLink);
                sidebar.appendChild(userItem);
            }
        }
    });
}

// Получение текущего пользователя
async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/rest/current-user', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки пользователя');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', loadUsersSidebar);