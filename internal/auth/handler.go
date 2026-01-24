package auth

import (
	"time"

	"book_store_Go/internal/models"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type AuthHandler struct {
	userRepo models.UserRepository
}

func NewAuthHandler(repo models.UserRepository) *AuthHandler {
	return &AuthHandler{userRepo: repo}
}

func (h *AuthHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	user := &models.User{
		ID:        "mock-" + req.Email,
		Email:     req.Email,
		Username:  req.Username,
		IsPremium: false,
		CreatedAt: time.Now(),
	}

	if err := h.userRepo.Create(user); err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	user, err := h.userRepo.FindByEmail(req.Email)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login successful",
		"user":    user,
	})
}

func (h *AuthHandler) HandleGetMe(w http.ResponseWriter, r *http.Request) {
	email := r.Header.Get("X-User-Email")
	if email == "" {
		http.Error(w, "Missing X-User-Email header", http.StatusBadRequest)
		return
	}

	user, err := h.userRepo.FindByEmail(email)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) HandleGetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if len(id) <= 5 || id[:5] != "mock-" {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}
	email := id[5:]

	user, err := h.userRepo.FindByEmail(email)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
