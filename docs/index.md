# Local LemonStand theme development made easy


LemonSyncJS is a tool for syncing local theme files with a live [LemonStand](https://lemonstand.com/) store. It runs along side your development tools, watching for local changes, magically updating your store theme. It's built using JavaScript and Node (as an `npm` module). It runs on Mac, Windows, and Linux.

## Installation

To install LemonSync, first install [Node.js](https://nodejs.org/en/) 6 or newer. NodeJS includes `npm`, the package manager for NodeJS applications.

To confirm that you have `npm` installed you can run this command in your terminal:

```
🍋 npm -v
```

With `npm` you can now install LemonSyncJS:

```bash
🍋  npm install lemonsync -g
```

Depending on how you have installed `npm`, you may need to run the `-g` global install using `sudo`.

### Uninstalling previous versions of LemonSync

If you happen have the old Python version of LemonSync installed, you will need to uninstall it as well:

```bash
🍋 sudo pip uninstall lemonsync
```

You can verify that you have LemonSync installed properly by running the following:

```bash
🍋 which lemonsync
/Users/<youruser>/.npm/bin/lemonsync
```

_Note: You may need to start your terminal application after uninstalling previous versions of LemonSync._


## Usage

1. Download a theme from your [LemonStand](https://lemonstand.com/) store.
2. Create a new configuration file, name it `lemonsync.json`, and place it in your theme folder (see example below).
3. Now you can run LemonSync from within the theme folder.

To run LemonSync:

```bash
🍋 lemonsync
```

That's it!


### Example `lemonsync.json` configuration

Your LemonSync-js configuration is a JSON file that should contain the following:

```json
{
  "theme_code": "zest",
  "store": "https://yourstore.lemonstand.com",
  "api_token": "<API token from your store>",
  "ignore_patterns": [ "*.tmp", ".git", "lemonsync.json" ]
}
```

_Note: If you have set up a custom domain (e.g. yourstore.com) for your store, your configuration file should use that for the `store` URL instead of yourstore.lemonstand.com domain._

Example: [lemonsync.json](https://raw.githubusercontent.com/lemonstand/lemonsync-js/master/examples/lemonsync.json)


## Additional options

| Option      | Description |
| ----------- | ----------- |
| `--version` | Show the current version of `lemonsync` |
| `--verbose` | Show additional logging detail |
| `--network-logging` | Show detail of each network request |


### Advanced options

**Warning: using the `--reset=remote` option will overwrite your store's remote theme and can delete your remote theme if used incorrectly.**

| Option      | Parameter   | Description |
| ----------- | ----------- | ----------- |
| `--reset` | `local` | Overwrite local theme with REMOTE store version |
| `--reset` | `remote` | Overwrite store theme with LOCAL version |

```bash
# Reset local theme files with your store's theme
🍋  lemonsync --reset=local

# Reset and overwrite your remote theme with your local
🍋  lemonsync --reset=remote
```




