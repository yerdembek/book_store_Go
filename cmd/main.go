package main

import (
	"book_store_Go/internal/auth"
	"book_store_Go/internal/repository"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	clientOptions := options.Client().ApplyURI("mongodb+srv://dreamTeam:beknur2007@cluster0.izobqen.mongodb.net/?appName=Cluster0")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Connection failed:", err)
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

	log.Println(" Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
