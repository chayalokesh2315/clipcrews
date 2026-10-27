import { createBrowserRouter, Outlet } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import CommandMenu from "./components/CommandMenu";

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
import Verification from "./screens/Verification";
import Admin from "./screens/Admin";
import Earnings from "./screens/Earnings";

function AppLayout() {
  return (
    <>
      <Outlet />
      <CommandMenu />
      <BottomNav />
    </>
  );
}

export const router =
  createBrowserRouter([
    {
      element: <AppLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/bookings",
          element: <Bookings />,
        },
        {
          path: "/availability",
          element: <Availability />,
        },
        {
          path: "/packages",
          element: <Packages />,
        },
        {
          path: "/verification",
          element: <Verification />,
        },
        {
          path: "/earnings",
          element: <Earnings />,
        },
        {
          path: "/admin",
          element: <Admin />,
        },
        {
          path: "/favorites",
          element: <Favorites />,
        },
        {
          path: "/match",
          element: <Recommend />,
        },
        {
          path: "/splash",
          element: <Splash />,
        },

        {
          path: "/login",
          element: <Login />,
        },

        {
          path: "/register",
          element: <Register />,
        },

        {
          path: "/categories",
          element: <Categories />,
        },

        {
          path: "/creators/:category/:subcategory",
          element: <CreatorList />,
        },

        {
          path: "/creator/:id",
          element: <CreatorProfile />,
        },

        {
          path: "/booking/:creatorId",
          element: <Booking />,
        },

        {
          path: "/dashboard",
          element: <Dashboard />,
        },

        {
          path: "/customer-dashboard",
          element: <CustomerDashboard />,
        },

        {
          path: "/creator-setup",
          element: <CreatorSetup />,
        },

        {
          path: "/portfolio-upload",
          element: <PortfolioUpload />,
        },

        {
          path: "/about",
          element: <AboutUs />,
        },

        {
          path: "/contact",
          element: <ContactUs />,
        },

        {
          path: "/chat/:creatorId",
          element: <Chat />,
        },
        {
          path: "/creator-messages",
          element: <CreatorMessages />,
        },
        {
          path: "/creator-chat/:chatId",
          element: <CreatorChat />,
        },
        {
          path: "/review/:creatorId",
          element: <AddReview />,
        },

        {
          path: "/customer/:id",
          element: <CustomerProfile />,
        },
      ],
    },
  ]);