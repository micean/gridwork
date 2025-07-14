# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript + Vite application for a grid-based data editor. It features a spreadsheet-like interface with support for nested grids (grids within cells), cell selection, editing, and formatting.

## Key Architecture

### Core Components
- **App.vue**: Main application component with toolbar and grid container
- **TableComponent.vue**: Renders grid tables recursively (supports nested grids)
- **CellContent.vue**: Individual cell component with editing capabilities
- **Slider.vue**: UI component for font size adjustment

### State Management
- **selectedCells.ts**: Pinia store managing cell selection, keyboard navigation, and mouse interactions
- Uses path-based addressing like `[0,1]>[2,3]` for nested cell locations

### Data Structure
- **CellData**: Core interface with `id`, `text`, `fontSize`, and optional `innerGrid` for nesting
- **Grid operations**: Utilities for creating, navigating, and manipulating nested grid structures

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Run tests
npm run test:unit

# Lint and fix
npm run lint

# Format code
npm run format
```

## Key File Patterns

- Vue SFC components: `.vue` files with `<script setup lang="ts">`
- Styles: Scoped SCSS in separate `.scss` files
- Utilities: TypeScript modules in `/src/utils/`
- Stores: Pinia stores in `/src/stores/`

## Important Utilities

- **data.ts**: Grid creation (`createGridData`, `createCellData`) and path-based lookup (`lookupCellData`, `lookupInnerGrid`)
- **edit.ts**: Text selection utilities for cell editing
- **bus.ts**: Event emitter for inter-component communication

## Keyboard & Mouse Interactions

- Click to select cells
- Drag to select ranges
- Arrow keys for navigation
- Enter to edit, Esc to cancel
- Delete to clear cell content
- Insert to create nested grid
- Font size adjustment via toolbar