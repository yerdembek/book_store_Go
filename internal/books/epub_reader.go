package books

import (
	"context"
	"net/http"
	"path/filepath"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewEPUBReaderHandler(db *mongo.Database) *ReaderHandler {
	return &ReaderHandler{
		Collection: db.Collection("books"),
	}
}

func (h *ReaderHandler) DownloadEPUB(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookID, err := primitive.ObjectIDFromHex(vars["id"])
	if err != nil {
		http.Error(w, "Invalid Book ID", http.StatusBadRequest)
		return
	}

	var book struct {
		FilePath string `bson:"file_path"` // Используем общее поле
	}
	err = h.Collection.FindOne(context.TODO(), bson.M{"_id": bookID}).Decode(&book)

	if err != nil || book.FilePath == "" {
		http.Error(w, "EPUB file not found for this book", http.StatusNotFound)
		return
	}

	if filepath.Ext(book.FilePath) != ".epub" {
		http.Error(w, "Stored file is not an EPUB format", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Disposition", "inline; filename=book.epub")
	w.Header().Set("Content-Type", "application/epub+zip")

	http.ServeFile(w, r, book.FilePath)
}
