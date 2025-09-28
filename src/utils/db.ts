import { Pool } from 'pg';

export const pool = new Pool({
    user: 'Grupo5',
    host: 'localhost',
    database: 'MallaProyectada',
    password: 'secure-password',
    port: 5432,
    options: '-c TimeZone=America/Santiago'
});