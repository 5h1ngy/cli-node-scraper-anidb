import _ from "lodash";
import dayjs from "dayjs";
import sizeof from "object-sizeof";
import { promises as fs } from "fs";
import path from "path";

import { logInfo, logError, logWarn } from "@/shared/logger";
import { normalizeDate, isDateNormalized } from "@/utils/normalizeDate";
import formatBytes from "@/utils/formatBytes";
import { APP_ERRORS } from "@/handlers/appErrors";
import AnimeReferences from "@/models/AnimeReferences";
import getAnimeDetail from "@/services/getAnimeDetail";
import AssetImages from "@/models/AssetImages";
import AnimeDetails from "@/models/AnimeDetails";
import TagDetails from "@/models/TagDetails";
import TagReferences from "@/models/TagReferences";
import AnimeTags from "@/models/AnimeTags";

const REQUEST_DELAY = 2000; // Delay per le richieste

export default class AnimeDetailsCollector {
    private readonly PROGRESS_FILE: string;

    constructor() {
        this.PROGRESS_FILE = path.resolve(__dirname, "..", "..", "data", "progress.json");
    }

    /**
     * Salva il progresso nel file JSON.
     * @param animeId L'ID dell'anime che sta venendo processato
     */
    private async saveProgress(animeId: string | null): Promise<void> {
        const dataDir = path.dirname(this.PROGRESS_FILE);
        try {
            await fs.mkdir(dataDir, { recursive: true });
        } catch (err: any) {
            if (err.code !== "EEXIST") {
                logError(`[AnimeDetailsCollector][saveProgress] Failed to create progress directory: ${err.message}`);
                throw err;
            }
        }

        const progressData = { anime: animeId };
        try {
            await fs.writeFile(this.PROGRESS_FILE, JSON.stringify(progressData), "utf8");
            logInfo(`[AnimeDetailsCollector][saveProgress] Progress saved for animeId: ${animeId}`);
        } catch (err: any) {
            logError(`[AnimeDetailsCollector][saveProgress] Failed to save progress: ${err.message}`);
            throw err;
        }
    }

    /**
     * Carica il progresso dal file JSON.
     * @returns L'ID dell'anime che stava venendo processato
     */
    private async loadProgress(): Promise<string | null> {
        try {
            const data = await fs.readFile(this.PROGRESS_FILE, "utf8");
            const { anime } = JSON.parse(data);
            logInfo(`[AnimeDetailsCollector][loadProgress] Loaded progress: detailsInProgress = ${anime}`);
            return anime || null;
        } catch (err: any) {
            if (err.code === "ENOENT") {
                logWarn(`[AnimeDetailsCollector][loadProgress] Progress file not found. Starting fresh.`);
                await this.saveProgress(null);
                return null;
            } else {
                logError(`[AnimeDetailsCollector][loadProgress] Failed to load progress: ${err.message}`);
                throw err;
            }
        }
    }

    /**
     * Metodo principale per raccogliere i dettagli degli anime.
     */
    public async run(): Promise<void> {
        logWarn(`[AnimeDetailsCollector][run] Running operation to collect anime details`);

        const animeReferences = await AnimeReferences.findAll();
        const lastProgress = await this.loadProgress();

        for (const animeReference of animeReferences) {
            try {
                if (lastProgress && animeReference.animeId === lastProgress) {
                    logInfo(`[AnimeDetailsCollector][run] Resuming from AnimeReference animeId: ${animeReference.animeId}`);
                }

                const expired = dayjs(animeReference.updatedAt).isBefore(dayjs().subtract(3, "day"))
                const exist = animeReference.detail === undefined;

                logWarn(`[AnimeDetailsCollector][run] Processing AnimeReference id: ${animeReference.animeId}`);
                if (expired || exist) {
                    await this.processAnimeDetails(animeReference);
                    await this.saveProgress(animeReference.animeId); // Salva il progresso prima di processare
                } else {
                    logInfo(`[SUCCESS][AnimeDetailsCollector][run] AnimeReference id: ${animeReference.animeId} already exists.`);

                }
            } catch (error) {

                if (typeof error === "object" && error !== null && "type" in error) {
                    if (error.type !== APP_ERRORS.NO_RESULTS) {
                        logWarn(`[AnimeDetailsCollector][run] animeReference ${animeReference.animeId} error type: ${error.type}`);
                    } else {
                        await this.saveProgress(animeReference.animeId);
                        logInfo(`[AnimeDetailsCollector][run] No results for animeReference: ${animeReference.animeId}. Ending collection.`);
                    }
                } else {
                    logError(`[AnimeDetailsCollector][run] Unexpected error on animeReference ${animeReference.animeId}: ${JSON.stringify(error)}`);
                }
                await this.saveProgress(animeReference.animeId);
                throw error;
            }
        }

        await this.saveProgress(null); // Ripristina il progresso alla fine
    }

    /**
     * Processa i dettagli di un anime dato il riferimento.
     * @param animeReference Il riferimento all'anime
     */
    private async processAnimeDetails(animeReference: AnimeReferences): Promise<void> {
        try {
            logWarn(`[AnimeDetailsCollector][processAnimeDetails] Collecting details for AnimeReference id: ${animeReference.id}`);
            const { details, tags, image } = await getAnimeDetail(REQUEST_DELAY, animeReference.animeId);

            logInfo(`[AnimeDetailsCollector][processAnimeDetails] animeReference.id: ${animeReference.id}`);

            const [assetImage] = await AssetImages.findOrCreate({
                where: { thumbnail: image.base64, origin: image.src }
            });

            logInfo(`[AnimeDetailsCollector][processAnimeDetails] assetImage.origin: ${assetImage.origin}`);

            const [animeDetail] = await AnimeDetails.findOrCreate({
                where: { animeReference: animeReference.id },
                defaults: {
                    title: details.title || null,
                    type: details.type || null,
                    year: normalizeDate(details.year) || null,
                    season: details.season || null,
                    assetReference: assetImage.id || null,
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
     * @param tags I tag da processare
     * @param animeDetail Il riferimento anime associato
     */
    private async processTags(animeDetail: AnimeDetails, tags: Array<{ id: string, name: string }>): Promise<void> {
        if (tags?.length > 0) {
            for (const tag of tags) {

                const [tagsReference] = await TagReferences.findOrCreate({
                    where: { tagId: _.toUpper(_.snakeCase(tag.id)) },
                });

                const [tagsDetail] = await TagDetails.findOrCreate({
                    where: { label: _.toUpper(_.snakeCase(tag.name)) },
                    defaults: {
                        tagReference: tagsReference.id || null,
                    }
                });

                const [animeTag] = await AnimeTags.findOrCreate({
                    where: {
                        tagDetail: tagsDetail.id,
                        animeDetail: animeDetail.id,
                    },
                });

                logWarn(`[AnimeDetailsCollector][processTags] tagsReference size: ${formatBytes(sizeof(tagsReference))}`);
                logWarn(`[AnimeDetailsCollector][processTags] tagsDetail size: ${formatBytes(sizeof(tagsDetail))}`);
                logWarn(`[AnimeDetailsCollector][processTags] animeTag size: ${formatBytes(sizeof(animeTag))}`);
            }
        } else {
            logWarn(`[AnimeDetailsCollector][processTags] No tags to process for AnimeReference id: ${animeDetail.id}`);
        }
    }
}
