# Project Context

## Purpose
Gemini Lossless Watermark Remover is a high-performance, 100% client-side tool for removing visible watermarks from Gemini AI-generated images. Built with pure JavaScript, it leverages a mathematically precise **Reverse Alpha Blending** algorithm rather than unpredictable AI inpainting.

Core objectives:
- 100% client-side processing for privacy protection
- Lossless watermark removal using mathematical formulas
- Automatic detection of 48×48 or 96×96 watermark variants
- Dual delivery: Web application and Userscript

## Tech Stack
- **JavaScript (ES2020+)** - Pure JavaScript implementation, no TypeScript
- **esbuild** - Build tool supporting development and production modes
- **Canvas API** - Core image processing engine
- **pnpm** - Package manager
- **Dependencies**:
  - `exifr` - EXIF metadata extraction
  - `jszip` - Batch download packaging
  - `medium-zoom` - Image zoom preview

## Project Conventions

### Code Style
- ES6+ module system (`import/export`)
- Function naming: camelCase
- Constants: UPPER_SNAKE_CASE
- Comments: concise and professional, avoid explaining motivations
- No emojis (unless explicitly requested by user)
- Code comments in English, user-facing text supports i18n (Chinese/English)

### Architecture Patterns
- **Modular design**: Core algorithms separated from UI
  - `src/core/` - Core algorithm modules (alphaMap, blendModes, watermarkEngine)
  - `src/app.js` - Web application entry point
  - `src/userscript/` - Userscript standalone entry
- **Single responsibility**: Each module focuses on specific functionality
  - `alphaMap.js` - Alpha channel calculation
  - `blendModes.js` - Reverse blending algorithm implementation
  - `watermarkEngine.js` - Coordinates detection, calculation, and removal
- **Asset preloading**: Watermark alpha maps (bg_48.png, bg_96.png) bundled as dataurl
- **Internationalization**: i18n module supports Chinese/English switching

### Testing Strategy
- No automated testing framework currently
- Avoid over-engineering, keep project simple
- Testing via manual verification and real image processing
- For debugging, use `node -e` or `python -m` to execute script snippets

### Git Workflow
- **Main branch**: `main`
- **Development branch**: `develop`
- **Commit conventions**: Conventional commits format (feat, fix, style, build, etc.)
- Recent commit examples:
  - `feat: Add non-gemini generated image tips`
  - `fix(userscript): mismatch when navigating from home`
  - `build: refactor build script`

## Domain Context
### Watermark Detection Rules
Gemini applies different watermark sizes based on image dimensions:
- Width > 1024 **AND** Height > 1024: 96×96 watermark (right margin 64px, bottom margin 64px)
- Otherwise: 48×48 watermark (right margin 32px, bottom margin 32px)

### Reverse Alpha Blending Algorithm
Gemini watermark application formula:
```
watermarked = α × logo + (1 - α) × original
```

Reverse removal formula:
```
original = (watermarked - α × logo) / (1 - α)
```

Where:
- `watermarked`: Pixel value with watermark
- `α`: Alpha channel value (0.0 - 1.0)
- `logo`: Watermark logo color value (White = 255)
- `original`: Original pixel value to recover

### Limitations
- Only removes Gemini **visible watermarks** (semi-transparent logo in bottom-right)
- Does not remove invisible/steganographic watermarks (SynthID)
- Designed for Gemini's current watermark pattern (as of 2025)

## Important Constraints
- **Pure client-side processing**: All operations run in browser, no backend required
- **Privacy-first**: Image data never uploaded to any server
- **Browser compatibility**: Requires ES6 Modules, Canvas API, Async/Await, TypedArray
- **File size limit**: Single image max 20MB
- **Supported formats**: JPEG, PNG, WebP
- **Legal disclaimer**: Personal and educational use only, users assume legal responsibility

## External Dependencies
- **No external API dependencies**: Fully offline capable
- **Pre-captured assets**:
  - `src/assets/bg_48.png` - 48×48 watermark alpha map
  - `src/assets/bg_96.png` - 96×96 watermark alpha map
- **Build tooling**: esbuild (local dependency)
- **Deployment**: Static file hosting (currently deployed at banana.ovo.re)
