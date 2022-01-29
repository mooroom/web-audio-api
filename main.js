const context = new AudioContext();
const osc = new OscillatorNode(context);
const amp = new GainNode(context, { gain: 0.1 });
// osc.connect(amp).connect(context.destination);
// osc.start();

let toggler = true;

window.addEventListener("load", () => {
  const buttonEl = document.getElementById("start-audio");
  buttonEl.disabled = false;
  buttonEl.addEventListener("click", () => {
    if (toggler === true) {
      context.resume();
    } else {
      context.suspend();
    }
    toggler = !toggler;
  });
});

const playSample = (audioBuffer, audioContext) => {
  const bufferSource = new AudioBufferSourceNode(audioContext, {
    buffer: audioBuffer,
  });
  const amp = new GainNode(audioContext);
  bufferSource.connect(amp).connect(audioContext.destination);
  bufferSource.start();
};

class DrumCell {
  constructor(outputNode, audioBuffer) {
    this._context = outputNode.context;
    this._buffer = audioBuffer;
    this._outputNode = outputNode;
  }

  playSample() {
    const bufferSource = new AudioBufferSourceNode(this._context, {
      buffer: this._buffer,
    });
    const amp = new GainNode(this._context);
    bufferSource.connect(amp).connect(this._outputNode);
    bufferSource.start();
  }
}
