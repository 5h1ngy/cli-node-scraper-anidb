import orm from './orm.js';

/**
 * Connette al database e sincronizza i modelli, quindi esegue un callback con i modelli sincronizzati.
 * @returns {Promise<Record<string, import("sequelize").ModelCtor<any>>>} - Una Promise che risolve quando la connessione e il callback sono stati completati.
 */
export async function connect() {
    try {

        return orm.models

    } catch (error) {
        logger(1, error)

    }
}

export async function disconnect() {
    return await orm.sequelize.close()
}