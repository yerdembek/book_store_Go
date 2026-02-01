package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

const (
	RoleUser             = "user"
	RoleBookPremium      = "book_premium"
	RoleGroupBookPremium = "group_book_premium"
	RoleAdmin            = "admin"
)

type User struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Email        string             `json:"email" bson:"email"`
	Username     string             `json:"username" bson:"username"`
	PasswordHash string             `json:"-" bson:"password_hash"`
	Role         string             `json:"role" bson:"role"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
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

// Интерфейс репозитория (немного обновим методы)
type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id string) (*User, error) // Добавим поиск по ID
}
