package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID            int       `json:"id"`
	GoogleSubject string    `json:"google_subject" db:"google_subject"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	Picture       string    `json:"picture"`
	Role          string    `json:"role"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}
func (r *UserRepository) FindByGoogleSubject(googleSubject string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, google_subject, email, name, picture, role, created_at, updated_at
		FROM users
		WHERE google_subject = $1
	`
	err := r.db.QueryRow(query, googleSubject).Scan(
		&user.ID,
		&user.GoogleSubject,
		&user.Email,
		&user.Name,
		&user.Picture,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) FindByEmail(email string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, google_subject, email, name, picture, role, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.GoogleSubject,
		&user.Email,
		&user.Name,
		&user.Picture,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) Create(user *User) error {
	query := `
		INSERT INTO users (google_subject, email, name, picture, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(
		query,
		user.GoogleSubject,
		user.Email,
		user.Name,
		user.Picture,
		user.Role,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *UserRepository) Update(user *User) error {
	query := `
		UPDATE users
		SET google_subject = $1, email = $2, name = $3, picture = $4, role = $5
		WHERE id = $6
		RETURNING updated_at
	`
	return r.db.QueryRow(
		query,
		user.GoogleSubject,
		user.Email,
		user.Name,
		user.Picture,
		user.Role,
		user.ID,
	).Scan(&user.UpdatedAt)
}

func (r *UserRepository) Delete(id int) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
