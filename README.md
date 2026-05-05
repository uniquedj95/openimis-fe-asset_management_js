# openIMIS Frontend Asset Management module

This repository holds the files of the openIMIS Frontend **Asset Management** module.

It is dedicated to be bootstrapped against [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

The module is built with [rollup](https://rollupjs.org/).
In development mode, you can use `npm link` and `npm start` to continuously scan for changes and automatically update your development server.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Main Menu Contributions

* **Assets** (`assetManagement.menu.assets`), displayed if user has the right `101501`.

## Other Contributions

* `core.Router`: routes for the asset list, asset detail, and asset assignment history pages will be registered as those features land.

## Available Contribution Points

* `assetManagement.MainMenu.contribution` — additional entries to expose under the Asset Management main menu.

## Dispatched Redux Actions

To be defined as actions are implemented.

## Other Modules Listened Redux Actions

None.

## Other Modules Redux State Bindings

* `state.core.user` — to access user info (rights, etc.).

## Configuration Options

To be defined.
