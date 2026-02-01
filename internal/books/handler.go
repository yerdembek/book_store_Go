package books

import (
	"book_store_Go/internal/models"
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CatalogHandler struct {
	Collection *mongo.Collection
}

func NewCatalogHandler(db *mongo.Database) *CatalogHandler {
	return &CatalogHandler{
		Collection: db.Collection("books"),
	}
}

func (h *CatalogHandler) GetBooks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	opts := options.Find().SetSort(bson.D{{Key: "_id", Value: -1}})

	cursor, _ := h.Collection.Find(context.TODO(), bson.M{}, opts)
	defer cursor.Close(context.TODO())

	var books []models.Book
	cursor.All(context.TODO(), &books)

	if books == nil {
		books = []models.Book{}
	}
	json.NewEncoder(w).Encode(books)
}

func (h *CatalogHandler) CreateBook(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var book models.Book
	json.NewDecoder(r.Body).Decode(&book)

	result, _ := h.Collection.InsertOne(context.TODO(), book)
	json.NewEncoder(w).Encode(result)
}
