const axios = require('axios');
const db = require('../db');

class ExchangeRateService {
    constructor() {
        this.apiBaseUrl = 'https://api.frankfurter.app';
    }

    /**
     * Fetch latest exchange rates from API and update local Postgres cache
     */
    async syncExchangeRates() {
        try {
            console.log("Fetching latest exchange rates from Frankfurter...");
            const response = await axios.get(`${this.apiBaseUrl}/latest?from=INR`);
            const rates = response.data.rates;

            const client = await db.getClient();
            try {
                await client.query('BEGIN');
                
                // Keep INR itself 1:1 if needed, although base is INR
                for (const [currencyCode, rate] of Object.entries(rates)) {
                    // rate here is how much 1 INR is in `currencyCode`.
                    // rate_to_inr should be 1 / rate to represent how many INR for 1 unit of foreign currency
                    const rateToInr = (1 / rate).toFixed(4);
                    
                    await client.query(`
                        INSERT INTO exchange_rates (currency_code, rate_to_inr, last_updated)
                        VALUES ($1, $2, CURRENT_TIMESTAMP)
                        ON CONFLICT (currency_code) 
                        DO UPDATE SET rate_to_inr = EXCLUDED.rate_to_inr, last_updated = CURRENT_TIMESTAMP
                    `, [currencyCode, rateToInr]);
                }

                // explicitly ensure USD, EUR, GBP are inserted if anything is weird 
                // but frankfurter returns everything based on Euro natively or chosen from.
                
                await client.query('COMMIT');
                console.log("Exchange rates successfully synced and cached in DB.");
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error("Failed to sync exchange rates:", error.message);
        }
    }

    /**
     * Get the multiplier strictly from the cache
     * @param {string} currencyCode 
     * @returns {number} rate to multiply foreign amount to get INR
     */
    async getCachedRate(currencyCode) {
        if (currencyCode === 'INR') return 1.0;

        const res = await db.query('SELECT rate_to_inr FROM exchange_rates WHERE currency_code = $1', [currencyCode.toUpperCase()]);
        
        if (res.rowCount === 0) {
            throw new Error(`Currency ${currencyCode} is not supported or not cached.`);
        }
        
        return parseFloat(res.rows[0].rate_to_inr);
    }
}

module.exports = new ExchangeRateService();
