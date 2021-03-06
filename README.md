# nxfilter


A command line tool for filtering RDF N-Triples or N-Quads.

[![](https://badge.fury.io/js/nxfilter.svg)](https://www.npmjs.com/package/nxfilter) &ensp; [![](https://travis-ci.org/j13z/nxfilter.svg?branch=master)](https://travis-ci.org/j13z/nxfilter/builds)



## Usage

`nxfilter` lets you:

- Use N-Triples / N-Quads in a Unix pipe to run small ad-hoc queries:

    ```shell
    curl -s http://dbpedia.org/data/Munich.ntriples | \
    nxfilter -p | sort | uniq -c | sort -n -r | head
    ```

    ![screenshot](doc/screenshots/query1.png)

- Look at data files more conveniently in the terminal:

    ```shell
    curl -s 'http://dbpedia.org/data/Cut_(Unix).ntriples' | tail +10 | head -n 15 | \
    nxfilter -p -o --compact --no-protocol --limit 28
    ```

    ![screenshot](doc/screenshots/colors.png)

Like `cut` for N-x formats, plus some additional query features.

You can filter by:

- Element position (`-s`, `-p`, `-o`, `-g`)
- Type: `--<element>:<type>` (with types `iri` / `bnode` / `literal`)
- Value: `--<element>=<value>`

Run `nxfilter --help` for [detailed usage information](doc/cli/usage.txt).

[Settings](bin/defaults.json) (colors and defaults) can be adjusted with a dotfile: `~/.nxfilterrc`.



## Examples

Get predicates and objects as TSV:

    nxfilter -p -o --delimiter '\t' data.nt.gz

Get most frequent predicates (pipe):

    cat data.nt | nxfilter -p | sort | uniq -c | sort -n -r | head

Output _(predicate, object)_ tuples where the object is a literal:

    nxfilter --predicate --object:literal data.nt.g



## Installation

Requires [Node.js](http://nodejs.org/) (which is easy to install). With Node.js installed, get it via npm with

    $ npm install -g nxfilter

which provides you with the `nxfilter` command on your shell, installed in user space.


## Change Log

- **1.0.6:** Fixes `nxfilter -h` bug
