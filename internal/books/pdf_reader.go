package books

import (
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewPDFReaderHandler(db *mongo.Database) *ReaderHandler {
	return &ReaderHandler{
		Collection: db.Collection("books"),
	}
}

func (h *ReaderHandler) DownloadPDF(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookID, _ := primitive.ObjectIDFromHex(vars["id"])

	var book struct {
		FilePath string `bson:"file_path"`
	}
	err := h.Collection.FindOne(context.TODO(), bson.M{"_id": bookID}).Decode(&book)

	if err != nil || book.FilePath == "" {
		http.Error(w, "File not found for this book", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Disposition", "inline; filename=book.pdf")
	w.Header().Set("Content-Type", "application/pdf")

	http.ServeFile(w, r, book.FilePath)
}
