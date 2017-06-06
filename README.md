# lemonsync-js
A Javascript tool to sync local file changes with a live [LemonStand](https://lemonstand.com/) store.

## Installation

To install lemonsync, first install [Node.js](https://nodejs.org/en/). This comes with npm, the package manager for node.js applications. To confirm that you have npm installed you can run this command in your terminal:

```
$ 🍋  npm -v
```

Now you can install lemonsync:
```
$ 🍋  [sudo] npm install lemonsync -g
```

## Usage

1. Download a theme from your [LemonStand](https://lemonstand.com/) store. 

2. Create a JSON file, **lemonsync.json** and place it in your theme folder. This JSON should contain the following data:

```
{
  "store": "http://yourstore.lemonstand.com",
  "api_key": "ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678910",
  "ignore_patterns": [ "*.tmp", "*/.git*"]
}
```

3. From within the theme folder, run:

```
$ 🍋  lemonsync
```
