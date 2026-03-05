# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **ExportResult.filters** — `ExportResult` now includes an optional `filters` property (`FilterState`) when exporting from `ImageEditor`. Cropper exports omit it. Non-breaking; existing code continues to work.

### Changed

- **ImageEditor stencil visibility** — The crop stencil (overlay and handles) now only appears when the crop tab is active. When viewing filters, finetune, frame, or watermark panels, the stencil is hidden. Improves focus on the current tool.

### Fixed

- **Full-resolution export** — Export now correctly uses original image pixels (`crop.pixels`), not viewport dimensions. Large images (e.g. 5000×3000) displayed small will export at the cropped region's actual dimensions.
- **Export pixel coordinates** — Added `Math.round` for canvas dimensions and `drawImage` source rect for robustness.
