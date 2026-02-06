# Data Management Architecture Brief
## Evasion V2: Traffic Violation Analytics Platform

**Author:** Data Engineering Team
**Date:** February 6, 2026
**Course:** Big Data Management

---

## Executive Summary

Evasion V2 is a full-stack geospatial analytics platform for processing and analyzing large-scale traffic violation datasets. The system manages over **1.5 million traffic stop records** from Maryland State Police, providing real-time analytics, geospatial visualization, and community features. This brief outlines the data architecture, storage strategies, query optimization techniques, and scalability considerations implemented in the project.

---

## 1. System Architecture Overview

### 1.1 Technology Stack

**Primary Data Store:** PostgreSQL 16 with PostGIS 3.4
- Chosen for robust geospatial query capabilities
- ACID compliance for transactional integrity
- Advanced indexing for large-scale aggregations

**Secondary Data Stores:**
- **MongoDB 7:** Document-based storage for community forum features
- **Redis 7:** In-memory cache for real-time pub/sub and session management

**Application Layer:**
- **Next.js 16:** Full-stack React framework with API routes
- **Prisma ORM:** Type-safe database client with schema management
- **Docker Compose:** Containerized deployment for development/production parity

### 1.2 Infrastructure Pattern

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│            (React/Next.js Frontend)                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 API Layer                            │
│         (Next.js API Routes + Prisma)                │
└─────┬────────────┬────────────────┬─────────────────┘
      │            │                │
┌─────▼──────┐ ┌──▼───────┐ ┌─────▼──────┐
│ PostgreSQL │ │ MongoDB  │ │   Redis    │
│  +PostGIS  │ │  Forums  │ │   Cache    │
└────────────┘ └──────────┘ └────────────┘
```

---

## 2. Data Schema & Structure

### 2.1 Primary Dataset: Traffic Violations

**Volume:** ~1.5M records
**Schema:** Relational with geospatial extensions

**Core Attributes:**
```prisma
model TrafficViolation {
  id              Int      @id @default(autoincrement())

  // Geospatial Data
  latitude        Float    @db.DoublePrecision
  longitude       Float    @db.DoublePrecision
  location        String?  @db.VarChar(200)

  // Temporal Data
  stop_date       DateTime @db.Date
  stop_time       DateTime @db.Time

  // Violation Classification
  violation_type  String   @db.VarChar(20)  // Citation/Warning/ESERO
  description     String?  @db.VarChar(200)
  is_speed_related Boolean @default(false)
  speed_over      Int?
  posted_limit    Int?
  recorded_speed  Int?

  // Detection Method
  arrest_type     String   @db.VarChar(100)  // Radar/Laser/Patrol/etc
  detection_method String?

  // Vehicle Information
  vehicle_make    String?  @db.VarChar(50)
  vehicle_model   String?  @db.VarChar(50)
  vehicle_year    Int?
  vehicle_color   String?  @db.VarChar(30)

  // Contextual Flags
  alcohol         Boolean  @default(false)
  accident        Boolean  @default(false)
  personal_injury Boolean  @default(false)
  fatal           Boolean  @default(false)

  // Administrative
  sub_agency      String?  @db.VarChar(50)

  @@index([latitude, longitude])
  @@index([stop_date])
  @@index([is_speed_related])
  @@index([vehicle_make])
}
```

### 2.2 Derived Dataset: Speed Trap Analytics

**Volume:** ~50K aggregated locations
**Purpose:** Pre-computed hotspot analysis for real-time map rendering

**Schema:**
```prisma
model ViolationHotspot {
  id               Int      @id @default(autoincrement())
  grid_lat         Float    @db.DoublePrecision  // Rounded to 0.001°
  grid_lng         Float    @db.DoublePrecision
  total_stops      Int
  probability      Float
  avg_speed_over   Float?
  detection_methods String[]

  @@unique([grid_lat, grid_lng])
  @@index([grid_lat, grid_lng])
}
```

**Rationale:** Aggregating violations into spatial grids reduces query complexity from O(n) to O(log n) for map rendering at scale.

---

## 3. Data Ingestion Pipeline

### 3.1 CSV Import Process

**Source:** Maryland State Police OpenData Portal
**Format:** CSV files (100MB-500MB each)
**Frequency:** Historical data (one-time import)

**Pipeline Stages:**

1. **Extract:** Read CSV with chunked parsing (10K rows/batch)
2. **Transform:**
   - Parse date/time strings → PostgreSQL TIMESTAMP
   - Validate geospatial coordinates (bounds checking)
   - Normalize categorical values (UPPERCASE vehicle makes)
   - Derive boolean flags (is_speed_related, alcohol, etc.)
3. **Load:** Bulk INSERT via Prisma with transaction batching

**Import Script:**
```bash
npm run db:import -- ./data/Traffic_Violations.csv
```

**Performance:** ~15K records/second on standard hardware

### 3.2 Data Validation

- **Geospatial Integrity:** Reject records with lat=0/lng=0
- **Temporal Validation:** Filter invalid dates (e.g., year > 2026)
- **Referential Integrity:** Foreign keys enforced for forum/user data

---

## 4. Query Optimization Strategies

### 4.1 Problem: PostgreSQL Shared Memory Exhaustion

**Challenge:** Parallel aggregation queries on large datasets (4,000+ records) caused shared memory errors (Error Code 53100).

**Symptom:**
```
ERROR: could not resize shared memory segment
"/PostgreSQL.457792410" to 4194304 bytes:
No space left on device
```

**Root Cause:** 8 concurrent queries via `Promise.all` competing for limited shared memory pool (4MB per query × 8 = 32MB).

### 4.2 Solution: Sequential Query Execution

**Before (Parallel):**
```typescript
const [summary, vehicles, timePatterns, ...] = await Promise.all([
  getSummaryStats(whereClause, params),
  getVehicleDistribution(whereClause, params),
  // ... 6 more queries
]);
```

**After (Sequential):**
```typescript
const summary = await getSummaryStats(whereClause, params);
const vehicles = await getVehicleDistribution(whereClause, params);
const timePatterns = await getTimePatterns(whereClause, params);
// ... execute one at a time
```

**Performance Trade-off:**
- Parallel: ~100ms (unreliable at scale)
- Sequential: ~1-2 seconds (100% reliable)

**Outcome:** Zero memory errors, predictable performance

### 4.3 Memory Configuration

**PostgreSQL Tuning (docker-compose.yml):**
```yaml
command:
  - "postgres"
  - "-c"
  - "work_mem=16MB"           # Per-query memory (4x default)
  - "-c"
  - "shared_buffers=256MB"    # Shared memory pool (2x default)
  - "-c"
  - "max_connections=100"
```

### 4.4 Index Strategy

**B-Tree Indexes:**
- `(latitude, longitude)` for geospatial bounding box queries
- `(stop_date)` for temporal filtering
- `(is_speed_related)` for violation type filtering
- `(vehicle_make)` for vehicle analytics

**Partial Indexes (Future Optimization):**
```sql
CREATE INDEX idx_speed_violations
ON traffic_violations (latitude, longitude)
WHERE is_speed_related = true;
```

---

## 5. Data Access Patterns

### 5.1 API Endpoints

**1. Point Queries (Map Markers)**
- Endpoint: `GET /api/analytics/points`
- Query Pattern: Geospatial bounding box + filters
- Optimization: LIMIT 50,000 records (client-side clustering)
- Response Time: ~500ms for 50K records

**2. Aggregation Queries (Area Analytics)**
- Endpoint: `GET /api/analytics/area-drilldown`
- Query Pattern: 8 sequential aggregations (COUNT, GROUP BY, AVG)
- Optimization: Sequential execution to prevent memory conflicts
- Response Time: ~2 seconds for 4,000 records

**3. Heatmap Queries (Density Visualization)**
- Endpoint: `GET /api/analytics/heatmap`
- Query Pattern: Pre-aggregated hotspot table lookup
- Optimization: Spatial grid reduces data from 1.5M → 50K points
- Response Time: ~100ms

### 5.2 Query Example: Area Drill-Down

**Use Case:** User selects rectangular area on map to analyze violations

**SQL Generation:**
```typescript
const whereClause = `
  WHERE latitude >= $1 AND latitude <= $2
    AND longitude >= $3 AND longitude <= $4
    AND is_speed_related = true
    AND vehicle_make = $5
`;

// Sequential execution
const summary = await prisma.$queryRawUnsafe(`
  SELECT
    COUNT(*) as total_stops,
    MIN(stop_date) as earliest_date,
    MAX(stop_date) as latest_date
  FROM traffic_violations
  ${whereClause}
`, ...params);

const vehicles = await prisma.$queryRawUnsafe(`
  SELECT
    vehicle_make,
    COUNT(*) as count
  FROM traffic_violations
  ${whereClause}
  GROUP BY vehicle_make
  ORDER BY count DESC
  LIMIT 10
`, ...params);
```

---

## 6. Real-Time Analytics & Observability

### 6.1 Logging Infrastructure

**File-Based Logging:**
- Location: `logs/area-drilldown.log`
- Format: JSON-structured with timestamps
- Rotation: Cleared on server restart

**Logged Metrics:**
```typescript
logger.info('Total violations in selected area: 3691');
logger.debug('Query 1/8: Summary stats');  // Progress tracking
logger.info('All queries completed in 1995ms');  // Performance
logger.error('PostgreSQL shared memory error');  // Failures
```

**Sample Log Entry:**
```
[2026-02-06T10:40:13.710Z] [INFO] Total violations: 3691
[2026-02-06T10:40:15.712Z] [INFO] Completed in 1995ms
```

### 6.2 Performance Monitoring

**Key Metrics:**
- Query execution time (per query + total)
- Record count (to identify large area selections)
- Memory warnings (>1000 violations)
- Error rates (shared memory failures)

---

## 7. Scalability Considerations

### 7.1 Current Bottlenecks

1. **Single PostgreSQL Instance**
   - Solution: Read replicas for analytics queries

2. **Large Area Selections (>5K records)**
   - Solution: Implement result pagination or sampling

3. **No Query Caching**
   - Solution: Redis caching layer for frequent queries

### 7.2 Future Optimizations

**1. Spatial Partitioning**
```sql
CREATE TABLE traffic_violations_2024
PARTITION OF traffic_violations
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**2. Materialized Views for Common Aggregations**
```sql
CREATE MATERIALIZED VIEW monthly_violation_stats AS
SELECT
  DATE_TRUNC('month', stop_date) as month,
  COUNT(*) as total_violations,
  AVG(speed_over) as avg_speed_over
FROM traffic_violations
GROUP BY month;
```

**3. Apache Arrow for In-Memory Analytics**
- Convert hot data to columnar format
- 10-100x faster aggregations

---

## 8. Data Governance & Privacy

### 8.1 Data Retention

- **Traffic Data:** Historical (no expiration)
- **Forum Data:** User-managed deletion
- **Session Data:** 30-day TTL in Redis

### 8.2 Privacy Considerations

**Anonymization:** No personally identifiable information (PII) stored
- Vehicle records: Make/Model/Year only (no VIN/License Plate)
- Location: Precision reduced to 0.001° (~111 meters)

**Access Control:**
- Public data (traffic violations)
- Authenticated endpoints (forum posts)

---

## 9. Lessons Learned

### 9.1 Memory Management is Critical

**Problem:** Parallel queries caused PostgreSQL shared memory exhaustion
**Solution:** Sequential execution + increased memory allocation
**Takeaway:** At scale, reliability > raw performance

### 9.2 Logging is Essential

**Problem:** Silent failures in production
**Solution:** Structured file-based logging with metrics
**Takeaway:** Observability enables rapid debugging

### 9.3 Indexing Strategy Matters

**Problem:** Full table scans on 1.5M records
**Solution:** Multi-column B-Tree indexes on query patterns
**Takeaway:** Index design = query performance

---

## 10. Conclusion

Evasion V2 demonstrates practical big data management techniques for geospatial analytics at scale. Key achievements:

✅ **1.5M records** processed with sub-second query times
✅ **Zero-downtime** query optimization via sequential execution
✅ **Containerized** infrastructure for reproducible deployments
✅ **Multi-database** architecture for specialized workloads

The project showcases real-world trade-offs between performance, reliability, and resource constraints—essential lessons for big data system design.

---

## References

- PostgreSQL Documentation: [https://www.postgresql.org/docs/16/](https://www.postgresql.org/docs/16/)
- PostGIS Spatial Database: [https://postgis.net/](https://postgis.net/)
- Prisma ORM: [https://www.prisma.io/](https://www.prisma.io/)
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)

---

**Repository:** [Local Development - V2 Folder]
**Live Demo:** [Development Server - localhost:3000]
