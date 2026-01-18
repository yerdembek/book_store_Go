package models

type Book struct {
	ID     uint   `gorm:"primaryKey"`
	Title  string `gorm:"not null"`
	Author string `gorm:"not null"`
	ISBN   string `gorm:"unique"`
	Year   int
}
