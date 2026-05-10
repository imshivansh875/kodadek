import { Component, createMemo } from "solid-js";
import { trpc } from "~/utils/trpc";
import SvgPlusCircle from "../icons/noun-add-button.svg";
import SvgPause from "../icons/bx-pause.svg";
import SvgPlay from "../icons/bx-play.svg";
import SvgShuffle from "../icons/bx-shuffle.svg";
import SvgSkipNext from "../icons/bx-skip-next.svg";
import SvgRepeat2 from "../icons/repeat-2.svg";
import SvgRepeatone from "../icons/repeat-one.svg";
import SvgSkipPrevious from "../icons/bx-skip-previous.svg";
import SvgCheckmarkCircle from "../icons/noun-tick.svg";
import PlayerControlIcon from "./PlayerControlIcon";
import PlayerProgressBar from "./PlayerProgressBar";

interface PlayerControlsType {
  isSaved: boolean;
}

const PlayerControls: Component<PlayerControlsType> = (props) => {
  const nowPlaying = trpc.metadata.nowPlaying.useQuery();
  const shouldDisableControls = createMemo(
    () =>
      nowPlaying.data === undefined ||
      !nowPlaying.data?.device ||
      nowPlaying.data?.device?.is_restricted
  );

  const utils = trpc.useContext();
  const onSuccessMutator = () => ({
    onSuccess: () => {
      // slight delay to allow change to propagate through backend
      setTimeout(() => {
        utils.metadata.nowPlaying.invalidate();
      }, 500);
    },
  });
  const setShuffle = trpc.actions.shuffle.useMutation();
  const setPrevious = trpc.actions.previous.useMutation();
  const setPause = trpc.actions.pause.useMutation();
  const setPlay = trpc.actions.play.useMutation();
  const setNext = trpc.actions.next.useMutation();
  const setRepeat = trpc.actions.repeat.useMutation();
  const nextRepeatMode = () => {
  switch (nowPlaying.data?.repeat_state) {
    case "off":
      return "context";

    case "context":
      return "track";

    default:
      return "off";
  }
};

  return (
    <div
      class="hidden fixed w-full left-0 bottom-0 flex items-center justify-between px-14"
      style={{
        "background-color": "rgba(0,0,0,0.2)",
        height: "120px",
        "align-items": "center",
      }}
    >
      <PlayerProgressBar />
      <PlayerControlIcon
        src={SvgShuffle}
        isDisabled={shouldDisableControls()}
        showActiveIndicator={nowPlaying.data?.shuffle_state}
        onClick={() =>
          setShuffle.mutate({ state: !nowPlaying.data?.shuffle_state })
        }
      />
      <PlayerControlIcon
        src={SvgSkipPrevious}
        isDisabled={shouldDisableControls()}
        enlargeIcon={true}
        onClick={setPrevious.mutate}
      />
      {nowPlaying.data?.is_playing ? (
        <PlayerControlIcon
          src={SvgPause}
          isDisabled={shouldDisableControls()}
          enlargeIcon={true}
          onClick={setPause.mutate}
        />
      ) : (
        <PlayerControlIcon
          src={SvgPlay}
          isDisabled={shouldDisableControls()}
          enlargeIcon={true}
          onClick={setPlay.mutate}
        />
      )}
      <PlayerControlIcon
        src={SvgSkipNext}
        isDisabled={shouldDisableControls()}
        enlargeIcon={true}
        onClick={setNext.mutate}
      />
      <PlayerControlIcon
        src={nowPlaying.data?.repeat_state === "track" ? SvgRepeatone : SvgRepeat2}
        showActiveIndicator={nowPlaying.data?.repeat_state !== "off"}
        isDisabled={shouldDisableControls()}
        onClick={() =>
          setRepeat.mutate({
            state: nextRepeatMode(),
          })
        }
      />
    </div>
  );
};

export default PlayerControls;
