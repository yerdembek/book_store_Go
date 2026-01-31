package models

import "time"

type User struct {
	ID           string    `json:"id" bson:"_id,omitempty"`
	Email        string    `json:"email" bson:"email"`
	Username     string    `json:"username" bson:"username"`
	IsPremium    bool      `json:"is_premium" bson:"is_premium"`
	CreatedAt    time.Time `json:"created_at" bson:"created_at"`
	PasswordHash string    `json:"-" bson:"password_hash"`
}

type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	IsPremium bool      `json:"is_premium"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		Username:  u.Username,
		IsPremium: u.IsPremium,
		CreatedAt: u.CreatedAt,
	}
}

type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
}
