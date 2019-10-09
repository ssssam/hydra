# Hydra [Sam Thursfield's fork]

This is a fork of Olivia Jack's [Hydra](https://github.com/ojack/hydra/) visual synthesizer.

For information about Hydra, see [the upstream README file](https://github.com/ojack/hydra/).

## Recording videos

This fork adds a 'record' button to the menu, which can be used to export
videos of your Hydra performance.

Start recording by pushing the record button. It will turn into a stop button.
When you press stop, you'll be offered a download of a .webm file containing
what was recorded.

Code is in [sam/record branch](https://github.com/ssssam/hydra/tree/sam/record).

## Server-side MIDI

This feature is a hack to work around
[lack of WebMIDI support in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=836897).

The server will share connected MIDI devices with the client. You can see the list of devices
by running this in the console:

    MIDI.listInputs().then((inputs) => console.log(inputs));

To connect to a MIDI device on port #1, call this:

    MIDI.subscribe(1)

You'll then be able to access the `MIDI.cc` array in your patches, which contains
a value between 0 and 1 for each MIDI continuous controller available.

Code in ([sam/midi branch](https://github.com/ssssam/hydra/tree/sam/midi)).

## Development and bug fixes

  * README updated.
  * Generated files bundle.js and package-lock.json removed from source tree.
  * Various other bugfixes (see [branch sam/bugfix](https://github.com/ssssam/hydra/tree/sam/bugfix))
