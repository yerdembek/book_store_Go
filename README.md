# book_store_Go
## Что изменилось и что добавил
 Hа данном этапе проект может выполнять простые запросы такие как:
```bush
POST /books     - Создать книгу
GET /books      - Все книги  
GET /books?author=Orwell  - Поиск по автору
GET /books/1    - Книга по ID
PUT /books/1    - Обновить
DELETE /books/1 - Удалить
```

## Зависимости и библиотеки
1. **Gin (github.com/gin-gonic/gin)**
   
```bush
r.POST("/books", handlers.CreateBook)
r.GET("/books", handlers.GetBooks)
```

* Веб-фреймворк для REST API

* Быстрый роутинг (/books/:id)

* JSON парсинг (c.ShouldBindJSON)

* Middleware (CORS, логирование, rate limiting)

2. **GORM (gorm.io/gorm)**

```bush
db.AutoMigrate(&models.Book{})
db.Create(&book)
db.Where("author LIKE ?", "%Orwell%").Find(&books)
```

* ORM — превращает SQL в Go код

* Автоматические миграции таблиц

* CRUD операции без сырого SQL

* Поддержка отношений (книги ↔ авторы)

3. PostgreSQL драйвер (gorm.io/driver/postgres)

```bush
dsn := "host=localhost user=postgres password=123AAss dbname=book_store_db"
```

* Соединяет GORM с PostgreSQL

* Парсит connection string

* Connection pooling (много запросов = 1 подключение)

## Памятка для команды

1. go.sum не трогать он нужен что бы зависимости и библиотеки устанавливались корректно.
2. Как обновить:
```bush
go get -u ./...                   # Обновить все
go mod tidy                       # Удалить неиспользуемые
```
