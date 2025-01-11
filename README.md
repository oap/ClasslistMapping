# Class Mappings Manager

A JavaScript-based tool to manage class mappings between D2L and Canvas platforms. This tool allows users to view, add, and edit mappings seamlessly using a user-friendly interface.

## Features

- **View Mappings**: Displays existing mappings in a clean table format.
- **Add New Mappings**: Allows users to add mappings for classes, including D2L IDs, sections, and Canvas IDs.
- **Edit Mappings**: Modify existing mappings easily.
- **Cross-Platform Support**: Supports integration with both D2L and Canvas platforms.

## Demo

Visit the [GitHub Pages Demo](https://oap.github.io/ClasslistMapping/) to see the tool in action.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, etc.).
- Optional: Local development environment with Node.js and npm for building and testing.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oap/ClasslistMapping.git
   cd ClasslistMapping
   ```

2. Install dependencies (if applicable):
   ```bash
   npm install
   ```

### Usage

#### Using the Tool

1. Open the tool directly from the [GitHub Pages URL](https://oap.github.io/ClasslistMapping/).
2. Use the buttons provided to add, view, or edit mappings.

#### Local Development

1. Start a local server to test the `index.html` file (optional, for live updates):
   ```bash
   npx http-server .
   ```

2. Open `http://127.0.0.1:8080/index.html` in your browser.

## Development

### File Structure

```plaintext
src/
├── index.html        # Main entry point
├── DataManager.js    # Handles data storage and retrieval
├── UIManager.js      # Handles user interface logic
dist/                 # Contains bundled files for production
```

### Building the Project

To bundle your JavaScript files into a single file for production:

1. Run the build command:
   ```bash
   npm run build
   ```

2. The output will be located in the `dist/` directory.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
