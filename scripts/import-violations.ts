/**
 * Traffic Violations CSV Import Script
 * 
 * Streams and imports 1M+ records from Maryland State Police data
 * Run with: npx ts-node scripts/import-violations.ts
 */

import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const CSV_PATH = process.argv[2] || 'Police data/MDSP_Traffic_Violations.csv';
const BATCH_SIZE = 1000; // Insert 1000 records at a time
const SKIP_INVALID_COORDS = true; // Skip records with 0,0 coordinates

interface CSVRow {
  SeqID: string;
  'Date Of Stop': string;
  'Time Of Stop': string;
  Agency: string;
  SubAgency: string;
  Description: string;
  Location: string;
  Latitude: string;
  Longitude: string;
  Accident: string;
  Belts: string;
  'Personal Injury': string;
  'Property Damage': string;
  Fatal: string;
  'Commercial License': string;
  HAZMAT: string;
  'Commercial Vehicle': string;
  Alcohol: string;
  'Work Zone': string;
  'Search Conducted': string;
  'Search Disposition': string;
  'Search Outcome': string;
  'Search Reason': string;
  'Search Reason For Stop': string;
  'Search Type': string;
  'Search Arrest Reason': string;
  State: string;
  VehicleType: string;
  Year: string;
  Make: string;
  Model: string;
  Color: string;
  'Violation Type': string;
  Charge: string;
  Article: string;
  'Contributed To Accident': string;
  Race: string;
  Gender: string;
  'Driver City': string;
  'Driver State': string;
  'DL State': string;
  'Arrest Type': string;
  Geolocation: string;
}

function parseBoolean(value: string): boolean {
  return value?.toLowerCase() === 'yes' || value?.toLowerCase() === 'true';
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Format: M/D/YYYY
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}

function parseTime(timeStr: string): Date | null {
  if (!timeStr) return null;

  // Format: HH:MM:SS
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

  // Create a date with just time (date part doesn't matter for TIME type)
  const date = new Date(1970, 0, 1, hours, minutes, seconds);
  return isNaN(date.getTime()) ? null : date;
}

function transformRow(row: CSVRow) {
  const lat = parseFloat(row.Latitude);
  const lng = parseFloat(row.Longitude);

  // Skip invalid coordinates
  if (SKIP_INVALID_COORDS && (lat === 0 || lng === 0 || isNaN(lat) || isNaN(lng))) {
    return null;
  }

  const stopDate = parseDate(row['Date Of Stop']);
  const stopTime = parseTime(row['Time Of Stop']);

  if (!stopDate || !stopTime) {
    return null;
  }

  return {
    seqId: row.SeqID || null,
    stopDate,
    stopTime,
    agency: row.Agency || null,
    subAgency: row.SubAgency || null,
    location: row.Location || null,
    latitude: lat,
    longitude: lng,
    description: row.Description || null,
    violationType: row['Violation Type'] || null,
    charge: row.Charge || null,
    article: row.Article || null,
    vehicleType: row.VehicleType || null,
    vehicleYear: row.Year ? parseInt(row.Year, 10) || null : null,
    vehicleMake: row.Make || null,
    vehicleModel: row.Model || null,
    vehicleColor: row.Color || null,
    accident: parseBoolean(row.Accident),
    personalInjury: parseBoolean(row['Personal Injury']),
    propertyDamage: parseBoolean(row['Property Damage']),
    fatal: parseBoolean(row.Fatal),
    alcohol: parseBoolean(row.Alcohol),
    workZone: parseBoolean(row['Work Zone']),
    searchConducted: parseBoolean(row['Search Conducted']),
    arrestType: row['Arrest Type'] || null,
    driverState: row['Driver State'] || null,
  };
}

async function importViolations() {
  console.log('🚀 Starting traffic violations import...');
  console.log(`📁 Reading from: ${CSV_PATH}`);

  // Clear existing data
  console.log('🧹 Clearing existing traffic violations...');
  await prisma.trafficViolation.deleteMany();
  console.log('✅ Table cleared.');

  let totalProcessed = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let batch: ReturnType<typeof transformRow>[] = [];

  const startTime = Date.now();

  // Create readable stream with CSV parser
  const parser = createReadStream(CSV_PATH)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }));

  for await (const row of parser) {
    totalProcessed++;
    if (totalProcessed % 100 === 0) console.log(`Processing row ${totalProcessed}...`);

    const transformed = transformRow(row as CSVRow);

    if (transformed) {
      batch.push(transformed);
    } else {
      totalSkipped++;
    }

    // Insert batch when full
    if (batch.length >= BATCH_SIZE) {
      try {
        await prisma.trafficViolation.createMany({
          data: batch.filter((r): r is NonNullable<typeof r> => r !== null),
          skipDuplicates: true,
        });
        totalInserted += batch.length;
      } catch (error) {
        console.error(`❌ Error inserting batch at row ${totalProcessed}:`, error);
      }

      batch = [];

      // Progress update every 10,000 rows
      if (totalProcessed % 10000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = Math.round(totalProcessed / parseFloat(elapsed));
        console.log(`📊 Processed: ${totalProcessed.toLocaleString()} | Inserted: ${totalInserted.toLocaleString()} | Skipped: ${totalSkipped.toLocaleString()} | Rate: ${rate}/sec`);
      }
    }
  }

  // Insert remaining batch
  if (batch.length > 0) {
    try {
      await prisma.trafficViolation.createMany({
        data: batch.filter((r): r is NonNullable<typeof r> => r !== null),
        skipDuplicates: true,
      });
      totalInserted += batch.length;
    } catch (error) {
      console.error('❌ Error inserting final batch:', error);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n✅ Import complete!');
  console.log(`📊 Total processed: ${totalProcessed.toLocaleString()}`);
  console.log(`✅ Total inserted: ${totalInserted.toLocaleString()}`);
  console.log(`⏭️  Total skipped: ${totalSkipped.toLocaleString()}`);
  console.log(`⏱️  Total time: ${totalTime}s`);

  // Generate hotspots after import
  console.log('\n🔥 Generating hotspot aggregations...');
  await generateHotspots();
}

async function generateHotspots() {
  // Clear existing hotspots
  await prisma.violationHotspot.deleteMany();

  // Aggregate by grid cell (0.01 degree ≈ 1.1km) and time
  const result = await prisma.$queryRaw<Array<{
    grid_lat: number;
    grid_lng: number;
    hour_of_day: number;
    day_of_week: number;
    total_stops: bigint;
    alcohol_stops: bigint;
    accident_stops: bigint;
  }>>`
    SELECT 
      ROUND(latitude::numeric, 2) as grid_lat,
      ROUND(longitude::numeric, 2) as grid_lng,
      EXTRACT(HOUR FROM stop_time) as hour_of_day,
      EXTRACT(DOW FROM stop_date) as day_of_week,
      COUNT(*) as total_stops,
      SUM(CASE WHEN alcohol THEN 1 ELSE 0 END) as alcohol_stops,
      SUM(CASE WHEN accident THEN 1 ELSE 0 END) as accident_stops
    FROM traffic_violations
    GROUP BY grid_lat, grid_lng, hour_of_day, day_of_week
    HAVING COUNT(*) >= 5
  `;

  // Calculate max for normalization
  const maxStops = Math.max(...result.map(r => Number(r.total_stops)));

  // Insert hotspots in batches
  const hotspots = result.map(r => ({
    gridLat: r.grid_lat,
    gridLng: r.grid_lng,
    hourOfDay: Number(r.hour_of_day),
    dayOfWeek: Number(r.day_of_week),
    totalStops: Number(r.total_stops),
    alcoholStops: Number(r.alcohol_stops),
    accidentStops: Number(r.accident_stops),
    probability: Number(r.total_stops) / maxStops, // Normalize to 0-1
  }));

  // Insert in batches
  for (let i = 0; i < hotspots.length; i += 1000) {
    const batch = hotspots.slice(i, i + 1000);
    await prisma.violationHotspot.createMany({ data: batch });
  }

  console.log(`✅ Generated ${hotspots.length.toLocaleString()} hotspot records`);
}

// Run import
importViolations()
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
