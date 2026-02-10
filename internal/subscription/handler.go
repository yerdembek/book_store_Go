package subscription

import (
	"book_store_Go/internal/models"
	"encoding/json"
	"net/http"
	"time"
)

// SubscriptionHandler handles subscription-related actions.
type SubscriptionHandler struct {
	userRepo models.UserRepository
}

func NewSubscriptionHandler(userRepo models.UserRepository) *SubscriptionHandler {
	return &SubscriptionHandler{
		userRepo: userRepo,
	}
}

// UpgradeSubscription upgrades user's subscription for 30 days.
func (h *SubscriptionHandler) UpgradeSubscription(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Subscription string `json:"subscription"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate subscription type
	if req.Subscription != models.SubReader && req.Subscription != models.SubCreator {
		http.Error(w, "Invalid subscription type", http.StatusBadRequest)
		return
	}

	expiresAt := time.Now().Add(30 * 24 * time.Hour)

	if err := h.userRepo.UpdateSubscription(userID, req.Subscription, expiresAt); err != nil {
		http.Error(w, "Failed to update subscription", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message":      "Subscription upgraded successfully",
		"subscription": req.Subscription,
		"expires_at":   expiresAt.Format(time.RFC3339),
	})
}
