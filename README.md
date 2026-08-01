# Task Manager API

REST API для управления задачами с авторизацией пользователей. Каждый пользователь видит и управляет только своими задачами.

## Стек технологий

- **NestJS** — фреймворк на TypeScript
- **Prisma ORM** — работа с базой данных
- **PostgreSQL** — база данных
- **JWT + Passport.js** — авторизация
- **class-validator** — валидация входящих данных
- **Jest** — юнит-тестирование
- **Docker** — контейнеризация

## Возможности

- Регистрация и логин с хешированием паролей (bcrypt)
- JWT-авторизация с защитой роутов через Guards
- CRUD для задач (создание, чтение, обновление, удаление)
- Изоляция данных — пользователь не может читать/изменять чужие задачи
- Валидация входящих данных через DTO
- Юнит-тесты для бизнес-логики

## Технические детали, которые стоит отметить

- Кастомный декоратор `@CurrentUser()` для извлечения данных пользователя из JWT-токена
- Разграничение прав через `ForbiddenException` (403) отдельно от `NotFoundException` (404)
- Архитектура на модулях: `Auth`, `Users`, `Tasks`, `Prisma` — каждый со своей зоной ответственности

## Запуск локально

### Через Docker (рекомендуется)

```bash
git clone https://github.com/Tungusv89/nest-rest-api-prisma.git
cd nest-rest-api-prisma
cp .env.example .env
docker-compose up
```

API будет доступен на `http://localhost:3000`.

### Без Docker

Требования: Node.js 20+, PostgreSQL.

```bash
npm install
cp .env.example .env
# впиши свои значения DATABASE_URL и JWT_SECRET в .env

npx prisma migrate dev
npm run start:dev
```

## Переменные окружения

См. `.env.example` для полного списка. Основные:

| Переменная     | Описание                               |
| -------------- | -------------------------------------- |
| `DATABASE_URL` | Строка подключения к PostgreSQL        |
| `JWT_SECRET`   | Секретный ключ для подписи JWT-токенов |

## API Endpoints

### Auth

| Метод | Путь              | Описание                         |
| ----- | ----------------- | -------------------------------- |
| POST  | `/users/register` | Регистрация нового пользователя  |
| POST  | `/auth/login`     | Логин, возвращает `access_token` |

### Tasks (требуют заголовок `Authorization: Bearer <token>`)

| Метод  | Путь         | Описание                           |
| ------ | ------------ | ---------------------------------- |
| GET    | `/tasks`     | Список задач текущего пользователя |
| GET    | `/tasks/:id` | Получить одну задачу               |
| POST   | `/tasks`     | Создать задачу                     |
| PATCH  | `/tasks/:id` | Обновить задачу                    |
| DELETE | `/tasks/:id` | Удалить задачу                     |

## Тестирование

```bash
npm run test
```

## Демо

Живая версия: `<ссылка после деплоя>`

## Автор

Евгений Куликов — [LinkedIn](https://www.linkedin.com/in/john-kulikov-207227b3/) · [GitHub](https://github.com/Tungusv89) · [Telegram](https://t.me/coolikov_john)
