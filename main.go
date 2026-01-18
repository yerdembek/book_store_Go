package main

import (
	"book_store_Go/models"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"

	"book_store_Go/handlers"
)

var db *gorm.DB

func initDB() {
	dsn := "host=localhost user=postgres password=123AAss dbname=book_store_db port=5432 sslmode=disable"

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Не могу подключиться к БД: " + err.Error())
	}

	db.AutoMigrate(&models.Book{})
	log.Println("✅ БД готова!")
}

func main() {
	initDB()

	handlers.SetDB(db)

	r := gin.Default()
	r.POST("/books", handlers.CreateBook)
	r.GET("/books", handlers.GetBooks)
	r.GET("/books/:id", handlers.GetBook)
	r.PUT("/books/:id", handlers.UpdateBook)
	r.DELETE("/books/:id", handlers.DeleteBook)

	r.Run(":8080")
}
