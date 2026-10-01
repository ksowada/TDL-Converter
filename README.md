# tdl2md - TDL-to-Markdown transformation
**XSLT and shell script using SAXON-XSLT to convert Abstractspoon ToDoList File .tdl with hierarchy and comments to HTML-file**

**Application:** Use ToDolist for hierarchy arrangement and then create a easy HTML consist of TITLE, hierarchy and COMMENTS. 

## Requirements
- Java (matching min. requirement version for SAXON), must be available on PATH
- Saxon HE (supporting XSL Stylesheet 2.0)

## Installation
- no installation required. Just lay files in some folder and execute batch command to convert files.

- use or introduce environment variable named: `SAXON_JAR` to point to SAXON.jar.

## Usage
- run `run.sh` with some parameters
- **command line %1:** file path to .tdl
- **command line %2:** optional output file path to .md 

## Functions
- Tasks and Comments are linearized in a HTML-file 
  - it keep hierarchy
  - Links (FILEREFPATH) will be linearized to a <p><a> at their task
  - Comments (COMMENTS) will be written to a <p>

