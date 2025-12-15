# Testing Documentation

This document covers testing for both frontend (TypeScript/React) and backend (Rust/Tauri) code.

---

## Quick Reference

### Frontend
From the project root, run:
```bash
bun test                           # Run all tests
bun test:coverage                  # Run all tests with coverage
```

### Backend
```bash
cd src-tauri

cargo test                         # Run all tests
cargo install cargo llvm-cov       # Install coverage tool
cargo llvm-cov                     # Run all tests with coverage (terminal)
cargo llvm-cov --html              # Run all tests with coverage (html output)
```

---

## Frontend Tests (Bun + React Testing Library)

### Setup

Tests are located next to the code they test:
```
src/
├── hooks/
│   ├── useGlobalHotkey.ts
│   └── __tests__/
│       └── useGlobalHotkey.test.ts
├── components/
│   ├── Header.tsx
│   └── __tests__/
│       └── Header.test.tsx
└── test/
    └── setup.ts          # Test utilities
```

### Running Tests
From the project root, run:
```bash
# Run all tests
bun test

# Run all tests with coverage
bun test:coverage

# Run specific test file
bun test src/hooks/__tests__/useGlobalHotkey.test.ts
```

## Backend Tests (Rust/Cargo)

### Setup

Tests are located in `tests/` folders next to the code:
```
src-tauri/
├── src/
│   └── commands/
│       ├── hotkeys.rs
│       └── tests/
│           └── hotkeys_test.rs
└── Cargo.toml
```

### Running Tests
```bash
cd src-tauri

# Run all tests
cargo test

# Run specific test
cargo test test_parse_simple_hotkey

# Coverage
cargo install cargo llvm-cov
cargo llvm-cov # Run all tests with coverage (terminal)
cargo llvm-cov --html # Run all tests with coverage (html output)
```

### Linking Tests to Source

Add this to the source file (e.g., `hotkeys.rs`):
```rust
#[cfg(test)]
#[path = "tests/hotkeys_test.rs"]
mod hotkeys_test;
```
