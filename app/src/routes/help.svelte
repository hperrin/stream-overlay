<svelte:head>
  <title>Help - Stream Overlay</title>
</svelte:head>

<p>
  You can use this app to show borderless, transparent, click-through browser
  windows for streaming. For example, you can show your Twitch chat stream and
  alerts on your display, over your game.
</p>

<p>
  I made this app because I would often not notice my chat messages on my other
  monitor, and I'd prefer to have them come up on the display I'm looking at,
  rather than only in OBS. It's also great for single monitor streamers.
</p>

<p>
  <img
    style="width: 100%; height: auto"
    src="stream-overlay-clip.webp"
    alt="Screen capture showing Stream Overlay in use on top of a game."
  />
</p>

<h2>Usage</h2>

<p>
  Create a config file with your setup and save it to your computer. You can
  then open the config file with the app, or run it from within the app.
</p>

<p>
  You can also use this app from the command line, by providing the URL as the
  argument. Use <code>stream-overlay --help</code> to see all the available options.
</p>

<h2>Interaction</h2>

<p>
  You can see a list of your windows from the "Sylphweed's Stream Overlay" tray
  icon. Right click the icon to show the menu. You can also exit the app from
  here.
</p>

<p>
  When a window is focused (by clicking it from the tray icon menu) it will have
  an opaque background, and a handle to drag it around. Once it loses focus, it
  will go back to transparent, and will ignore all mouse events. It will be
  click-through, so you can click the apps behind it.
</p>

<h2>Fullscreen Apps</h2>

<p>
  Stream Overlay doesn't work over fullscreen apps, so your app needs to be in
  "borderless" or "borderless fullscreen" to allow Stream Overlay on top of it.
  If it's still not appearing on top, try setting it to windowed mode then back
  to borderless.
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
