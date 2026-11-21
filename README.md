# IsBenben/scratch-paint

This fork of [TurboWarp/scratch-paint](https://github.com/TurboWarp/scratch-paint) provides the Scratch Editor workspace's native color picker improvements. It can run as a standalone paint playground or as part of the [scratch-gui fork](https://github.com/IsBenben/scratch-gui).

## Color picker improvements

The picker supports a 2D saturation and brightness control with editable numeric values. Dragging updates colors immediately and preserves fractional values. Native HSV state also preserves hue and saturation when brightness reaches zero.

Horizontal sliders begin dragging when pressed anywhere on the track and respond to either wheel axis. The 2D area adjusts saturation with horizontal scrolling and brightness with vertical scrolling. GUI's addons control the enhanced cursor and handle appearance, and enabling Better Color Picker allows Ctrl snapping to multiples of 5.

## Standalone development

Use Node.js 24 and pnpm 10.33.0. Clone the develop branch, install dependencies, and start the playground's development server.

```sh
git clone --branch develop https://github.com/IsBenben/scratch-paint.git
cd scratch-paint
pnpm install --frozen-lockfile
pnpm start
```

The development playground is available at [http://localhost:8078/playground/](http://localhost:8078/playground/). The root URL, [http://localhost:8078/](http://localhost:8078/), serves the built playground.

To build or test paint, run the following commands from its directory. If the development server is running, use another terminal.

```sh
pnpm run build
pnpm run test
pnpm run lint
```

## Combined editor development

For GUI integration, clone the workspace with its pinned submodules and run these commands from the workspace root.

```sh
git clone --recurse-submodules https://github.com/IsBenben/scratch-editor-workspace.git
cd scratch-editor-workspace
pnpm install --frozen-lockfile
pnpm --filter scratch-gui run prepare
pnpm --filter scratch-gui start
```

GUI declares this fork as a pinned HTTPS Git dependency. The workspace overrides it with `workspace:*`, so local development uses the sibling paint source without a global link step. Paint's standalone lockfile supports its own development and CI, while the root lockfile manages the combined editor.

Before editing a submodule checkout, switch to the develop branch. Commit paint changes before running `pnpm run sync` at the workspace root, and ensure the paint working tree is clean. The sync script updates GUI's pinned dependency, CI revision, configuration templates, and lockfile copy. Push paint first, GUI second, and the workspace references last.

When paint's dependencies change, update the workspace lockfile with `pnpm install` and update the standalone lockfile with `pnpm --dir scratch-paint --ignore-workspace install --lockfile-only`. Run the sync command afterwards to refresh GUI's workspace files.

## Verification and further reading

The pnpm migration passed frozen installation, a full paint build, and all 63 paint unit tests. Paint lint also passed in a checkout using LF line endings. Repository configuration checks on November 21, 2026 passed frozen installation and all 63 unit tests with Node.js 24.22.3 and pnpm 10.33.0. Hosted CI results have not yet been verified.

See the [workspace README](https://github.com/IsBenben/scratch-editor-workspace#readme) for the shared development workflow and the [TurboWarp development documentation](https://docs.turbowarp.org/development/getting-started) for general guidance.

## License

This fork is licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE) for details.

The original scratch-paint license is retained below as required by its terms.

```
Copyright (c) 2016, Massachusetts Institute of Technology
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
