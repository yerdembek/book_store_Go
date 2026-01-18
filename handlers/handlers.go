package handlers

import (
	"book_store_Go/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"net/http"
	"strconv"
)

var db *gorm.DB

func SetDB(database *gorm.DB) { // Сеттер
	db = database
}

func CreateBook(c *gin.Context) {
	var input models.Book
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&input)
	c.JSON(http.StatusCreated, input)
}

func GetBooks(c *gin.Context) {
	var books []models.Book
	author := c.Query("author")
	if author != "" {
		db.Where("author LIKE ?", "%"+author+"%").Find(&books)
	} else {
		db.Find(&books)
	}
	c.JSON(http.StatusOK, books)
}

func GetBook(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var book models.Book
	db.First(&book, id)
	c.JSON(http.StatusOK, book)
}

func UpdateBook(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var book models.Book
	db.First(&book, id)

	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&book)
	c.JSON(http.StatusOK, book)
}

func DeleteBook(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db.Delete(&models.Book{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Книга удалена"})
}
