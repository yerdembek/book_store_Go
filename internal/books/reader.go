package books

import (
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
}

func NewReaderHandler(db *mongo.Database) *ReaderHandler {
	return &ReaderHandler{
		Collection: db.Collection("books"),
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
	bookID, _ := primitive.ObjectIDFromHex(vars["id"])

	var book struct {
		FilePath string `bson:"file_path"`
	}
	err := h.Collection.FindOne(context.TODO(), bson.M{"_id": bookID}).Decode(&book)

	if err != nil || book.FilePath == "" {
		http.Error(w, "File not found for this book", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, book.FilePath)
}
