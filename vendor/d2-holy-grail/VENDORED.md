# d2-holy-grail (Vendored)

This directory vendors the `d2-holy-grail` package so builds do not depend on a moving Git branch.

Source baseline:
- Repository: https://github.com/pyrosplat/d2-holy-grail
- Resolved commit: d20a43bbfe1fc6c2d0546cbc634e51be067aef7f

Update process:
1. Pull desired upstream commit into a temporary location.
2. Replace `client/src/common/seeds` and `client/src/common/definitions` here.
3. Re-test app behavior and commit with a note of the new upstream commit.
