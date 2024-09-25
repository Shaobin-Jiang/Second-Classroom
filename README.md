# Second Classroom

![](https://shields.io/badge/Version-2.2.1-brightgreen.svg?style=plastic) ![](https://shields.io/badge/License-MIT-informational.svg?style=plastic) ![](https://shields.io/badge/System->=Windows_10-critical.svg?style=plastic) ![](https://shields.io/badge/Electron_Version-17.1.0-orange.svg?style=plastic) 

Second Classroom uses [Electron](https://www.electronjs.org/). Compared with the 1.x version, the 2.x version added a graphical user interface for convenience.

## Table of Contents

- [Second Classroom](#second-classroom)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Project Structure](#project-structure)
  - [Commonly-Encountered Errors](#commonly-encountered-errors)
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

## Commonly-Encountered Errors

Errors frequently occur when traditional / simplified Chinese characters are used mixedly used. A most commonly-seen case of such problems is when the name of a person is registered in traditional Chinese, but the activities that contain the name of this very person has his name written in simplified Chinese. Quite often, such mistakes can be hard to find, because traditional and simplified Chinese characters can look really alike.

Another frequently seen error occurs when you put students that are not within the list of the registered student information json file, such as when the student has graduated, or does not belong to the department of psychology. The software does not automatically skip such cases but instead throws an error and pauses the parsing of the current activity. This is because there might be rare cases when the name and the id of a student have both been recorded incorrectly, thereby giving the illusion that he is not included in the student roster when in reality he is.

## Compilation

Binary file compiled with electron-forge.

Installer compiled with Inno Setup.

## Maintainer

[@Shaobin Jiang](https://github.com/Shaobin-Jiang)

## Contributing

Feel free to [open an issue](https://github.com/Shaobin-Jiang/Second-Classroom/issues/new) or submit PRs.

## License

[MIT](LICENSE) &copy; Shaobin Jiang
