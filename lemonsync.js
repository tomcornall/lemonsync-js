var AWS      = require('aws-sdk'),
    s3       = new AWS.S3(),
    request  = require('request'),
    fs       = require('fs'),
    readline = require('readline');

/**
 * S3 security variables
 */
var accessKeyId,
    secretAccessKey,
    sessionToken,
    bucket,
    prefix,
    store;

var watchDir = 'zest',
    storeName = 'http://testetattaet.local.io',
    apiCode = 'ewoViNsN9JMGFbjFNJ3oxroK1o7ufMkxeSb65HLS';

getIdentity(
    apiCode,
    getS3ListOfObjects // callback on completion
);

/**
 * @param s3Files - array of key/body objects that make up a theme
 */
function compareS3FilesWithLocal(s3Files, prefix) {
    var changedLocalFiles = {};
    var newLocalFiles = {};
    var count = 0;

    var localFilePaths = listFullFilePaths(watchDir);

    localFilePaths.forEach( function( localFilePath, index ) {
        fs.readFile(localFilePath, 'utf8', function(err, localFileBody) {
            count++;

            if (localFilePath in s3Files) {
                // Local file exists in s3, compare bodies:
                if (s3Files[localFilePath] !== localFileBody) {
                    changedLocalFiles[prefix + 'test/' + localFilePath] = localFileBody;
                } else {
                    console.log('- s3Body matches Local body');
                }
            } else {
                newLocalFiles[prefix + 'test/' + localFilePath] = localFileBody;
            }
            if (localFilePaths.length == count) {
                console.log('Done comparing local/S3 files...');
                Object.assign(changedLocalFiles, newLocalFiles);

                inputReader = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                inputReader.question('\r\nDo you want to overwrite your files?\r\n\r\n(yes/no)\r\n\r\n', (answer) => {
                    inputReader.close();
                    if (answer == 'yes') {
                        uploadChangedFiles(changedLocalFiles);
                    }
                });
            }
        });
    });
}

function uploadChangedFiles(changedFiles) {
    console.log('changing files...');
    console.log(bucket);
    var count = 0;
    for (var key in changedFiles) {
        if (changedFiles.hasOwnProperty(key)) {
            var params = {
                Bucket: bucket,
                Key: key,
                Body: changedFiles[key]
            };

            s3.putObject(params, function(err, data) {
                count++;
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    console.log(data);
                    console.log(key);
                    if (Object.keys(changedFiles).length == count) {
                        console.log(Object.keys(changedFiles).length);
                        console.log(count);
                        console.log('\r\nDone uploading changed files...');
                        watchForChanges();
                    }
                }
            });
        }
    }
}

function watchForChanges() {
    fs.watch(watchDir, {recursive: true}, function(eventType, filename) {
        console.log(`event type is: ${eventType}`);
        if (filename) {
            console.log(`- ${filename} touched`);
            console.log('prefix: ' + prefix);
            localFilePath = watchDir + '/' + filename;
            key = prefix + localFilePath;
            fs.readFile(localFilePath, 'utf8', function(err, localFileBody) {
                // Reading local file to send to S3
                var params = {
                    Bucket: bucket,
                    Key: key,
                    Body: localFileBody
                };

                s3.putObject(params, function(err, data) {
                    if (err) console.log(err, err.stack);
                    else {
                        console.log(key);
                        console.log('\r\nUpdated watched file...');
                        var arr = [filename];
                        touchLSCache(arr);
                    }
                });
            });
        } else {
            console.log('filename not provided');
        }
    });
}

function touchLSCache(keys) {
    // key example: pages/about/page-about.htm

    var apiHost = storeName + '/api/v2/resource/touch';

    var options = {
        url: apiHost,
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + apiCode,
            'Content-Type': 'application/json'
        },
        json: { 'keys': keys }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            // var body = JSON.parse(body);

            if (response.statusCode == 401) {
                console.log("The API Access Token isn't valid for "+apiHost+". Please check that your Access Token is correct and not expired.");
            }
            if (response.statusCode != 200) {
                console.log("Could not connect to LemonStand! Didn't get 200!");
            } else {
                console.log('\r\nTouched Resource!')
            }

            // console.log(body);

            // cb(body.data);
        }
    }

    request(options, callback);
}

/**
 * @param s3ObjectList = data returned in listObjectsV2 - http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property
 * @param prefix = store-testetattaet-587d6a9cc922c/themes/
 */
function getS3Objects(s3ObjectList, prefix) {
    var s3Files = {};

    if (s3ObjectList.isTruncated) {
        console.log("Too many store files! We truncated this list to our maximum sync size.");
    }

    s3ObjectList.Contents.forEach(function( s3FileObject, index) {
        var s3Path = s3FileObject.Key.replace(prefix, '');
        var params = {
            Bucket: bucket,
            Key: s3FileObject.Key
        };
        s3.getObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            }
            else {
                s3FileBody = data.Body.toString('utf-8');
                s3Files[s3Path] = s3FileBody;

                if (Object.keys(s3Files).length === s3ObjectList.KeyCount) {
                    // Done getting s3 objects
                    console.log("HOLY DONE!!!");
                    compareS3FilesWithLocal(s3Files, prefix);
                }
            }
        });
    });
}

/**
 * List all files in a directory in Node.js recursively
 */
function listFullFilePaths(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = listFullFilePaths(dir + '/' + file, filelist);
    }
    else {
      filelist.push(dir + '/' + file);
    }
  });
  return filelist;
};

/**
 * Get s3 identity data from store API /identity/s3 endpoint
 */
function getIdentity(apiCode, cb) {
    var apiHost = storeName + '/api/v2/identity/s3';

    var options = {
        url: apiHost,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiCode,
            'Content-Type': 'application/json'
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);

            if (response.statusCode == 401) {
                console.log("The API Access Token isn't valid for "+apiHost+". Please check that your Access Token is correct and not expired.");
            }
            if (response.statusCode != 200) {
                console.log("Could not connect to LemonStand! Didn't get 200!");
            } else {
                console.log('got s3 data!')
            }

            cb(body.data);
        }
    }

    request(options, callback);
}

function getS3ListOfObjects(identityData) {
    accessKeyId = identityData.key;
    secretAccessKey = identityData.secret;
    sessionToken = identityData.token;
    bucket = identityData.bucket;
    store = identityData.store;
    prefix = store + '/themes/';

    AWS.config.update({
        accessKeyId: identityData.key,
        secretAccessKey: identityData.secret,
        sessionToken: identityData.token,
    });

    var listObjectsV2Params = {
        Bucket: identityData.bucket,
        Prefix: prefix + identityData.theme,
        MaxKeys: 10000
    };

    s3.listObjectsV2(listObjectsV2Params, function(err, objects) {
        if (err) {
            console.log(err, err.stack);
        }
        else {
            console.log('got AWS data!');
            getS3Objects(objects, prefix);
        }
    });
}