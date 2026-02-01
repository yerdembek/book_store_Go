package utils

import (
	"fmt"
	"time"
)

func SendWelcomeEmail(userEmail string, username string) {
	fmt.Printf("Начинаем отправку письма для %s...\n", userEmail)
	time.Sleep(3 * time.Second)

	fmt.Printf("Приветственное письмо успешно отправлено пользователю %s (%s)!\n", username, userEmail)
}
