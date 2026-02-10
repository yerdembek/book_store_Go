package books

import (
	"book_store_Go/internal/models"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ReaderHandler struct {
	Collection *mongo.Collection
	UserRepo   models.UserRepository
}

func NewReaderHandler(db *mongo.Database, userRepo models.UserRepository) *ReaderHandler {
	return &ReaderHandler{
		Collection: db.Collection("books"),
		UserRepo:   userRepo,
	}
}

func (h *ReaderHandler) UploadPDF(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid Book ID", http.StatusBadRequest)
		return
	}

	r.ParseMultipartForm(10 << 20)
	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	filename := fmt.Sprintf("book_%s_%d%s", vars["id"], time.Now().Unix(), filepath.Ext(handler.Filename))
	filePath := filepath.Join("storage", "books", filename)

	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Server Error: Unable to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Server Error: Failed to write file", http.StatusInternalServerError)
		return
	}

	filter := bson.M{"_id": bookID}
	update := bson.M{"$set": bson.M{"file_path": filePath}}

	_, err = h.Collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		http.Error(w, "Database Error", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("File uploaded successfully"))
}

func (h *ReaderHandler) DownloadPDF(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	var book models.Book
	err = h.Collection.FindOne(context.TODO(), bson.M{"_id": bookID}).Decode(&book)
	if err != nil || book.FilePath == "" {
		http.Error(w, "File not found for this book", http.StatusNotFound)
		return
	}

	// Проверка подписки
	if book.IsPremium {
		userID, ok := r.Context().Value("userID").(string)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		user, err := h.UserRepo.FindByID(userID)
		if err != nil || !user.CanReadPremium() {
			http.Error(w, "Premium subscription required", http.StatusForbidden)
			return
		}
	}

	w.Header().Set("Content-Disposition", "inline; filename=book.pdf")
	w.Header().Set("Content-Type", "application/pdf")
	http.ServeFile(w, r, book.FilePath)
}
