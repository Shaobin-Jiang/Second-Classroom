# Second Classroom

![](https://shields.io/badge/Version-2.1.0-brightgreen.svg?style=plastic) ![](https://shields.io/badge/License-MIT-informational.svg?style=plastic) ![](https://shields.io/badge/System->=Windows_10-critical.svg?style=plastic) ![](https://shields.io/badge/Node_Version-16.14.0-orange.svg?style=plastic) ![](https://shields.io/badge/Electron_Version-17.1.0-orange.svg?style=plastic) 

Second Classroom uses [Electron](https://www.electronjs.org/). Compared with the 1.x version, the 2.x version added a graphical use interface to guide uses.

## Table of Contents

- [Second Classroom](#second-classroom)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Project Structure](#project-structure)
  - [Compilation](#compilation)
  - [Maintainer](#maintainer)
  - [Contributing](#contributing)
  - [License](#license)

## Requirements

There is no requirement for directly using the distributed software, save that your operating system is **Windows 10 or above**.

If you want to develop new features based on the code in this repository, the development environment listed below was what was used during the early development of this application:

- NodeJS (Node version used during development is 16.14.0; you can also use other versions so long as they are not too ancient)
- Electron (Version used during development is 17.1.0)
- NodeJS modules
  - docxtemplater
  - node-xlsx
  - pizzip

## Project Structure

The project folder ought to have a structure like this:

```text
📂 .
--- 📂 core
    --- 📂 activities
    --- 📄 template.docx
--- 📂 log
--- 📂 node_modules
--- 📂 output
--- 📂 src
--- 📂 templates
--- 📄 main.js
--- 📄 package.json
--- 📄 second-classroom.js
```

## Compilation

Binary file compiled with electron-forge.

Installer compiled with Inno Setup.

## Maintainer

[@Shaobin Jiang](https://github.com/Shaobin-Jiang)

## Contributing

Feel free to [open an issue](https://github.com/Shaobin-Jiang/Second-Classroom/issues/new) or submit PRs.

## License

[MIT](LICENSE) &copy; Shaobin Jiang