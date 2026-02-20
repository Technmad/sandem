# WebContainer & Terminal Integration To-Do

## Phase 1: Infrastructure & Security Prep
*WebContainers require strict cross-origin isolation to enable `SharedArrayBuffer` in the browser. If you skip this, the container will instantly crash.*

- [ ] **Install dependencies:**
  - Run `pnpm add @webcontainer/api xterm @xterm/addon-fit`
- [ ] **Configure Vite/SvelteKit Headers:**
  - Open `vite.config.ts`.
  - Add a custom Vite plugin or configure the dev server headers to inject:
    - `Cross-Origin-Embedder-Policy: require-corp`
    - `Cross-Origin-Opener-Policy: same-origin`
  - *Note: You may also need to add these to `src/hooks.server.ts` for the production build depending on your hosting provider.*
- [ ] **Update `.gitignore`:**
  - Ensure `.env.local` is ignored so you don't leak Convex credentials when sharing code.

## Phase 2: Building the Terminal UI Component
*Creating a Svelte 5 component to render the black box and handle keystrokes.*

- [ ] **Create `src/lib/components/Terminal.svelte`:**
  - Add a `bind:this={terminalElement}` to a `div` wrapper.
  - Import `Terminal` from `xterm` and `FitAddon` from `@xterm/addon-fit`.
  - Import the xterm CSS globally in the component or in `app.css` (`import 'xterm/css/xterm.css'`).
- [ ] **Initialize inside `onMount`:**
  - Instantiate `new Terminal({ convertEol: true })`.
  - Instantiate and load the `FitAddon`.
  - Call `terminal.open(terminalElement)`.
  - Call `fitAddon.fit()` so it fills the container.
- [ ] **Handle window resizing:**
  - Add a `svelte:window onresize={...}` listener to call `fitAddon.fit()` whenever the browser resizes.
- [ ] **Export the terminal instance:**
  - Expose the raw `terminal` instance via a Svelte 5 `$derived` or by passing a callback prop so the parent page can hook into its data streams.

## Phase 3: WebContainer Singleton Setup
*WebContainers are heavy and can only be booted once per page load. You need a centralized way to manage the instance.*

- [ ] **Create `src/lib/webcontainer.svelte.ts`:**
  - Export a singleton variable `let webcontainerInstance = $state(null)`.
  - Write an async `bootContainer()` function:
    - Check if the instance already exists; if yes, return it.
    - Call `WebContainer.boot()`.
    - Save the result to the singleton and return it.
- [ ] **Define the initial file system:**
  - Create a constant representing the dummy files the container will load on boot (e.g., a basic `package.json` and an `index.js` file).
  - Pass this tree to `webcontainerInstance.mount(initialFiles)`.

## Phase 4: Connecting the Streams (The Hard Part)
*Wiring the UI to the invisible Node backend.*

- [ ] **Create the Shell Process:**
  - In your page component (e.g., `/code/[id]/+page.svelte`), wait for both the Terminal and the WebContainer to mount.
  - Call `await webcontainerInstance.spawn('jsh')` to start the bash-like shell.
- [ ] **Pipe Output (Container -> Terminal):**
  - Listen to the shell's output stream.
  - Pipe it to `terminal.write(data)`.
- [ ] **Pipe Input (Terminal -> Container):**
  - Listen to `terminal.onData((data) => { ... })`.
  - Take the keystrokes and write them to the shell process's input writer.

## Phase 5: Tying it to Liveblocks (The Editor)
*When someone types in the Liveblocks CodeMirror editor, the WebContainer needs to see those changes.*

- [ ] **Listen to CodeMirror updates:**
  - In `Editor.svelte`, tap into the CodeMirror/Yjs update event.
- [ ] **Write to the WebContainer FS:**
  - When the code changes, call `webcontainerInstance.fs.writeFile('/index.js', newCode)`.
- [ ] **Debounce the FS writes:**
  - Add a utility to throttle the `writeFile` calls (e.g., 300ms) so you don't overwhelm the container's file system on every single keystroke.

## Phase 6: The Dev Server Preview (The "StackBlitz" Window)
*If the user runs a web server inside the terminal, you need to show them the result.*

- [ ] **Listen for ports opening:**
  - Hook into `webcontainerInstance.on('server-ready', (port, url) => { ... })`.
- [ ] **Render an Iframe:**
  - Create a Svelte `$state` variable `let previewUrl = $state('')`.
  - When the `server-ready` event fires, update `previewUrl = url`.
  - Render an `<iframe src={previewUrl}>` next to your editor.