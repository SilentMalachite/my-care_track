# Project Issues

This document outlines potential issues identified in the project structure.

## 1. Project Structure Complexity

*   **Redundant Frontend Directories**: There are two `frontend` directories, one at the root and another inside `backend/`. This is confusing and makes it unclear which one is in use.
*   **Technology Sprawl**: The project combines Electron, Ruby on Rails, and React in a single repository. The relationship and orchestration between these parts are not immediately clear from the file structure alone.

## 2. Dependency Management Duplication

*   **Multiple `package.json` Files**: `package.json` files exist in several locations (root, `backend/frontend/`, `electron/`, `frontend/`). This can lead to:
    *   Inconsistent library versions.
    *   Redundant installations of the same libraries.
    *   Complicated and error-prone dependency updates.

## 3. Complicated Build Process

*   **Multiple Build Systems**: The backend, frontend, and desktop app each require their own build process. This likely complicates the end-to-end workflow for development and deployment.
*   **High Onboarding Cost**: The complexity of the setup increases the learning curve for new developers joining the project.
