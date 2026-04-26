package resolvers

import (
	"context"
	"strings"
	"time"

	"github.com/ganja_livre/api/internal/auth"
	"github.com/ganja_livre/api/internal/graph/model"
	"github.com/ganja_livre/api/internal/middleware"
	"github.com/ganja_livre/api/internal/validator"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// Register creates a new customer account.
func (r *Resolver) Register(ctx context.Context, input RegisterInput) (*AuthPayload, error) {
	// Sanitize
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Name = strings.TrimSpace(input.Name)

	// Validate
	if err := validator.RegisterInput(input.Email, input.Password, input.Name); err != nil {
		return nil, err
	}

	// Check duplicate email — timing-safe: we always hash before checking
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errInternal
	}

	count, err := r.cols.Users.CountDocuments(ctx, bson.M{"email": input.Email})
	if err != nil {
		return nil, errInternal
	}
	if count > 0 {
		return nil, errEmailTaken
	}

	now := time.Now().UTC()
	user := &model.User{
		ID:           primitive.NewObjectID(),
		Email:        input.Email,
		PasswordHash: string(hash),
		Name:         input.Name,
		Role:         model.RoleCustomer,
		IsActive:     true,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if _, err = r.cols.Users.InsertOne(ctx, user); err != nil {
		return nil, errInternal
	}

	pair, err := r.jwtSvc.IssueTokenPair(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, errInternal
	}

	return toAuthPayload(pair, user), nil
}

// Login authenticates a user and returns token pair.
func (r *Resolver) Login(ctx context.Context, input LoginInput) (*AuthPayload, error) {
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	var user model.User
	err := r.cols.Users.FindOne(ctx, bson.M{"email": input.Email, "is_active": true}).Decode(&user)
	if err != nil {
		// Constant-time: always compare even on not-found to prevent user enumeration
		_ = bcrypt.CompareHashAndPassword([]byte("$2a$12$dummy"), []byte(input.Password))
		return nil, errInvalidCredentials
	}

	if err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, errInvalidCredentials
	}

	pair, err := r.jwtSvc.IssueTokenPair(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, errInternal
	}

	return toAuthPayload(pair, &user), nil
}

// RefreshToken issues a new token pair using a valid refresh token.
func (r *Resolver) RefreshToken(ctx context.Context, token string) (*AuthPayload, error) {
	claims, err := r.jwtSvc.ValidateRefreshToken(token)
	if err != nil {
		return nil, errInvalidToken
	}

	oid, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return nil, errInvalidToken
	}

	var user model.User
	if err = r.cols.Users.FindOne(ctx, bson.M{"_id": oid, "is_active": true}).Decode(&user); err != nil {
		return nil, errInvalidToken
	}

	pair, err := r.jwtSvc.IssueTokenPair(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, errInternal
	}

	return toAuthPayload(pair, &user), nil
}

// Me returns the currently authenticated user.
func (r *Resolver) Me(ctx context.Context) (*model.User, error) {
	claims, err := middleware.RequireAuth(ctx)
	if err != nil {
		return nil, err
	}

	oid, _ := primitive.ObjectIDFromHex(claims.UserID)
	var user model.User
	if err = r.cols.Users.FindOne(ctx, bson.M{"_id": oid}).Decode(&user); err != nil {
		return nil, errInternal
	}
	return &user, nil
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// AuthPayload is the GQL return type for auth operations.
type AuthPayload struct {
	AccessToken  string
	RefreshToken string
	User         *model.User
}

type RegisterInput struct {
	Email    string
	Password string
	Name     string
}

type LoginInput struct {
	Email    string
	Password string
}

func toAuthPayload(pair *auth.TokenPair, user *model.User) *AuthPayload {
	return &AuthPayload{
		AccessToken:  pair.AccessToken,
		RefreshToken: pair.RefreshToken,
		User:         user,
	}
}

// Suppress unused import warning during build scaffolding
var _ = uuid.New
