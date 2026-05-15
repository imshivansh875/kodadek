import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
} from "solid-js";
import { trpc } from "~/utils/trpc";
import DynamicBackground from "./DynamicBackground";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screensaver from "./Screensaver";
import SvgMusic from "./icons/bx-music.svg";

const PREVIEW_SIZE = 400;

const getAlbumMetadata = ({
    album,
    name,
}: {
    album: AlbumMetadata;
    name: string;
}) => ({
    preview: album.images[0].url,
    title: name,
    subtitle: album.artists.map((artist) => artist.name).join(", "),
});

const getEpisodeMetadata = (episode: EpisodeMetadata) => ({
    preview: episode.images[0].url,
    title: episode.name,
    subtitle: episode.show.name,
});

const metadataMappers: Record<
    SpotifyApi.CurrentlyPlayingObject["currently_playing_type"],
    (item: any) => UiMetadata
> = {
    track: getAlbumMetadata,
    episode: getEpisodeMetadata,
    ad: (e) => e, // TODO
    unknown: (e) => e, // TODO
};

const SpotifyNowPlaying: Component = () => {
    const utils = trpc.useContext();
    const [showScreensaver, setShowScreensaver] = createSignal(true);
    const nowPlayingQuery = trpc.metadata.nowPlaying.useQuery();
    const isSavedQuery = trpc.metadata.saved.useQuery(
        () => ({ ids: [nowPlayingQuery.data?.item?.id || ""] }),
        () => ({
            enabled: !!nowPlayingQuery.data?.item?.id,
        })
    );

    createEffect(() => {
        const thisNowPlaying = nowPlayingQuery.data;
        let interval: ReturnType<typeof setInterval>;
        let refreshTimeout = !!thisNowPlaying?.is_playing ? 5500 : 15000;
        if (thisNowPlaying !== undefined) {

            const songDuration = thisNowPlaying?.item?.duration_ms ?? 0;
            const currentProgress = thisNowPlaying?.progress_ms ?? 0;

            const timeLeftOnSong = songDuration - currentProgress;
            if (thisNowPlaying?.is_playing && timeLeftOnSong < refreshTimeout) {
                refreshTimeout = timeLeftOnSong + 1000;
            }

        }

        interval = setInterval(() => utils.metadata.nowPlaying.invalidate(), refreshTimeout);

        onCleanup(() => {
            clearInterval(interval);
        });
    });

    const metadata = createMemo<UiMetadata>(() => {
        type MapperKey = keyof typeof metadataMappers;
        const mapperKey = (nowPlayingQuery.data?.currently_playing_type ?? "track") as MapperKey;
        const mapper = metadataMappers[mapperKey];

        const mapAttempt =
            mapper &&
            nowPlayingQuery.data?.item &&
            mapper(nowPlayingQuery.data?.item);

        if (!mapAttempt) {
            setShowScreensaver(true);
            return {
                preview: "",
                title: "",
                subtitle: "",
                missingNowPlayingContext: true,
            };
        } else {
            if (showScreensaver()) {
                setShowScreensaver(false);
            }
            return mapAttempt;
        }
    });

    return (
        <div class="w-full h-full">
            {showScreensaver() ? (
                <Screensaver />
            ) : (
                <DynamicBackground imgUrl={metadata()?.preview}>
                    <div class="flex flex-col items-center justify-center w-full h-full gap-6">
                        <div
                            class="bg-base relative flex items-center justify-center color-gray-500 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl overflow-hidden group"
                            style={{
                                width: `${PREVIEW_SIZE}px`,
                                height: `${PREVIEW_SIZE}px`,
                            }}
                        >
                            <div class="absolute z-0 opacity-50 group-hover:opacity-75 transition-opacity duration-300">
                                <img
                                    src={SvgMusic}
                                    width={`${PREVIEW_SIZE / 2}px`}
                                    height={`${PREVIEW_SIZE / 2}px`}
                                />
                            </div>
                            <div
                                class="relative z-10 w-full h-full transition-transform duration-500 group-hover:scale-105"
                                style={{
                                    "background-image": `url(${metadata()?.preview})`,
                                    "background-position": "center center",
                                    "background-repeat": "no-repeat",
                                    "background-size": "cover",
                                }}
                            />
                        </div>
                        <div class="flex flex-col items-center text-center px-4 w-full">
                            <p class="font-heading text-5xl pt-4 pb-2 text-ellipsis overflow-hidden whitespace-nowrap w-full max-w-2xl leading-tight drop-shadow-md">
                                {metadata()?.title}
                            </p>
                            <p class="opacity-80 text-2xl font-semibold text-ellipsis overflow-hidden whitespace-nowrap w-full max-w-2xl drop-shadow">
                                {metadata()?.subtitle}
                            </p>
                        </div>
                    </div>

                    <PlayerControls isSaved={!!isSavedQuery.data?.[0]} />
                </DynamicBackground>
            )}
        </div>
    );
};

export default SpotifyNowPlaying;
