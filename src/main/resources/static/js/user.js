// Функция для загрузки и отображения данных пользователя
async function loadUserData() {
    try {

        // Делаем запрос к REST API
        const response = await fetch(`/api/rest/user`);

        if (!response.ok) {
            throw new Error('Пользователь не найден');
        }

        const user = await response.json();

        // Заполняем таблицу
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = ''; // Очищаем предыдущие данные

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.age}</td>
            <td>${user.roles.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
        `;

        tbody.appendChild(row);

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Можно показать сообщение об ошибке пользователю
        alert(error.message);
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', loadUserData);