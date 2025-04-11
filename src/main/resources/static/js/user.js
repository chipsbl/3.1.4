// Функция для загрузки таблица конкретного пользователя
async function loadUserData() {
    try {
        const response = await fetch(`/api/rest/current-user`);
        if (!response.ok) {
            throw new Error('Пользователь не найден');
        }
        const user = await response.json();
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';
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
        alert(error.message);
    }
}
document.addEventListener('DOMContentLoaded', loadUserData);