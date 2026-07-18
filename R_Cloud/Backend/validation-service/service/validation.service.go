package service

import "github.com/r-cloud/validation-service/validator"

type ValidationService struct{}

func NewValidationService() *ValidationService {
	return &ValidationService{}
}

func (s *ValidationService) Validate(repoDir string) validator.ValidationResult {
	return validator.Validate(repoDir)
}
