package mock

import (
	"book_store_Go/internal/models"
	"errors"
	"sync"
)

type MockUserRepo struct {
	users map[string]*models.User
	mu    sync.RWMutex
}

func NewMockUserRepo() *MockUserRepo {
	return &MockUserRepo{
		users: make(map[string]*models.User),
	}
}

func (m *MockUserRepo) Create(user *models.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.users[user.Email] = user
	return nil
}

func (m *MockUserRepo) FindByEmail(email string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if user, ok := m.users[email]; ok {
		return user, nil
	}
	return nil, errors.New("user not found")
}
