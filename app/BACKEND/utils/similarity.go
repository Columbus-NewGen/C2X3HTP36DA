package utils

import (
	"math"

	"github.com/gymmate/backend/models"
)

// Constants for vector similarity calculations
const (
	NumMuscles         = 22  // Total number of muscles in the database
	PrimaryWeight      = 1.0 // Weight for primary muscle involvement
	SecondaryWeight    = 0.5 // Weight for secondary muscle involvement
	StabilizerWeight   = 0.25 // Weight for stabilizer muscle involvement
)

// BuildExerciseVector creates a 22-dimensional vector from exercise_muscles data
// Each dimension represents a muscle (indexed by muscle_id - 1)
// Value = activation_percentage * involvement_weight
func BuildExerciseVector(exerciseMuscles []models.ExerciseMuscle) []float64 {
	vector := make([]float64, NumMuscles)

	for _, em := range exerciseMuscles {
		// Muscle IDs are 1-indexed, array is 0-indexed
		index := em.MuscleID - 1
		if index >= NumMuscles {
			continue // Skip invalid muscle IDs
		}

		// Determine weight based on involvement type
		var weight float64
		switch em.InvolvementType {
		case "primary":
			weight = PrimaryWeight
		case "secondary":
			weight = SecondaryWeight
		case "stabilizer":
			weight = StabilizerWeight
		default:
			weight = 0.0
		}

		// Calculate weighted activation value
		vector[index] = float64(em.ActivationPercentage) * weight
	}

	return vector
}

// CosineSimilarity calculates the cosine similarity between two vectors
// Returns a value between 0.0 (completely different) and 1.0 (identical)
// Formula: dotProduct / (magnitude1 * magnitude2)
func CosineSimilarity(v1, v2 []float64) float64 {
	if len(v1) != len(v2) {
		return 0.0
	}

	var dotProduct, magnitude1, magnitude2 float64

	for i := range len(v1) {
		dotProduct += v1[i] * v2[i]
		magnitude1 += v1[i] * v1[i]
		magnitude2 += v2[i] * v2[i]
	}

	magnitude1 = math.Sqrt(magnitude1)
	magnitude2 = math.Sqrt(magnitude2)

	// Avoid division by zero
	if magnitude1 == 0 || magnitude2 == 0 {
		return 0.0
	}

	return dotProduct / (magnitude1 * magnitude2)
}

// SimilarityScore converts cosine similarity (0.0-1.0) to a percentage score (0-100)
func SimilarityScore(cosineSim float64) int {
	return int(math.Round(cosineSim * 100))
}
