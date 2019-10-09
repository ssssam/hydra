// Server side MIDI interface.
//
// This is intended for situations where WebMIDI isn't supported (such as Firefox),
// and where the server is running on the user's local machine with only 1 client.
//
// The server will forward MIDI data to the client over the websocket connection.

const midi = require('midi')

class MIDIForwarder {
  constructor(socket, port) {
    this.input = new midi.Input();
    this.socket = socket

    // FIXME: this may fail, but it'll just print an error to the console and continue. E.g.:
    //
    //   MidiInAlsa::openPort: ALSA error making port connection.
    var result = this.input.openPort(port);

    // Ignore sysex, timing and active sensing messages.
    this.input.ignoreTypes(false, false, false);

    this.input.on('message', this._midiEvent.bind(this));
  }

  _midiEvent(deltaTime, message) {
    //console.log(`MIDI event: ${deltaTime} ${message}`)
    this.socket.emit('midi-event', { delta_time: deltaTime, message: message })
  }

  close() {
    this.input.off('midi-event', this._midiEvent);
    this.input.closePort()
  }
}

module.exports = {
  // Return a list of MIDI devices available on the server.
  listInputs: function() {
   const input = new midi.Input();
    var inputs = [];
    for (var i = 0; i < input.getPortCount(); i++) {
      inputs.push(input.getPortName(i));
    }
    return inputs;
  },

  // Send MIDI events from a numbered MIDI input port to a WebSocket connection.
  subscribe: function(socket, port) {
    if (socket._midiForwarder != undefined) {
      console.log(`midi-server.subscribe(): Client ${socket.id} is already subscribed to a MIDI port.`);
    } else {
      socket._midiForwarder = new MIDIForwarder(socket, port);
      console.log(`midi-server.subscribe(): Client ${socket.id} now subscribed to events on MIDI port ${port}.`);
    }
  },

  unsubscribe: function(socket) {
    if (socket._midiForwarder == undefined) {
      console.log(`midi-server.unsubscribe(): Client ${socket.id} doesn't have a subscription.`);
    } else {
      socket._midiForwarder.close();
      delete socket._midiForwarder;
      console.log(`midi-server.unsubscribe(): Client ${socket.id} now unsubscribed from MIDI events.`);
    }
  }
}
