package models

import "time"

// User — модель пользователя
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	IsPremium    bool      `json:"is_premium"`
	CreatedAt    time.Time `json:"created_at"`
	PasswordHash string    `json:"-"`
}

// UserRepository — интерфейс для работы с пользователями
type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
}
