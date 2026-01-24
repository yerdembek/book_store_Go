package main

import (
	"book_store_Go/internal/auth"
	"book_store_Go/internal/mock"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	userRepo := mock.NewMockUserRepo()

	authHandler := auth.NewAuthHandler(userRepo)

	r := mux.NewRouter()
	r.HandleFunc("/register", authHandler.HandleRegister).Methods("POST")
	r.HandleFunc("/login", authHandler.HandleLogin).Methods("POST")

	r.HandleFunc("/users/me", authHandler.HandleGetMe).Methods("GET")
	r.HandleFunc("/users/{id}", authHandler.HandleGetUserByID).Methods("GET")

	log.Println("🚀 Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
