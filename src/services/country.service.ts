import pool from '../config/database';
import { Country } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class CountryService {
    async getAllCountries(filters: { region?: string; currency?: string; sort?: string }): Promise<Country[]> {
        let query = 'SELECT * FROM countries WHERE 1=1';
        const params: any[] = [];

        if (filters.region) {
            query += ' AND LOWER(region) = LOWER(?)';
            params.push(filters.region);
        }

        if (filters.currency) {
            query += ' AND LOWER(currency_code) = LOWER(?)';
            params.push(filters.currency);
        }

        if (filters.sort) {
            switch (filters.sort.toLowerCase()) {
                case 'gdp_desc':
                    query += ' ORDER BY estimated_gdp DESC';
                    break;
                case 'gdp_asc':
                    query += ' ORDER BY estimated_gdp ASC';
                    break;
                case 'population_desc':
                    query += ' ORDER BY population DESC';
                    break;
                case 'population_asc':
                    query += ' ORDER BY population ASC';
                    break;
                case 'name_asc':
                    query += ' ORDER BY name ASC';
                    break;
                case 'name_desc':
                    query += ' ORDER BY name DESC';
                    break;
                default:
                    query += ' ORDER BY id ASC';
            }
        } else {
            query += ' ORDER BY id ASC';
        }

        const [rows] = await pool.query<RowDataPacket[]>(query, params);
        return rows as Country[];
    }

    async getCountryByName(name: string): Promise<Country | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)',
            [name]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Country;
    }

    async deleteCountry(name: string): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM countries WHERE LOWER(name) = LOWER(?)',
            [name]
        );

        return result.affectedRows > 0;
    }

    async upsertCountry(country: Country): Promise<void> {
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM countries WHERE LOWER(name) = LOWER(?)',
            [country.name]
        );

        if (existing.length > 0) {
            await pool.query(
                `UPDATE countries
         SET capital = ?, region = ?, population = ?, currency_code = ?,
             exchange_rate = ?, estimated_gdp = ?, flag_url = ?, last_refreshed_at = NOW()
         WHERE LOWER(name) = LOWER(?)`,
                [
                    country.capital || null,
                    country.region || null,
                    country.population,
                    country.currency_code,
                    country.exchange_rate,
                    country.estimated_gdp,
                    country.flag_url || null,
                    country.name
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    country.name,
                    country.capital || null,
                    country.region || null,
                    country.population,
                    country.currency_code,
                    country.exchange_rate,
                    country.estimated_gdp,
                    country.flag_url || null
                ]
            );
        }
    }

    async getTotalCountries(): Promise<number> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM countries');
        return rows[0].count;
    }

    async getLastRefreshedAt(): Promise<string | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT value FROM metadata WHERE key_name = 'last_refreshed_at'"
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0].value;
    }

    async setLastRefreshedAt(timestamp: string): Promise<void> {
        await pool.query(
            `INSERT INTO metadata (key_name, value, updated_at)
       VALUES ('last_refreshed_at', ?, NOW())
       ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()`,
            [timestamp, timestamp]
        );
    }

    async getTopCountriesByGDP(limit: number): Promise<Country[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT ?',
            [limit]
        );
        return rows as Country[];
    }
}