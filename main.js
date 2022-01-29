import DrumCell from "./DrumCell.js";

const getAudioBufferByFileName = async (
  audioContext,
  fileName,
  directoryHandle
) => {
  const fileHandle = await directoryHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
};

const buildDrumCellMap = async (outputNode, directoryHandle) => {
  const drumCellMap = {};
  for await (const entry of directoryHandle.values()) {
    if (entry.name.startsWith("drum") && entry.name.endsWith("mp3")) {
      const audioBuffer = await getAudioBufferByFileName(
        outputNode.context,
        entry.name,
        directoryHandle
      );
      drumCellMap[entry.name] = new DrumCell(outputNode, audioBuffer);
    }
  }

  return drumCellMap;
};

const bindKeyToDrumCellMap = (drumCellMap) => {
  const keys = "qwerasdfzxcv".split("");
  const drumCells = Object.values(drumCellMap);
  const keyToDrumCellMap = {};
  for (let i = 0; i < drumCells.length; i++) {
    keyToDrumCellMap[keys[i]] = drumCells[i];
  }

  window.addEventListener("keydown", (e) => {
    if (e.key in keyToDrumCellMap) {
      keyToDrumCellMap[e.key].playSample();
    }
  });
};

const buildMainBus = async (audioContext, directoryHandle) => {
  const compressor = new DynamicsCompressorNode(audioContext);
  const irBuffer = await getAudioBufferByFileName(
    audioContext,
    "ir-hall.mp3",
    directoryHandle
  );
  const convolver = new ConvolverNode(audioContext, { buffer: irBuffer });
  const reverbGain = new GainNode(audioContext, { gain: 0.25 });

  compressor.connect(audioContext.destination);
  convolver.connect(reverbGain).connect(audioContext.destination);
  compressor.connect(convolver);

  return compressor;
};

const initializeDrumMachine = async (audioContext) => {
  const directoryHandle = await window.showDirectoryPicker();
  const mainBus = await buildMainBus(audioContext, directoryHandle);
  const drumCellMap = await buildDrumCellMap(mainBus, directoryHandle);
  await bindKeyToDrumCellMap(drumCellMap);
};

const audioContext = new AudioContext();

const onLoad = async () => {
  const $button = document.getElementById("start-audio");
  $button.disabled = false;
  $button.addEventListener(
    "click",
    async () => {
      await initializeDrumMachine(audioContext);
      audioContext.resume();
      $button.disabled = true;
      $button.textContent = "재생중...";
    },
    false
  );
};

window.addEventListener("load", onLoad);
