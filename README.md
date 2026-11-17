
# PackPal 🧳

### Plan together. Pack smarter. Explore more.

**PackPal** is a mobile travel planning and packing application built with **React Native and Expo**. It combines trip management, packing lists, collaborative preparation, itineraries, weather information, and location-based exploration in a single experience.

The project focuses on making travel preparation more organized—whether someone is traveling alone or coordinating with a group.

## ✨ Key Features

| Feature | Description |
| --- | --- |
| **Trip Management** | Create and manage personal trips in one place. |
| **Packing Lists** | Organize travel essentials and track packing progress. |
| **Collaborative Packing** | Join shared trips using invitation codes and coordinate a packing list with other participants. |
| **Itinerary Planning** | Organize destinations, activities, and places to visit during a trip. |
| **Interactive Maps** | Explore destinations and discover cultural and historical landmarks. |
| **Location-Based Discovery** | Find nearby landmarks and view contextual information cards, with a 500-meter proximity radius as the default. |
| **Weather Information** | Check destination weather while planning what to pack. |
| **Personalization** | Switch between light and dark themes and adjust app preferences. |
| **User Accounts** | Access personal and shared travel data through Firebase-backed authentication and storage. |

## 🛠️ Tech Stack

| Category | Technologies |
| --- | --- |
| **Mobile** | React Native, Expo, JavaScript |
| **Navigation** | React Navigation |
| **Authentication** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **Maps** | React Native Maps, CARTO |
| **Places & Landmarks** | OpenStreetMap / Overpass, Wikidata / Wikipedia |
| **Weather** | Open-Meteo |
| **Development** | Git, GitHub, npm |

## 🧩 How It Works

### Personal and Shared Trips

PackPal supports individual trip planning and group collaboration. Personal trips are stored under each user's account, while shared trips use a separate Firestore data model.

Invitation codes allow authenticated users to join shared trips and collaborate on packing.

### Destination Discovery

The discovery experience combines an interactive map with nearby landmark data.

Travelers can explore culturally and historically significant places and open information cards to learn more about them.

### Planning in One Place

Packing progress, trip details, itineraries, and weather information are brought together to reduce the need to switch between multiple travel apps.

## 🏗️ Project Structure

```text
PackPal/
├── assets/               # Images and static resources
├── src/
│   ├── components/       # Reusable UI components
│   ├── config/           # App and service configuration
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Application screens
│   └── services/         # Data and external API services
├── App.js                # Root application component
├── app.json              # Expo configuration
├── firestore.rules       # Firestore access rules
├── package.json          # Dependencies and scripts
└── README.md
```

## 🚀 Getting Started

### Requirements

- Node.js and npm
- Expo-compatible emulator or mobile device
- Firebase and map service configuration

### Installation

Clone the repository:

```bash
git clone https://github.com/cisemyavas/PackPal.git
```

Navigate to the project directory:

```bash
cd PackPal
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npx expo start
```

Follow the Expo CLI instructions to launch the application.

Some native functionality may require an Expo development build.

## 📱 App Preview

Screenshots of the following application screens will be added:

- Home Dashboard
- Trip Management
- Packing Lists
- Collaborative Packing
- Itinerary Planning
- Interactive Discovery Map

## 📄 License

This project is distributed under the terms in [LICENSE](LICENSE).

---

**Developed by [@cisemyavas](https://github.com/cisemyavas)**
