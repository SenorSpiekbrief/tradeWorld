# TradeWorld

**TradeWorld** is a modular, Angular 19-based application designed to simulate a dynamic trading environment. It leverages Angular Material for UI components and incorporates procedural generation techniques to create a rich, interactive user experience.

## 🚀 Features

- **Modular Architecture**: Organized into distinct modules such as `dialogs`, `screens`, `services`, and `shared` for scalability and maintainability.
- **Angular Material Integration**: Utilizes Angular Material components for a consistent and responsive UI.
- **Procedural Generation**: Implements `seedrandom` and `simplex-noise` libraries to generate deterministic and natural-looking data, enhancing the realism of the trading simulation.
- **Routing**: Configured routing through `app.routes.ts` to manage navigation between different screens.
- **Theming**: Custom styles defined in `app.component.scss` to align with the trading theme.

## 📁 Project Structure

```
src/
├── app/
│   ├── dialogs/           # Reusable dialog components
│   ├── screens/           # Main application screens
│   ├── services/          # Shared services for data and business logic
│   ├── shared/            # Shared enums, types, components, directives, and pipes
│   ├── app.component.*    # Root component files
│   ├── app.config.ts      # Application-wide configuration
│   └── app.routes.ts      # Application routing configuration
├── public/                # Static assets like images and styles
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Angular CLI](https://angular.io/cli) (v19.1.2)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/SenorSpiekbrief/tradeWorld.git
   cd tradeWorld
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

### Development Server

Start the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The app will automatically reload if you change any of the source files.

### Build

Build the project for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

### Running Unit Tests

Execute the unit tests via [Karma](https://karma-runner.github.io):

```bash
ng test
```

## 📦 Dependencies

Key dependencies include:

- `@angular/core` (v19.1.0)
- `@angular/material` (v19.2.7)
- `rxjs` (v7.8.0)
- `seedrandom` (v3.0.5)
- `simplex-noise` (v4.0.3)

For a complete list, refer to the [`package.json`](https://github.com/SenorSpiekbrief/tradeWorld/blob/main/package.json) file.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## 📄 License

This project is licensed under the [MIT License](LICENSE).