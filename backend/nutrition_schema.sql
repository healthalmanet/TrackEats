-- 1. users – Profile + Health Data
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    height_cm FLOAT,
    weight_kg FLOAT,
    activity_level VARCHAR(20),
    health_conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. auth – Login Credentials Table
CREATE TABLE auth (
    auth_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'local',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 3. meals – Meal Definitions
CREATE TABLE meals (
    meal_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    calories FLOAT,
    protein_g FLOAT,
    carbs_g FLOAT,
    fat_g FLOAT,
    is_ml_suggested BOOLEAN DEFAULT FALSE,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. meal_logs – Meal Tracking
CREATE TABLE meal_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    meal_id INTEGER REFERENCES meals(meal_id) ON DELETE CASCADE,
    date_logged DATE NOT NULL,
    quantity FLOAT DEFAULT 1,
    total_calories FLOAT
);

-- 5. diet_plans – Custom/ML Diet Plans
CREATE TABLE diet_plans (
    plan_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_calories FLOAT,
    created_by_ml BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. diet_plan_meals – Meals per Day in Plan
CREATE TABLE diet_plan_meals (
    plan_meal_id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES diet_plans(plan_id) ON DELETE CASCADE,
    meal_id INTEGER REFERENCES meals(meal_id) ON DELETE CASCADE,
    day_number INTEGER,
    meal_time VARCHAR(20)
);

-- 7. feedback – Meal/Plan Feedback
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    meal_id INTEGER REFERENCES meals(meal_id),
    plan_id INTEGER REFERENCES diet_plans(plan_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ml_model_outputs – AI Meal Suggestions
CREATE TABLE ml_model_outputs (
    model_output_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    meal_id INTEGER REFERENCES meals(meal_id),
    model_version VARCHAR(50),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
