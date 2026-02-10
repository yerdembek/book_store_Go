package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	RoleUser             = "user"
	RoleBookPremium      = "book_premium"
	RoleGroupBookPremium = "group_book_premium"
	RoleAdmin            = "admin"
)

const (
	SubNone    = "none"
	SubReader  = "reader"
	SubCreator = "creator"
)

type User struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Email        string             `json:"email" bson:"email"`
	Username     string             `json:"username" bson:"username"`
	PasswordHash string             `json:"-" bson:"password_hash"`
	Role         string             `json:"role" bson:"role"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
	Subscription string             `json:"subscription" bson:"subscription"`
	SubExpiresAt time.Time          `json:"sub_expires_at" bson:"sub_expires_at"`
}

type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID.Hex(),
		Email:     u.Email,
		Username:  u.Username,
		Role:      u.Role,
		CreatedAt: u.CreatedAt,
	}
}

func (u *User) IsSubActive() bool {
	return time.Now().Before(u.SubExpiresAt)
}

func (u *User) CanReadPremium() bool {
	if !u.IsSubActive() {
		return false
	}
	return u.Subscription == SubReader || u.Subscription == SubCreator
}

func (u *User) CanCreateChats() bool {
	if !u.IsSubActive() {
		return false
	}
	return u.Subscription == SubCreator
}

// Интерфейс репозитория (немного обновим методы)
type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id string) (*User, error) // Добавим поиск по ID

	// Extended to support profile management (update profile, change password, delete account).
	UpdateUsername(id string, username string) error
	DeleteByID(id string) error
	UpdatePassword(id string, passwordHash string) error

	UpdateSubscription(id string, subscription string, expiresAt time.Time) error
}
