<h2>SylphWeed's Stream Overlay</h2>

<p>
  This app shows borderless, transparent, click-through browser windows for
  streaming. For example, you can show your Twitch chat and alerts on your
  display, over your game.
</p>

<p>
  I made this app because I would often not notice my chat messages on my other
  monitor, and I'd prefer to have them come up on the display I'm looking at,
  rather than in an OBS overlay. It's also great for single monitor streamers.
</p>

<p>
  <img
    style="width: 100%; height: auto; max-width: 500px;"
    src="{assets}/stream-overlay-clip.webp"
    alt="Screen capture showing Stream Overlay in use on top of a game."
  />
</p>

<h2>Usage</h2>

<p>
  Create a config file with your overlay setup and save it to your computer. You
  can then open the config file with the app, or run it from within the app.
</p>

<h2>Interaction</h2>

<p>
  You can see a list of open overlay windows from the "Sylphweed's Stream
  Overlay" tray icon's menu. You can also open this config editor or exit the
  app from here.
</p>

<p>
  When a window is focused (by clicking it from the tray icon menu) it will have
  an opaque background, and a handle to drag it around. Once it loses focus, it
  will go back to transparent, and will be click-through again, so you can click
  the apps behind it.
</p>

<h2>Fullscreen Apps</h2>

<p>
  Stream Overlay doesn't work over proper fullscreen windows, so your game needs
  to be in "borderless" or "borderless fullscreen" to allow Stream Overlay on
  top of it. If it's still not appearing on top, try setting it to windowed mode
  then back to borderless.
</p>

<h2>Display as native window</h2>

<p>
  By default, an overlay window is created as a new HTML page with a
  customizable title and an embeddable window (iframe) with a web resource. Some
  web resources cannot be created as embeddable pages due to limitations set by
  web resource providers (e. g. Twitch Alerts). For such resources, the only way
  to display them is in a native window. This window will not have a draggable
  title bar or a close button, so it will be a bit harder to work with.
</p>

<h2>Support Me</h2>

<p>
  You can support me directly by supporting my software company, SciActive, on
  Patreon:<br />
  <a href="https://www.patreon.com/sciactive" target="_blank"
    >https://www.patreon.com/sciactive</a
  ><br /><br />
  You can also support me for free by following me on Twitch:<br />
  <a href="https://www.twitch.tv/sylphweed" target="_blank"
    >https://www.twitch.tv/sylphweed</a
  >
</p>

<script lang="ts">
  import { assets } from '$app/paths';
</script>
