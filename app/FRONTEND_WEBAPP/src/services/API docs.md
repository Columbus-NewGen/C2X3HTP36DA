# API Documentation

## **AuthAPI**
📍 `src/services/AuthAPI.ts`

### POST `/api/v1/auth/login`
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "message": "string",
  "token": "string",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "role": "root | admin | trainer | user",
    "status": "ACTIVE | SUSPENDED",
    "image_url": "string | null",
    "image_full_url": "string | null",
    "trainer": {
      "id": "number",
      "name": "string",
      "role": "string"
    } | null
  }
}
```

### POST `/api/v1/auth/register`
**Request:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```
**Response:**
```json
{
  "message": "string",
  "token": "string",
  "user": { /* Same as login */ }
}
```

### GET `/api/v1/auth/me`
**Response:**
```json
{
  "user": { /* Same as login user object */ }
}
```

### POST `/api/v1/auth/logout`
**Response:**
```json
{
  "message": "string"
}
```

---

## **UsersAPI**
📍 `src/services/UsersAPI.ts`

### GET `/api/v1/users/{id}`
**Response:**
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "role": "string",
  "status": "string",
  "image_url": "string | null",
  "image_full_url": "string | null",
  "date_of_birth": "string | null",
  "gender": "string | null",
  "height_cm": "number | null",
  "fitness_level": "string | null",
  "fitness_goal": "string | null",
  "phone": "string | null",
  "bio": "string | null",
  "trainer": { /* trainer object */ } | null
}
```

### PUT `/api/v1/users/{id}`
**Request:**
```json
{
  "name": "string",
  "email": "string",
  "date_of_birth": "string | null",
  "gender": "string | null",
  "height_cm": "number | null",
  "fitness_level": "string | null",
  "fitness_goal": "string | null",
  "phone": "string | null",
  "bio": "string | null"
}
```
**Response:**
```json
{
  "message": "string",
  "user": { /* Updated user object */ }
}
```

### POST `/api/v1/users/{id}/profile-image`
**Request:** FormData with `image` file
**Response:**
```json
{
  "message": "string",
  "image_url": "string",
  "image_full_url": "string"
}
```

### GET `/api/v1/users/{id}/weight`
**Response:**
```json
{
  "weights": [
    {
      "id": "number",
      "user_id": "number",
      "weight_kg": "number",
      "recorded_at": "string (ISO date)",
      "notes": "string | null"
    }
  ]
}
```

### POST `/api/v1/users/{id}/weight`
**Request:**
```json
{
  "weight_kg": "number",
  "recorded_at": "string (ISO date)",
  "notes": "string | null"
}
```
**Response:**
```json
{
  "message": "string",
  "weight": { /* Created weight object */ }
}
```

### DELETE `/api/v1/users/{userId}/weight/{id}`
**Response:**
```json
{
  "message": "string"
}
```

### GET `/api/v1/users/me/progress`
**Response:**
```json
{
  "workout_stats": {
    "total_workouts": "number",
    "total_volume_kg": "number",
    "total_duration_minutes": "number",
    "avg_duration_minutes": "number"
  },
  "exercise_prs": [
    {
      "exercise_id": "number",
      "exercise_name": "string",
      "max_weight_kg": "number",
      "max_reps": "number",
      "achieved_at": "string (ISO date)"
    }
  ],
  "muscle_distribution": [
    {
      "muscle_group": "string",
      "total_volume_kg": "number",
      "workout_count": "number"
    }
  ]
}
```

### GET `/api/v1/users/me/gamification`
**Response:**
```json
{
  "user_id": "number",
  "total_xp": "number",
  "current_level": "number",
  "next_level_xp": "number",
  "xp_progress": "number",
  "xp_to_next_level": "number",
  "current_streak": "number",
  "longest_streak": "number",
  "last_workout_date": "string (ISO date)",
  "weekly_target": "number",
  "weekly_completed": "number",
  "total_workouts": "number",
  "badges": [
    {
      "id": "number",
      "name": "string",
      "display_name": "string",
      "description": "string",
      "icon_url": "string | null",
      "earned_at": "string (ISO date) | null"
    }
  ],
  "recent_xp_events": [
    {
      "id": "number",
      "event_type": "WORKOUT_COMPLETED | STREAK_BONUS | BADGE_EARNED | PROGRAM_COMPLETED",
      "xp_amount": "number",
      "description": "string",
      "created_at": "string (ISO date)"
    }
  ]
}
```

### GET `/api/v1/users/me/gamification/badges`
**Response:**
```json
{
  "badges": [ /* Array of badge objects */ ]
}
```

---

## **LeaderboardAPI**
📍 `src/services/LeaderboardAPI.ts`

### GET `/api/v1/leaderboard?type={volume|program|streak}&period={week|month|all}`
**Response:**
```json
{
  "rankings": [
    {
      "rank": "number",
      "user_id": "number",
      "user_name": "string",
      "user_image_url": "string | null",
      "value": "number",
      "level": "number"
    }
  ],
  "current_user_rank": {
    "rank": "number",
    "value": "number"
  } | null
}
```

---

## **ExerciseAPI**
📍 `src/services/ExerciseAPI.ts`

### GET `/api/v1/exercises?page={number}&page_size={number}&sort_by={name|created_at}&sort_order={asc|desc}`
**Response:**
```json
{
  "exercises": [
    {
      "id": "number",
      "name": "string",
      "description": "string | null",
      "image_url": "string | null",
      "image_full_url": "string | null",
      "video_url": "string | null",
      "primary_muscles": ["string"],
      "secondary_muscles": ["string"],
      "equipment": ["string"],
      "difficulty": "beginner | intermediate | advanced",
      "instructions": ["string"],
      "created_at": "string (ISO date)"
    }
  ],
  "total": "number",
  "page": "number",
  "page_size": "number"
}
```

### POST `/api/v1/exercises`
**Request:**
```json
{
  "name": "string",
  "description": "string | null",
  "image_url": "string | null",
  "video_url": "string | null",
  "primary_muscles": ["string"],
  "secondary_muscles": ["string"],
  "equipment": ["string"],
  "difficulty": "beginner | intermediate | advanced",
  "instructions": ["string"]
}
```
**Response:**
```json
{
  "message": "string",
  "exercise": { /* Created exercise object */ }
}
```

### GET `/api/v1/exercises/{id}`
**Response:**
```json
{
  "exercise": { /* Exercise object */ }
}
```

### PUT `/api/v1/exercises/{id}`
**Request:** Same as POST
**Response:**
```json
{
  "message": "string",
  "exercise": { /* Updated exercise object */ }
}
```

### DELETE `/api/v1/exercises/{id}`
**Response:**
```json
{
  "message": "string"
}
```

### GET `/api/v1/exercises/{id}/substitutes`
**Response:**
```json
{
  "substitutes": [ /* Array of exercise objects */ ]
}
```

---

## **WorkoutsAPI**
📍 `src/services/workoutsApi.ts`

### GET `/api/v1/users/{userId}/scheduled-workouts?start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}`
**Response:**
```json
{
  "scheduled_workouts": [
    {
      "id": "number",
      "user_program_id": "number",
      "program_name": "string",
      "workout_name": "string",
      "scheduled_date": "string (ISO date)",
      "status": "ACTIVE | COMPLETED | SKIPPED | MISSED",
      "week_number": "number",
      "day_number": "number",
      "exercises": [
        {
          "exercise_id": "number",
          "exercise_name": "string",
          "sets": "number",
          "reps": "string",
          "rest_seconds": "number"
        }
      ]
    }
  ]
}
```

### POST `/api/v1/users/{userId}/scheduled-workouts`
**Request:**
```json
{
  "workouts": [
    {
      "user_program_id": "number",
      "workout_name": "string",
      "scheduled_date": "string (ISO date)",
      "week_number": "number",
      "day_number": "number",
      "exercises": [ /* Array of exercise objects */ ]
    }
  ]
}
```
**Response:**
```json
{
  "message": "string",
  "scheduled_workouts": [ /* Array of created workouts */ ]
}
```

### PUT `/api/v1/users/{userId}/scheduled-workouts/{id}`
**Request:**
```json
{
  "status": "ACTIVE | COMPLETED | SKIPPED | MISSED"
}
```
**Response:**
```json
{
  "message": "string",
  "scheduled_workout": { /* Updated workout object */ }
}
```

### GET `/api/v1/users/{userId}/workout-logs`
**Response:**
```json
{
  "workout_logs": [
    {
      "id": "number",
      "user_id": "number",
      "scheduled_workout_id": "number | null",
      "workout_name": "string",
      "started_at": "string (ISO date)",
      "completed_at": "string (ISO date)",
      "duration_minutes": "number",
      "total_volume_kg": "number",
      "notes": "string | null",
      "exercises": [
        {
          "exercise_id": "number",
          "exercise_name": "string",
          "sets_completed": "number",
          "reps": ["number"],
          "weights_kg": ["number"]
        }
      ]
    }
  ]
}
```

### POST `/api/v1/users/{userId}/workout-logs`
**Request:**
```json
{
  "scheduled_workout_id": "number | null",
  "workout_name": "string",
  "started_at": "string (ISO date)",
  "completed_at": "string (ISO date)",
  "notes": "string | null",
  "exercises": [ /* Array of exercise log objects */ ]
}
```
**Response:**
```json
{
  "message": "string",
  "workout_log": { /* Created workout log */ }
}
```

### POST `/api/v1/users/{userId}/workout-logs/{logId}/exercises`
**Request:**
```json
{
  "exercise_id": "number",
  "sets_completed": "number",
  "reps": ["number"],
  "weights_kg": ["number"]
}
```
**Response:**
```json
{
  "message": "string",
  "exercise_log": { /* Created exercise log */ }
}
```

---

## **ProgramsAPI**
📍 `src/services/ProgramsAPI.ts`

### GET `/api/v1/programs?is_template={boolean}&difficulty={beginner|intermediate|advanced}&user_id={number}`
**Response:**
```json
{
  "programs": [
    {
      "id": "number",
      "name": "string",
      "description": "string | null",
      "difficulty": "beginner | intermediate | advanced",
      "duration_weeks": "number",
      "workouts_per_week": "number",
      "is_template": "boolean",
      "created_by": "number",
      "created_at": "string (ISO date)",
      "workouts": [
        {
          "id": "number",
          "name": "string",
          "week_number": "number",
          "day_number": "number",
          "exercises": [ /* Array of exercise objects */ ]
        }
      ]
    }
  ]
}
```

### POST `/api/v1/programs`
**Request:**
```json
{
  "name": "string",
  "description": "string | null",
  "difficulty": "beginner | intermediate | advanced",
  "duration_weeks": "number",
  "workouts_per_week": "number",
  "is_template": "boolean",
  "workouts": [ /* Array of workout objects */ ]
}
```
**Response:**
```json
{
  "message": "string",
  "program": { /* Created program object */ }
}
```

### GET `/api/v1/programs/{id}`
**Response:**
```json
{
  "program": { /* Program object with workouts */ }
}
```

### PUT `/api/v1/programs/{id}`
**Request:** Same as POST
**Response:**
```json
{
  "message": "string",
  "program": { /* Updated program object */ }
}
```

### DELETE `/api/v1/programs/{id}`
**Response:**
```json
{
  "message": "string"
}
```

---

## **UserProgramsAPI**
📍 `src/services/userProgramsApi.ts`

### GET `/api/v1/users/{userId}/programs`
**Response:**
```json
{
  "user_programs": [
    {
      "id": "number",
      "user_id": "number",
      "program_id": "number",
      "program_name": "string",
      "status": "ACTIVE | PAUSED | COMPLETED",
      "current_week": "number",
      "current_day": "number",
      "started_at": "string (ISO date)",
      "completed_at": "string (ISO date) | null"
    }
  ]
}
```

### POST `/api/v1/users/{userId}/programs`
**Request:**
```json
{
  "program_id": "number",
  "started_at": "string (ISO date)"
}
```
**Response:**
```json
{
  "message": "string",
  "user_program": { /* Created user program */ }
}
```

### PUT `/api/v1/users/{userId}/programs/{programId}`
**Request:**
```json
{
  "status": "ACTIVE | PAUSED | COMPLETED",
  "current_week": "number",
  "current_day": "number"
}
```
**Response:**
```json
{
  "message": "string",
  "user_program": { /* Updated user program */ }
}
```

---

## **FloorplanAPI**
📍 `src/services/FloorplanAPI.ts`

### GET `/api/v1/floorplan/active`
**Response:**
```json
{
  "floorplan": {
    "id": "number",
    "name": "string",
    "width_meters": "number",
    "height_meters": "number",
    "is_active": "boolean",
    "created_at": "string (ISO date)"
  }
}
```

### POST `/api/v1/floorplan`
**Request:**
```json
{
  "name": "string",
  "width_meters": "number",
  "height_meters": "number",
  "is_active": "boolean"
}
```
**Response:**
```json
{
  "message": "string",
  "floorplan": { /* Created floorplan */ }
}
```

### GET `/api/v1/floorplan/{id}`
**Response:**
```json
{
  "floorplan": { /* Floorplan object */ }
}
```

### PUT `/api/v1/floorplan/{id}`
**Request:** Same as POST
**Response:**
```json
{
  "message": "string",
  "floorplan": { /* Updated floorplan */ }
}
```

### DELETE `/api/v1/floorplan/{id}`
**Response:**
```json
{
  "message": "string"
}
```

---

## **MachinesAPI**
📍 `src/services/MachinesAPI.ts`

### GET `/api/v1/floorplan/{floorplanId}/machines`
**Response:**
```json
{
  "machines": [
    {
      "id": "number",
      "floorplan_id": "number",
      "name": "string",
      "equipment_type": "string",
      "position_x": "number",
      "position_y": "number",
      "rotation": "number",
      "status": "ACTIVE | BROKEN | MAINTENANCE",
      "notes": "string | null"
    }
  ]
}
```

### POST `/api/v1/floorplan/machines`
**Request:**
```json
{
  "floorplan_id": "number",
  "name": "string",
  "equipment_type": "string",
  "position_x": "number",
  "position_y": "number",
  "rotation": "number",
  "status": "ACTIVE | BROKEN | MAINTENANCE",
  "notes": "string | null"
}
```
**Response:**
```json
{
  "message": "string",
  "machine": { /* Created machine */ }
}
```

### PUT `/api/v1/floorplan/machines/{id}`
**Request:** Same as POST
**Response:**
```json
{
  "message": "string",
  "machine": { /* Updated machine */ }
}
```

### DELETE `/api/v1/floorplan/machines/{id}`
**Response:**
```json
{
  "message": "string"
}
```

### PUT `/api/v1/floorplan/machines/{id}/status`
**Request:**
```json
{
  "status": "ACTIVE | BROKEN | MAINTENANCE"
}
```
**Response:**
```json
{
  "message": "string",
  "machine": { /* Updated machine */ }
}
```

---

## **Muscle/Equipment APIs**
📍 `src/services/MuscleAPI.ts` & `src/services/EquipmentAPI.ts`

### GET `/api/v1/muscles`
**Response:**
```json
{
  "muscles": [
    {
      "id": "number",
      "name": "string",
      "name_th": "string",
      "muscle_group": "string"
    }
  ]
}
```

### GET `/api/v1/equipment`
**Response:**
```json
{
  "equipment": [
    {
      "id": "number",
      "name": "string",
      "name_th": "string",
      "category": "string"
    }
  ]
}
```

### PUT `/api/v1/equipment/{id}/status`
**Request:**
```json
{
  "status": "ACTIVE | BROKEN"
}
```
**Response:**
```json
{
  "message": "string",
  "equipment": { /* Updated equipment */ }
}
```

---

## **TrainerAPI**
📍 `src/services/TrainerAPI.ts`

### GET `/api/v1/trainers/{trainerId}/trainees?page={number}&page_size={number}`
**Response:**
```json
{
  "trainees": [
    {
      "id": "number",
      "email": "string",
      "name": "string",
      "role": "user",
      "status": "ACTIVE | SUSPENDED",
      "image_url": "string | null",
      "image_full_url": "string | null",
      "assigned_at": "string (ISO date) | null"
    }
  ],
  "total": "number",
  "page": "number",
  "page_size": "number"
}
```

### GET `/api/v1/trainers/me/dashboard`
**Response:**
```json
{
  "total_trainees": "number",
  "active_trainees": "number",
  "suspended_trainees": "number",
  "recent_activity": [
    {
      "trainee_id": "number",
      "trainee_name": "string",
      "activity_type": "string",
      "description": "string",
      "timestamp": "string (ISO date)"
    }
  ],
  "trainees": [
    {
      "id": "number",
      "name": "string",
      "image_url": "string | null",
      "status": "ACTIVE | AT_RISK | FAILING",
      "current_program": "string",
      "last_workout_date": "string (ISO date) | null",
      "workouts_this_week": "number",
      "upcoming_workouts": "number"
    }
  ]
}
```

### GET `/api/v1/trainers/me/trainees/{traineeId}/progress?from={YYYY-MM-DD}&to={YYYY-MM-DD}`
**Response:**
```json
{
  "trainee_id": "number",
  "trainee_name": "string",
  "current_program": {
    "id": "number",
    "name": "string",
    "start_date": "string (ISO date)",
    "duration_weeks": "number",
    "completion_rate": "number"
  } | null,
  "workout_stats": {
    "total_workouts_scheduled": "number",
    "workouts_completed": "number",
    "workouts_missed": "number",
    "workouts_skipped": "number",
    "completion_rate": "number",
    "current_streak": "number"
  },
  "muscle_progress": [
    {
      "muscle_name": "string",
      "body_region": "string",
      "total_sets": "number",
      "weighted_sets": "number",
      "total_reps": "number",
      "total_volume": "number",
      "average_weight": "number",
      "workouts_targeted": "number",
      "last_trained": "string (ISO date) | null",
      "intensity_score": "number"
    }
  ],
  "exercise_prs": [
    {
      "exercise_name": "string",
      "max_weight": "number",
      "max_reps": "number",
      "max_volume": "number",
      "achieved_at": "string (ISO date)"
    }
  ],
  "recent_workouts": [
    {
      "workout_log_id": "number",
      "workout_date": "string (ISO date)",
      "program_session_name": "string",
      "exercise_count": "number",
      "total_sets": "number",
      "total_volume": "number",
      "duration": "number"
    }
  ]
}
```