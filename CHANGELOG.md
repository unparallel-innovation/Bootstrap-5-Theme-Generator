# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Added missing utilities for sublte colors

## [0.6.4] - 2024-09-04
- Removed UTF-8 BOM from generated css

## [0.6.3] - 2024-05-27
- Fixed bug on "getSCSSVariables" method

## [0.6.2] - 2024-05-27
- Using only the values type, color, firstColor, orientation and secondColor of the "background" to generate the hash keys used for comparison

## [0.6.1] - 2024-05-27
- Support theme variables without "$", "$" will be appended when generating the css

## [0.6.0] - 2024-05-22
- Added support to dynamic background

## [0.5.0] - 2024-04-17
- Added support to choose which components to import when generating Bootstrap css

## [0.4.2] - 2024-04-17
- Added missing import when generating CSS

## [0.4.1] - 2024-04-17
- Fixed bug on method getHashFromTheme

## [0.4.0] - 2024-04-17
- Added color support to theme generation, adding a new color will generate all related classes included the subtle colors (btn-new-color, ...)

## [0.3.0] - 2024-03-25
- Added support to custom SCSS

## [0.2.1] - 2024-02-28
- Minify generated CSS as a default behaviour

## [0.2.0] - 2024-02-12
- Added cacheCSS method

## [0.1.1] - 2024-02-02
- Added BootstrapTheme to exports

## [0.1.0] - 2024-02-02
- Updated Bootstrap5Generator

## [0.0.3] - 2024-02-02
- Fixed type in the Cache method

## [0.0.2] - 2024-02-01
- First release-it release
