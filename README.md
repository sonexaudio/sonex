# Sonex Audio Solutions

## Accessing Sessions in Database
1. In terminal, type `docker exec -it sonexaudiodatabase-postgres_database-1 psql -U sonex sonex_dev`
2. type `SELECT * FROM "session.user_sessions"`
3. To clear sessions at once, `DELETE FROM "session".user_sessions`

This software is proprietary and not licensed for public or commercial use. All rights reserved.