# Cloudant Uploader

Converts CSV rows into JSON documents, and uploads them to Cloudant. Built using [node.js][1].

## Installation

First, make sure you have [node.js][1] installed. Then:

    git clone [repo]
    cd [repo]
    npm install

## Usage

The uploader is controlled through a configuration file called `config.json`. Run `cp config.json.example config.json` to copy the example into the name the application expects. Then, flesh it out:

    {
      "csv": "path/to/file.csv",  # the CSV you'd like to convert into JSON docs and upload
      "db": "...",                # name of Cloudant database you'd like to upload to.
      "user": "...",              # your Cloudant username
      "api_key": "...",           # an API key generated for the database with writer privileges
      "api_secret": "...",        # the matching API secret 
      "chunk_size": 10000         # how many docs to send per request
    }

To begin uploading, then, just do this:

    node app.js

When it finishes, you'll either see an array of documents that couldn't be uploaded, along with their accompanying error messages, or a happy little message like `Done! Uploaded [number] docs.`.

(For reference, in testing, it took ~6 seconds to upload 11,120 documents.)

Happy coding!

[1]: http://nodejs.org/