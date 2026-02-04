package books

import (
	"book_store_Go/internal/models"
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	//
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

// GET /books/{id}
func (h *CatalogHandler) GetBookByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	var book models.Book
	err = h.Collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&book)
	if err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(book)
}
