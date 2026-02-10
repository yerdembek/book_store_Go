package chat

import (
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	hub *Hub
	db  *mongo.Collection
}

func NewHandler(hub *Hub, db *mongo.Database) *Handler {
	return &Handler{
		hub: hub,
		db:  db.Collection("messages"),
	}
}

func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	ServeWs(h.hub, h.db, w, r)
}
