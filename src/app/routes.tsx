import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";

import Splash from "./screens/Splash";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Categories from "./screens/Categories";
import CreatorList from "./screens/CreatorList";
import CreatorProfile from "./screens/CreatorProfile";
import Booking from "./screens/Booking";
import Dashboard from "./screens/Dashboard";
import CreatorSetup from "./screens/CreatorSetup";
import PortfolioUpload from "./screens/PortfolioUpload";
import CustomerDashboard from "./screens/CustomerDashboard";
import AboutUs from "./screens/AboutUs";
import ContactUs from "./screens/ContactUs";
import Chat from "./screens/Chat";
import CreatorMessages from "./screens/CreatorMessages";
import CreatorChat from "./screens/CreatorChat";
import AddReview from "./screens/AddReview";
import CustomerProfile from "./screens/CustomerProfile";
import Recommend from "./screens/Recommend";
import Favorites from "./screens/Favorites";
import Bookings from "./screens/Bookings";
import Availability from "./screens/Availability";
import Packages from "./screens/Packages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "bookings", element: <Bookings /> },
      { path: "availability", element: <Availability /> },
      { path: "packages", element: <Packages /> },
      { path: "favorites", element: <Favorites /> },
      { path: "match", element: <Recommend /> },
      { path: "splash", element: <Splash /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "categories", element: <Categories /> },
      { path: "creators/:category/:subcategory", element: <CreatorList /> },
      { path: "creator/:id", element: <CreatorProfile /> },
      { path: "booking/:creatorId", element: <Booking /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "customer-dashboard", element: <CustomerDashboard /> },
      { path: "creator-setup", element: <CreatorSetup /> },
      { path: "portfolio-upload", element: <PortfolioUpload /> },
      { path: "about", element: <AboutUs /> },
      { path: "contact", element: <ContactUs /> },
      { path: "chat/:creatorId", element: <Chat /> },
      { path: "creator-messages", element: <CreatorMessages /> },
      { path: "creator-chat/:chatId", element: <CreatorChat /> },
      { path: "review/:creatorId", element: <AddReview /> },
      { path: "customer/:id", element: <CustomerProfile /> },
    ],
  },
]);
