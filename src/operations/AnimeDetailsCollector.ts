import _ from "lodash";
import dayjs from "dayjs";
import sizeof from "object-sizeof";

import { logInfo, logError, logVerbose, logWarn } from "@/shared/logger";
import formatBytes from "@/utils/formatBytes";
import { APP_ERRORS } from "@/handlers/appErrors";
import ProgressManager from "@/handlers/ProgressManager";

import AnimeReferences from "@/models/AnimeReferences";
import AssetImages from "@/models/AssetImages";
import AnimeDescriptions from "@/models/AnimeDescriptions";
import AnimeDetails from "@/models/AnimeDetails";
import TagDetails from "@/models/TagDetails";
import TagReferences from "@/models/TagReferences";
import AnimeTags from "@/models/AnimeTags";

import DetailService from "@/services/DetailService";
import AssetService from "@/services/AssetService";

/**
 * Classe che gestisce la raccolta dei dettagli degli anime.
 */
export default class AnimeDetailsCollector {
    private progressManager: ProgressManager;
    private detailService: DetailService;
    private assetService: AssetService;

    constructor(progressManager: ProgressManager) {
        this.progressManager = progressManager;
        this.detailService = new DetailService(0);
        this.assetService = new AssetService(0);
    }

    /**
     * Metodo principale per raccogliere i dettagli degli anime.
     */
    public async run(): Promise<void> {
        logVerbose(`[AnimeDetailsCollector][run] Running operation to collect anime details`);

        // Carica i progressi
        await this.progressManager.load();
        const { anime } = this.progressManager.getStates();

        const animeReferences = await AnimeReferences.findAll();

        let resume = !anime; // Se 'anime' è null, inizia subito
        for (const animeReference of animeReferences) {
            if (!resume) {
                if (animeReference.animeId === anime) {
                    logInfo(`[AnimeDetailsCollector][run] Resuming from AnimeReference animeId: ${animeReference.animeId}`);
                    resume = true;
                } else {
                    continue; // Salta gli elementi già elaborati
                }
            }

            try {
                const expired = dayjs(animeReference.updatedAt).isBefore(dayjs().subtract(3, "day"));
                const exist = animeReference.detail === undefined;

                logVerbose(`[AnimeDetailsCollector][run] Processing AnimeReference id: ${animeReference.animeId}`);
                if (expired || exist) {
                    await this.processAnimeDetails(animeReference);
                    await this.progressManager.setStates({ anime: animeReference.animeId });
                } else {
                    logInfo(`[SUCCESS][AnimeDetailsCollector][run] AnimeReference id: ${animeReference.animeId} already exists.`);
                }
            } catch (error) {
                if (typeof error === "object" && error !== null && "type" in error) {
                    // Gestisce errori noti (ad esempio, blocco o banning)
                    if (error.type === APP_ERRORS.BANNED || error.type === APP_ERRORS.ROBOT) {
                        logError(`[BLOCKED][AnimeDetailsCollector][run] Execution blocked: ${error.type}`);
                        throw new Error(`Execution halted due to ${error.type}. Please resolve the issue and try again.`);
                    }

                    if (error.type !== APP_ERRORS.NO_RESULTS) {
                        logWarn(`[AnimeDetailsCollector][run] animeReference ${animeReference.animeId} error type: ${error.type}`);
                    } else {
                        await this.progressManager.setStates({ anime: animeReference.animeId });
                        logInfo(`[AnimeDetailsCollector][run] No results for animeReference: ${animeReference.animeId}. Ending collection.`);
                    }
                } else {
                    logError(`[AnimeDetailsCollector][run] Unexpected error on animeReference ${animeReference.animeId}: ${JSON.stringify(error)}`);
                }

                // Aggiorna lo stato prima di terminare
                await this.progressManager.setStates({ anime: animeReference.animeId });
                throw error; // Propaga l'errore critico
            }
        }

        // Reset dello stato
        await this.progressManager.setStates({ anime: null });
    }

    /**
     * Processa i dettagli di un anime dato il riferimento.
     * @param animeReference Il riferimento all'anime
     */
    private async processAnimeDetails(animeReference: AnimeReferences): Promise<void> {
        try {
            logVerbose(`[AnimeDetailsCollector][processAnimeDetails] Collecting details for AnimeReference id: ${animeReference.id}`);
            const { details, tags, image, description } = await this.detailService.get(animeReference.animeId);

            logInfo(`[AnimeDetailsCollector][processAnimeDetails] animeReference.id: ${animeReference.id}`);

            const [assetImage] = await AssetImages.findOrCreate({
                where: { thumbnail: await this.assetService.get(image.src), origin: image.src },
            });

            logInfo(`[AnimeDetailsCollector][processAnimeDetails] assetImage.origin: ${assetImage.origin}`);

            const [animeDescription] = await AnimeDescriptions.findOrCreate({
                where: { raw: description },
            });

            logInfo(`[AnimeDetailsCollector][processAnimeDetails] animeDescription.raw: ${animeDescription.raw}`);

            const [animeDetail] = await AnimeDetails.findOrCreate({
                where: { animeReference: animeReference.id },
                defaults: {
                    title: details.title || null,
                    type: details.type || null,
                    episodes: details.episodes || null,
                    season: details.season || null,
                    year_start: details.year.start || null,
                    year_end: details.year.end || null,
                    assetReference: assetImage.id || null,
                    descriptionReference: animeDescription.id || null,
                },
            });
            await this.processTags(animeDetail, tags);
        } catch (error) {
            logError(`[AnimeDetailsCollector][processAnimeDetails] Error processing AnimeReference id: ${animeReference.id}`);
            logError(JSON.stringify(error));
            throw error;
        }
    }

    /**
     * Processa i tag associati a un riferimento anime.
     * @param animeDetail Il riferimento anime associato
     * @param tags I tag da processare
     */
    private async processTags(animeDetail: AnimeDetails, tags: Array<{ id: string; name: string }>): Promise<void> {
        if (tags?.length > 0) {
            for (const tag of tags) {

                const [tagsReference] = await TagReferences.findOrCreate({
                    where: { tagId: _.toUpper(_.snakeCase(tag.id)) },
                });

                const [tagsDetail] = await TagDetails.findOrCreate({
                    where: { label: _.toUpper(_.snakeCase(tag.name)) },
                    defaults: {
                        tagReference: tagsReference.id || null,
                    },
                });

                const [animeTag] = await AnimeTags.findOrCreate({
                    where: {
                        tagDetail: tagsDetail.id,
                        animeDetail: animeDetail.id,
                    },
                });

                logVerbose(`[AnimeDetailsCollector][processTags] tagsReference size: ${formatBytes(sizeof(tagsReference))}`);
                logVerbose(`[AnimeDetailsCollector][processTags] tagsDetail size: ${formatBytes(sizeof(tagsDetail))}`);
                logVerbose(`[AnimeDetailsCollector][processTags] animeTag size: ${formatBytes(sizeof(animeTag))}`);
            }
        } else {
            logVerbose(`[AnimeDetailsCollector][processTags] No tags to process for AnimeReference id: ${animeDetail.id}`);
        }
    }
}
