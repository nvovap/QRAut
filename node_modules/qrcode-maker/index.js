#!/usr/bin/env node

/**
 * qrcode-maker
 * Quick, simple generate QRcode as you like
 *
 * @file index.js Entrance
 * @author chenqiushi(tracy909@126.com)
 *
 * Update Time: 2016-05-20
 */

var qrcode = require('./lib/main'),
    path = require('path'),
    fs = require('fs');

var command = process.argv[1].replace(/^.*[\\\/]/, '').replace('.js', '');
var input = process.argv[2];
var param = process.argv[3];

/**
 * Help info
 */

if (!input || input === '-h' || input === '--help') {
    help();
    process.exit();
}

/**
 * Version info
 */

if (input === '-v' || input === '--version') {
    version();
    process.exit();
}

/**
 * Render the QR Code
 */

// If need bainuo schema
// NOTICE: If you don't know what does this mean, IGNORE IT! This is a custorm function.
if (param === '-b' || param === '--bainuo') {
    input = formatBainuo(input);
}

qrcode.generate(input);

/**
 * Process the url into bainuo://component...
 */
function formatBainuo(url) {
    return url ? 'bainuo://component?url=' + encodeURIComponent(url) : url;
}

/**
 * Helper functions
 */

function help() {
    console.log([
        '',
        'Usage: ' + command + ' <message>',
        '',
        'Options:',
        '  -h, --help           output usage information',
        '  -v, --version        output version number',
        '',
        'Examples:',
        '',
        '  $ ' + command + ' http://www.baidu.com/',
        ''
    ].join('\n'));
}

/**
 * Version functions
 */
function version() {
    var packagePath = path.join(__dirname, '/', 'package.json'),
        packageJSON = JSON.parse(fs.readFileSync(packagePath), 'utf8');

    console.log(packageJSON.version);
}


