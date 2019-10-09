// MIDI module.
//
// This currently supports receiving MIDI data from the server, tunnelling
// it through the websocket that we use for the patchbay.
//
// The same module could support receiving data client side using the WebMIDI
// API, but it doesn't at the moment.

class MIDI {
  constructor(patchbay) {
    this.pb = patchbay;

    this.subscribed = false;
    this.inner_callback = null;

    this.cc=Array(128).fill(0.5)
  }

  // Ask server to list each connected MIDI device.
  listInputs() {
    return new Promise((resolve, reject) => {
      var replyCb = function(data) {
        this.pb.signaller.removeListener('midi-inputs', replyCb);
        resolve(data);
      }.bind(this)
      this.pb.signaller.on('midi-inputs', replyCb);
      this.pb.signaller.emit('midi-list-inputs')
    })
  }

  // Ask server to start forwarding all events on a specific port.
  subscribe(port, callback) {
    if (this.subscribed)
      throw "Already subscribed to MIDI events.";

    if (callback === undefined)
      callback = this.default_callback.bind(this);

    this.pb.signaller.emit('midi-subscribe', { port: port });

    this.inner_callback = function(data) {
      callback(data['delta_time'], data['message']);
    }

    this.pb.signaller.on('midi-event', this.inner_callback);
    this.subscribed = true;
  }

  // Ask server to stop forwarding all events.
  unsubscribe() {
    this.pb.signaller.emit('midi-unsubscribe');
    this.pb.signaller.removeListener('midi-event', this.inner_callback);
    this.subscribed = false;
    this.callback = null;
  }

  // A MIDI event callback which updates the `MIDI.cc` array.
  //
  // Adapted from https://github.com/ojack/hydra/blob/master/docs/midi.md
  default_callback(deltaTime, midiMessage) {
    var arr = midiMessage;
    var index = arr[1]
    //console.log('Midi received on cc#' + index + ' value:' + arr[2])    // uncomment to monitor incoming Midi
    var val = (arr[2]+1)/128.0  // normalize CC values to 0.0 - 1.0
    this.cc[index] = val;
  }
}

module.exports = MIDI
