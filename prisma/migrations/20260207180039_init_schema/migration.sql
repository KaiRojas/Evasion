-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "RoutePointType" AS ENUM ('START', 'END', 'WAYPOINT', 'POI', 'REST_STOP', 'GAS_STATION', 'PHOTO_OP');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MODERATE', 'CHALLENGING', 'EXPERT');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INTERESTED', 'GOING', 'MAYBE', 'DECLINED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('STATIONARY', 'MOBILE', 'SPEED_TRAP', 'CHECKPOINT', 'ACCIDENT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "display_name" VARCHAR(50) NOT NULL,
    "avatar_url" TEXT,
    "bio" VARCHAR(500),
    "date_of_birth" DATE NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3),
    "home_latitude" DOUBLE PRECISION,
    "home_longitude" DOUBLE PRECISION,
    "privacy_settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "make" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "color" VARCHAR(30),
    "vin" VARCHAR(17),
    "license_plate" VARCHAR(15),
    "nickname" VARCHAR(50),
    "modifications" JSONB NOT NULL DEFAULT '[]',
    "specs" JSONB NOT NULL DEFAULT '{}',
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_stats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "vehicle_id" UUID NOT NULL,
    "horsepower" DOUBLE PRECISION,
    "torque" DOUBLE PRECISION,
    "quarter_mile" DOUBLE PRECISION,
    "zero_to_sixty" DOUBLE PRECISION,
    "top_speed" DOUBLE PRECISION,
    "total_miles" INTEGER,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "friend_id" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "creator_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "path_coordinates" JSONB NOT NULL,
    "distance_miles" DOUBLE PRECISION NOT NULL,
    "elevation_gain" INTEGER,
    "estimated_time" INTEGER,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MODERATE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "drive_count" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_points" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "route_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "sequence" INTEGER NOT NULL,
    "point_type" "RoutePointType" NOT NULL DEFAULT 'WAYPOINT',
    "note" VARCHAR(200),

    CONSTRAINT "route_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_ratings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "route_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "organizer_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "meeting_latitude" DOUBLE PRECISION NOT NULL,
    "meeting_longitude" DOUBLE PRECISION NOT NULL,
    "meeting_address" VARCHAR(200),
    "max_participants" INTEGER,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cover_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'INTERESTED',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_routes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "event_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forums" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "forum_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_comments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "parent_id" UUID,
    "content" TEXT NOT NULL,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "police_reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "reporter_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "report_type" "ReportType" NOT NULL DEFAULT 'STATIONARY',
    "description" VARCHAR(500),
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "police_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "police_predictions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "report_id" UUID,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "time_window" VARCHAR(50) NOT NULL,
    "factors" JSONB NOT NULL DEFAULT '{}',
    "predicted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "police_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_violations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "seq_id" VARCHAR(100),
    "stop_date" DATE NOT NULL,
    "stop_time" TIME NOT NULL,
    "agency" VARCHAR(50),
    "sub_agency" VARCHAR(100),
    "location" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "violation_type" VARCHAR(50),
    "charge" VARCHAR(100),
    "article" VARCHAR(50),
    "vehicle_type" VARCHAR(50),
    "vehicle_year" INTEGER,
    "vehicle_make" VARCHAR(50),
    "vehicle_model" VARCHAR(50),
    "vehicle_color" VARCHAR(30),
    "accident" BOOLEAN NOT NULL DEFAULT false,
    "personal_injury" BOOLEAN NOT NULL DEFAULT false,
    "property_damage" BOOLEAN NOT NULL DEFAULT false,
    "fatal" BOOLEAN NOT NULL DEFAULT false,
    "alcohol" BOOLEAN NOT NULL DEFAULT false,
    "work_zone" BOOLEAN NOT NULL DEFAULT false,
    "search_conducted" BOOLEAN NOT NULL DEFAULT false,
    "arrest_type" VARCHAR(50),
    "driver_state" VARCHAR(10),
    "is_speed_related" BOOLEAN NOT NULL DEFAULT false,
    "recorded_speed" INTEGER,
    "posted_limit" INTEGER,
    "speed_over" INTEGER,
    "detection_method" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violation_hotspots" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "grid_lat" DOUBLE PRECISION NOT NULL,
    "grid_lng" DOUBLE PRECISION NOT NULL,
    "hour_of_day" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "total_stops" INTEGER NOT NULL,
    "alcohol_stops" INTEGER NOT NULL DEFAULT 0,
    "accident_stops" INTEGER NOT NULL DEFAULT 0,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "violation_hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_spottings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "spotter_id" UUID NOT NULL,
    "vehicle_id" UUID,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "make" VARCHAR(50),
    "model" VARCHAR(50),
    "color" VARCHAR(30),
    "year" INTEGER,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" VARCHAR(500),
    "spotted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_spottings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_user_id_idx" ON "vehicles"("user_id");

-- CreateIndex
CREATE INDEX "vehicles_make_model_idx" ON "vehicles"("make", "model");

-- CreateIndex
CREATE INDEX "vehicle_stats_vehicle_id_idx" ON "vehicle_stats"("vehicle_id");

-- CreateIndex
CREATE INDEX "friendships_user_id_idx" ON "friendships"("user_id");

-- CreateIndex
CREATE INDEX "friendships_friend_id_idx" ON "friendships"("friend_id");

-- CreateIndex
CREATE INDEX "friendships_status_idx" ON "friendships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_user_id_friend_id_key" ON "friendships"("user_id", "friend_id");

-- CreateIndex
CREATE INDEX "routes_creator_id_idx" ON "routes"("creator_id");

-- CreateIndex
CREATE INDEX "routes_is_public_is_featured_idx" ON "routes"("is_public", "is_featured");

-- CreateIndex
CREATE INDEX "routes_avg_rating_idx" ON "routes"("avg_rating");

-- CreateIndex
CREATE INDEX "routes_drive_count_idx" ON "routes"("drive_count");

-- CreateIndex
CREATE INDEX "route_points_route_id_idx" ON "route_points"("route_id");

-- CreateIndex
CREATE INDEX "route_ratings_route_id_idx" ON "route_ratings"("route_id");

-- CreateIndex
CREATE UNIQUE INDEX "route_ratings_route_id_user_id_key" ON "route_ratings"("route_id", "user_id");

-- CreateIndex
CREATE INDEX "events_organizer_id_idx" ON "events"("organizer_id");

-- CreateIndex
CREATE INDEX "events_start_time_idx" ON "events"("start_time");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "event_participants_event_id_idx" ON "event_participants"("event_id");

-- CreateIndex
CREATE INDEX "event_participants_user_id_idx" ON "event_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_event_id_user_id_key" ON "event_participants"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_routes_event_id_route_id_key" ON "event_routes"("event_id", "route_id");

-- CreateIndex
CREATE UNIQUE INDEX "forums_slug_key" ON "forums"("slug");

-- CreateIndex
CREATE INDEX "forums_category_idx" ON "forums"("category");

-- CreateIndex
CREATE INDEX "forums_slug_idx" ON "forums"("slug");

-- CreateIndex
CREATE INDEX "forum_posts_forum_id_idx" ON "forum_posts"("forum_id");

-- CreateIndex
CREATE INDEX "forum_posts_author_id_idx" ON "forum_posts"("author_id");

-- CreateIndex
CREATE INDEX "forum_posts_created_at_idx" ON "forum_posts"("created_at");

-- CreateIndex
CREATE INDEX "forum_posts_is_pinned_idx" ON "forum_posts"("is_pinned");

-- CreateIndex
CREATE INDEX "forum_comments_post_id_idx" ON "forum_comments"("post_id");

-- CreateIndex
CREATE INDEX "forum_comments_author_id_idx" ON "forum_comments"("author_id");

-- CreateIndex
CREATE INDEX "forum_comments_parent_id_idx" ON "forum_comments"("parent_id");

-- CreateIndex
CREATE INDEX "user_locations_user_id_idx" ON "user_locations"("user_id");

-- CreateIndex
CREATE INDEX "user_locations_timestamp_idx" ON "user_locations"("timestamp");

-- CreateIndex
CREATE INDEX "user_locations_is_active_idx" ON "user_locations"("is_active");

-- CreateIndex
CREATE INDEX "police_reports_reporter_id_idx" ON "police_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "police_reports_is_active_idx" ON "police_reports"("is_active");

-- CreateIndex
CREATE INDEX "police_reports_expires_at_idx" ON "police_reports"("expires_at");

-- CreateIndex
CREATE INDEX "police_predictions_probability_idx" ON "police_predictions"("probability");

-- CreateIndex
CREATE INDEX "police_predictions_valid_until_idx" ON "police_predictions"("valid_until");

-- CreateIndex
CREATE INDEX "traffic_violations_stop_date_idx" ON "traffic_violations"("stop_date");

-- CreateIndex
CREATE INDEX "traffic_violations_stop_time_idx" ON "traffic_violations"("stop_time");

-- CreateIndex
CREATE INDEX "traffic_violations_sub_agency_idx" ON "traffic_violations"("sub_agency");

-- CreateIndex
CREATE INDEX "traffic_violations_latitude_longitude_idx" ON "traffic_violations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "traffic_violations_violation_type_idx" ON "traffic_violations"("violation_type");

-- CreateIndex
CREATE INDEX "traffic_violations_alcohol_idx" ON "traffic_violations"("alcohol");

-- CreateIndex
CREATE INDEX "traffic_violations_accident_idx" ON "traffic_violations"("accident");

-- CreateIndex
CREATE INDEX "traffic_violations_is_speed_related_idx" ON "traffic_violations"("is_speed_related");

-- CreateIndex
CREATE INDEX "traffic_violations_recorded_speed_idx" ON "traffic_violations"("recorded_speed");

-- CreateIndex
CREATE INDEX "traffic_violations_detection_method_idx" ON "traffic_violations"("detection_method");

-- CreateIndex
CREATE INDEX "violation_hotspots_probability_idx" ON "violation_hotspots"("probability");

-- CreateIndex
CREATE INDEX "violation_hotspots_hour_of_day_idx" ON "violation_hotspots"("hour_of_day");

-- CreateIndex
CREATE INDEX "violation_hotspots_day_of_week_idx" ON "violation_hotspots"("day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "violation_hotspots_grid_lat_grid_lng_hour_of_day_day_of_wee_key" ON "violation_hotspots"("grid_lat", "grid_lng", "hour_of_day", "day_of_week");

-- CreateIndex
CREATE INDEX "car_spottings_spotter_id_idx" ON "car_spottings"("spotter_id");

-- CreateIndex
CREATE INDEX "car_spottings_vehicle_id_idx" ON "car_spottings"("vehicle_id");

-- CreateIndex
CREATE INDEX "car_spottings_spotted_at_idx" ON "car_spottings"("spotted_at");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_stats" ADD CONSTRAINT "vehicle_stats_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_points" ADD CONSTRAINT "route_points_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_ratings" ADD CONSTRAINT "route_ratings_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_ratings" ADD CONSTRAINT "route_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_routes" ADD CONSTRAINT "event_routes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_routes" ADD CONSTRAINT "event_routes_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "police_reports" ADD CONSTRAINT "police_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "police_predictions" ADD CONSTRAINT "police_predictions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "police_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_spottings" ADD CONSTRAINT "car_spottings_spotter_id_fkey" FOREIGN KEY ("spotter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_spottings" ADD CONSTRAINT "car_spottings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
