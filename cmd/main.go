package main

import (
	"book_store_Go/internal/auth"
	"book_store_Go/internal/repository"
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
		log.Println("No .env file found")
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI is not set")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Connected to MongoDB!")

	db := client.Database("bookstore")

	userRepo := repository.NewUserRepository(db)

	authHandler := auth.NewAuthHandler(userRepo)

	r := mux.NewRouter()
	r.HandleFunc("/register", authHandler.HandleRegister).Methods("POST")
	r.HandleFunc("/login", authHandler.HandleLogin).Methods("POST")
	r.HandleFunc("/users/me", authHandler.HandleGetMe).Methods("GET")
	r.HandleFunc("/users/{id}", authHandler.HandleGetUserByID).Methods("GET")

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
