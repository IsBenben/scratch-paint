# TurboWarp/scratch-paint

Modified version of scratch-paint for TurboWarp

## Building

```bash
git clone https://github.com/TurboWarp/scratch-paint.git
cd scratch-paint
pnpm install --frozen-lockfile
pnpm start
pnpm run build
```

Development playground runs on http://localhost:8078/playground/. Note that http://localhost:8078/ gives you the **built** playground, not the development playground.

This checkout uses Node.js 24.18.0 and pnpm 10.33.0. For GUI development, keep it next to `scratch-gui` and follow that repository's workspace setup instructions. Install at the workspace root so that the GUI dependency is linked with `workspace:*`. The standalone lockfile supports paint's own CI; the workspace lockfile supports the combined editor. The native picker changes and pnpm configuration are also retained as a patch in `scratch-gui/scripts/workspace`.

For more information, see https://docs.turbowarp.org/development/getting-started

## License

TurboWarp/scratch-paint is licensed under the GNU General Public License version 3.0. See LICENSE for more information.

The original scratch-paint that this is based on uses the following license:

```
Copyright (c) 2016, Massachusetts Institute of Technology
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
