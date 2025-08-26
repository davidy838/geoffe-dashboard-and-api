# Geoffe Dashboard Frontend

A modern, responsive React dashboard for healthcare facility analysis and cost optimization.

## Features

- 🎯 **Modern UI/UX**: Clean, professional design with smooth animations
- 📁 **File Upload**: Drag-and-drop CSV file upload for all required data
- 📊 **Results Display**: Beautiful visualization of analysis results
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast Performance**: Built with Vite and React 18
- 🔒 **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Charts**: Recharts (ready for future enhancements)

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx     # Dashboard header
│   ├── FileUpload.tsx # File upload interface
│   └── ResultsDisplay.tsx # Results visualization
├── types.ts            # TypeScript type definitions
├── config.ts           # API configuration
├── App.tsx            # Main application component
└── App.css            # Global styles
```

## Configuration

### API URL Setup

Update the API URL in `src/config.ts`:

```typescript
export const API_CONFIG = {
  development: 'http://localhost:8000',
  production: 'https://your-actual-render-url.onrender.com',
  // ...
}
```

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=https://your-api-url.onrender.com
```

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** and your app will be deployed!

### Manual Build

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider

## API Integration

The frontend integrates with the Geoffe Dashboard API:

- **Endpoint**: `POST /api/calculate-distances-and-merge-costs`
- **Input**: 4 CSV files (community, clinic, charlie, costs)
- **Output**: CSV download with analysis results

## File Requirements

### Community File
- **Columns**: Title, Latitude, Longitude
- **Format**: CSV
- **Description**: Community locations for analysis

### Clinic File
- **Columns**: Facility, latitude, longitude
- **Format**: CSV
- **Description**: Healthcare facility locations

### CHARLiE File
- **Columns**: community_name, age_group encounters
- **Format**: CSV
- **Description**: Patient encounter data by community

### Costs File
- **Columns**: Cost equations
- **Format**: CSV
- **Description**: Cost calculation formulas

## Customization

### Styling

The dashboard uses modern CSS with CSS custom properties. Main colors can be modified in `App.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --error-color: #dc2626;
}
```

### Components

All components are modular and can be easily customized or extended. Each component has:

- TypeScript interfaces for props
- Responsive design considerations
- Accessibility features
- Error handling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Geoffe Dashboard system.

## Support

For support or questions, please refer to the main project documentation.
