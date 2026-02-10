package chat

import (
	"book_store_Go/internal/models"
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	hub      *Hub
	db       *mongo.Collection
	userRepo models.UserRepository
}

func NewHandler(hub *Hub, db *mongo.Database, userRepo models.UserRepository) *Handler {
	return &Handler{
		hub:      hub,
		db:       db.Collection("messages"),
		userRepo: userRepo,
	}
}

func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	ServeWs(h.hub, h.db, w, r)
}

func (h *Handler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	msgID := vars["id"]
	objID, err := primitive.ObjectIDFromHex(msgID)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.userRepo.FindByID(userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	var msg models.Message
	err = h.db.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&msg)
	if err != nil {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	isOwner := msg.Sender == user.Email
	isAdmin := user.Role == "admin"

	if !isOwner && !isAdmin {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	_, err = h.db.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		http.Error(w, "Failed to delete", http.StatusInternalServerError)
		return
	}

	broadcastMsg := map[string]string{
		"type": "delete_message",
		"id":   msgID,
	}
	jsonBytes, _ := json.Marshal(broadcastMsg)
	h.hub.broadcast <- jsonBytes

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Deleted"})
}
