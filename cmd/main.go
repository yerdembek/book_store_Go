package main

//test
import (
	"book_store_Go/internal/auth"
	"book_store_Go/internal/middleware"

	"book_store_Go/internal/books"
	"book_store_Go/internal/repository"

	"book_store_Go/internal/profile"
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Предупреждение: .env файл не найден")
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("MongoDB недоступна:", err)
	}
	log.Println("Успешное подключение к MongoDB!")

	db := client.Database("bookstore")

	userRepo := repository.NewUserRepository(db)
	authHandler := auth.NewAuthHandler(userRepo)
	catalogHandler := books.NewCatalogHandler(db)
	readerHandler := books.NewReaderHandler(db)
	profileHandler := profile.NewProfileHandler(userRepo)

	r := mux.NewRouter()

	r.HandleFunc("/api/register", authHandler.HandleRegister).Methods("POST")
	r.HandleFunc("/api/login", authHandler.HandleLogin).Methods("POST")

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware)

	api.HandleFunc("/me", authHandler.HandleGetMe).Methods("GET")
	//
	api.HandleFunc("/profile", profileHandler.UpdateProfile).Methods("PUT")

	r.HandleFunc("/books", catalogHandler.GetBooks).Methods("GET")
	r.HandleFunc("/books", catalogHandler.CreateBook).Methods("POST")

	r.HandleFunc("/books/{id}/upload", readerHandler.UploadPDF).Methods("POST")
	r.HandleFunc("/books/{id}/download", readerHandler.DownloadPDF).Methods("GET")

	// Пример будущего функционала:
	// api.HandleFunc("/books/premium", bookHandler.GetPremiumBooks).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Сервер запущен на http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
