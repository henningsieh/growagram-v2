# Database Management

This directory contains all database-related files for the GrowAGram project.

## Structure

```
database/
├── README.md                    # This file
├── dumps/                      # Database dump files
│   └── export.sql              # SQLite database dump (legacy data source)
└── migrations/                 # Migration scripts and processed data
    ├── extract_data.py         # Script to convert SQLite dump to PostgreSQL CSVs
    ├── breeders.csv           # Processed breeders data for PostgreSQL import
    └── strains.csv            # Processed strains data for PostgreSQL import
```

## Migration Process

The migration from SQLite to PostgreSQL involves these steps:

1. **Source Data**: `dumps/export.sql` contains the original SQLite database dump
2. **Processing**: `migrations/extract_data.py` parses the SQLite dump and extracts:
   - Cannabis strain breeders data
   - Cannabis strain data with THC/CBD content
3. **Output**: Generates CSV files compatible with PostgreSQL bulk import

### Running the Migration

```bash
cd database/migrations
python3 extract_data.py
```

This will process the SQLite dump and generate:

- `breeders.csv` - Breeder information
- `strains.csv` - Cannabis strain data

### Data Transformation

The script performs the following transformations:

- **Breeders**: Extracts ID, name, and timestamps from SQLite format
- **Strains**: Converts strain data and extracts THC/CBD content from the type field
- **Timestamps**: Converts SQLite datetime format to PostgreSQL-compatible format

## Database Schema

The current PostgreSQL schema is managed by Drizzle ORM. See `src/lib/db/schema.ts` for the complete schema definition.

## Related Documentation

- [Performance Optimization](../.github/instructions/database-performance.instructions.md)
- [Database Schema](../src/lib/db/schema.ts)
- [tRPC Database Procedures](../docs/api/trpc-procedures.md)
