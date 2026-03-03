import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
    useParams,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { AccountProvider, useAccount } from "./context/AccountContext";
import { LocationProvider } from "./store/Location.context";

import Navbar from "./components/layout/NavBar";

import HomePage from "./pages/Home";
import FreeListing from "./pages/FreeListing";
import CategoryPage from "./pages/CategoriesPage";
import Favorites from "./pages/Favorites";
import Saved from "./pages/Saved";
import LoginPage from "./pages/LoginPage";
import Notifications from "./pages/Notifications";
import Policy from "./pages/Policy";
import FeedBack from "./pages/FeedBack";
import Help from "./pages/Help";
import ProfilePage from "./pages/ProfilePage";
import WorkerProfileScreen from "./pages/WorkerProfile";
import JobDetails from "./pages/JobDetails";
import UserProfile from "./pages/CustomerProfile";
import WorkerProfile from "./pages/WorkerProfile";
import CallingScreen from "./pages/Call";
import ServiceEnquiryForm from "./pages/ServiceEnquiryForm";
import FeedbackForm from "./pages/FeedBack";
import ThankYouScreen from "./pages/ThankYouscreen";
import RoleSelection from "./pages/RoleSelection";
import AllJobs from "./pages/AllJobs";
import UpdateJob from "./pages/UpdateJob";
import MyProfile from "./pages/MyProfile";
import BookNow from "./pages/BookNow";
import RaiseTicketUI from "./pages/RiseTicket";
import ViewTicketsUI from "./pages/ViewTicket";
import ReferAndEarnScreen from "./pages/Refer&earn";
import AboutUs from "./pages/AboutUs";
import MySkills from "./pages/MySkills";
import AddSkillsScreen from "./pages/AddSkills";
import CreateWorkerProfile from "./pages/WorkerProfile";
import EditSkillScreen from "./pages/EditWorkerSkill";
import WorkerDetails from "./pages/WorkerDetails";
import AutomotiveForm from "./pages/AutomotiveForm";
import WorkerRedirectHandler from "./Routs/WorkerRender";
import AddSkills from "./pages/AddSkills";
import WorkerDashboard from "./pages/WorkerDashboard";
import FoodService from "./pages/FoodServiceList";
import FoodServiceForm from "./pages/FoodServiceForm";
import HospitalServiceList from "./pages/HospitalServiceList";
import HotelServiceList from "./pages/HotelServiceList";
import BeautyServicesList from "./pages/BeautyServiceList";
import ShoppingList from "./pages/ShoppingList";
import AutomotiveList from "./pages/AutomotiveList";
import EducationList from "./pages/EducationList";
import BusinessList from "./pages/BusinessList";
import TechDigitalServiceList from "./pages/DigitalServiceList";
import EventList from "./pages/EventList";
import CourierList from "./pages/CourierServiceList";
import SportsServiceList from "./pages/SportsServiceList";
import AgricultureList from "./pages/AgricultureList";
import DailyWagesList from "./pages/DailyWagesList";
import HomePersonalServiceList from "./pages/HomePersonalServiceList";
import HotelForm from "./pages/HotelForm";
import BeautyServiceForm from "./pages/BeautyServiceForm";
import BeautyServiceList from "./pages/BeautyServiceList";
import HospitalServicesList from "./pages/HospitalServiceList";
import HospitalForm from "./pages/HospitalForm";
import SportsServiceForm from "./pages/SportsServiceForm";
import ShoppingForm from "./pages/ShoppingForm";
import MyBusiness from "./pages/MyBusiness";
import ListedJobs from "./pages/Listedjobs";
import DigitalServiceForm from "./pages/DigitalServiceForm";
import DigitalServiceList from "./pages/DigitalServiceList";
import EducationForm from "./pages/EducationForm";
import EducationServiceList from "./pages/EducationList";
import PetServiceForm from "./pages/PetForm";
import PetServiceList from "./pages/PetServiceList";
import EventForm from "./pages/EventForm";
import EventServiceList from "./pages/EventList";
import IndustrialServiceForm from "./pages/IndustrialForm";
import IndustrialServiceList from "./pages/IndustrialServiceList";
import BusinessServiceForm from "./pages/BusinessForm";
import BusinessServiceList from "./pages/BusinessList";
import CourierServiceForm from "./pages/CourierForm";
import CourierServiceList from "./pages/CourierServiceList";
import DailyWageForm from "./pages/DailyWageForm";
import DailyWageList from "./pages/DailyWagesList";
import AgricultureForm from "./pages/AgricultureForm";
import AgricultureServiceList from "./pages/AgricultureList";
import CorporativeForm from "./pages/CorporativeForm";
import CorporativeServiceList from "./pages/CorporativeServiceList";
import WeddingForm from "./pages/WeddingForm";
import WeddingServiceList from "./pages/WeddingServiceList";
import ArtForm from "./pages/ArtForm";
import ArtServiceList from "./pages/ArtServiceList";
import PlumberForm from "./pages/PlumberForm";
import PlumberServiceList from "./pages/PlumbersList";
import RealEstateList from "./pages/RealEstateList";
import RealEstateForm from "./pages/RealEstateForm";
import HomePersonalForm from "./pages/HomePersonalForm";
import HomePersonalList from "./pages/HomePersonalServiceList";
import FoodForm from "./pages/FoodServiceForm";
import FoodServiceList from "./pages/FoodServiceList";
import ConfirmedWorkersPage from "./pages/ConforimedWorkerPage";
import JobApplicantsPage from "./pages/JobApplicationPage";

import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import { API_BASE_URL } from "./services/api.service";

import NotificationToast from "./components/NotificationToast";
import GoogleTranslate from "./components/GoogleTransulator";
import Reviews from "./pages/Reviews";
// ── Save FCM token to backend ─────────────────────────────────────────────────
const saveFcmTokenToBackend = async (
    userId: string,
    role: "User" | "Worker",
    fcmToken: string
): Promise<void> => {
    try {
        const body = new URLSearchParams();
        body.append("userId", userId);
        body.append("role", role);
        body.append("fcmToken", fcmToken);

        const res = await fetch(`${API_BASE_URL}/saveFcmToken`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
        if (res.ok) console.log("✅ FCM token saved to backend");
        else console.warn("⚠️ Failed to save FCM token:", res.status);
    } catch (err) {
        console.warn("⚠️ saveFcmToken error:", err);
    }
};

// ── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" replace />;
};

// ── ListedJobs Wrapper ────────────────────────────────────────────────────────
const ListedJobsWrapper: React.FC = () => {
    const { user } = useAuth();
    if (!user?._id) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Please log in to view your jobs</p>
            </div>
        );
    }
    return <ListedJobs userId={user._id} />;
};

// ── MyBusiness Wrapper ────────────────────────────────────────────────────────
const MyBusinessWrapper: React.FC = () => {
    const { user } = useAuth();
    if (!user?._id) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Please log in to view your business</p>
            </div>
        );
    }
    return <MyBusiness userId={user._id} />;
};


// ── Layout ────────────────────────────────────────────────────────────────────
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-secondary">
        <Navbar />
        <main>{children}</main>
    </div>
);

// ── App Routes ────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
    const location = useLocation();
    const background = location.state?.background;

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                console.log("Notification permission:", permission);
            });
        }

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("🔔 Foreground message:", payload);
            const { title, body } = payload.notification || {};
            if (title && Notification.permission === "granted") {
                new Notification(title, { body, icon: "/Notification.png" });
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <Layout>
                <Routes location={background || location}>
                    {/* ── Core ── */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/role-selection" element={<RoleSelection />} />
                    <Route path="/loginPage" element={<LoginPage />} />
                    <Route path="/worker-profile" element={<WorkerProfileScreen />} />
                    <Route path="/job-details/:jobId" element={<JobDetails />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/post-job" element={<UserProfile />} />
                    <Route path="/category/:id" element={<CategoryPage />} />

                    {/* ── Worker ── */}
                    <Route path="/worker-profile/:id" element={<WorkerProfile />} />
                    <Route path="/worker-details/:id" element={<WorkerDetails />} />
                    <Route path="/add-skills" element={<AddSkillsScreen />} />
                    <Route path="/edit-skill/:skillId" element={<EditSkillScreen />} />

                    {/* ── Booking & Interaction ── */}
                    <Route path="/booknow/:jobId" element={<BookNow />} />
                    <Route path="/call/:id" element={<CallingScreen />} />
                    <Route path="/send-enquiry/:id" element={<ServiceEnquiryForm />} />
                    <Route path="/feedback/:id" element={<FeedbackForm />} />
                    <Route path="/thank-you/:id" element={<ThankYouScreen />} />

                    {/* ── Jobs ── */}
                    <Route path="/all-jobs" element={<AllJobs />} />
                    <Route path="/update-job/:jobId" element={<UpdateJob />} />
                    <Route path="/job-applicants/:jobId" element={<JobApplicantsPage />} />
                    <Route path="/confirmed-workers/:jobId" element={<ConfirmedWorkersPage />} />

                    {/* ── User Settings ── */}
                    <Route path="/my-profile" element={<MyProfile />} />
                    <Route path="/refer-and-earn" element={<ReferAndEarnScreen />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/raise-ticket" element={<RaiseTicketUI />} />
                    <Route path="/view-tickets" element={<ViewTicketsUI />} />
                    <Route path="/my-skills" element={<MySkills />} />

                    {/* ── Service Forms ── */}
                    <Route path="/add-automotive-form" element={<AutomotiveForm />} />
                    <Route path="/add-hotel-service-form" element={<HotelForm />} />
                    <Route path="/add-hospital-service-form" element={<HospitalForm />} />
                    <Route path="/add-beauty-service-form" element={<BeautyServiceForm />} />
                    <Route path="/add-sports-service-form" element={<SportsServiceForm />} />
                    <Route path="/add-shopping-form" element={<ShoppingForm />} />
                    <Route path="/add-digital-service-form" element={<DigitalServiceForm />} />
                    <Route path="/add-education-form" element={<EducationForm />} />
                    <Route path="/add-pet-service-form" element={<PetServiceForm />} />
                    <Route path="/add-event-service-form" element={<EventForm />} />
                    <Route path="/add-industrial-service-form" element={<IndustrialServiceForm />} />
                    <Route path="/add-business-service-form" element={<BusinessServiceForm />} />
                    <Route path="/add-courier-service-form" element={<CourierServiceForm />} />
                    <Route path="/add-daily-wage-service-form" element={<DailyWageForm />} />
                    <Route path="/add-agriculture-service-form" element={<AgricultureForm />} />
                    <Route path="/add-corporative-service-form" element={<CorporativeForm />} />
                    <Route path="/add-wedding-service-form" element={<WeddingForm />} />
                    <Route path="/add-art-service-form" element={<ArtForm />} />
                    <Route path="/add-plumber-service-form" element={<PlumberForm />} />
                    <Route path="/add-real-estate-form" element={<RealEstateForm />} />
                    <Route path="/add-home-service-form" element={<HomePersonalForm />} />
                    <Route path="/add-food-service-form" element={<FoodServiceForm />} />
                    <Route path="/add-food-service-form/:id" element={<FoodServiceForm />} />
                    <Route path="/add-food-form" element={<FoodForm />} />

                    {/* ── Service Lists ── */}
                    <Route path="/food-services/:subcategory" element={<FoodService />} />
                    <Route path="/food-services/all" element={<FoodService />} />
                    <Route path="/hotel-services/:subcategory" element={<HotelServiceList />} />
                    <Route path="/hospital-services/:subcategory" element={<HospitalServiceList />} />
                    <Route path="/hospital-services" element={<HospitalServicesList />} />
                    <Route path="/beauty-services/:subcategory" element={<BeautyServicesList />} />
                    <Route path="/beauty-services" element={<BeautyServicesList />} />
                    <Route path="/beauty/:subcategory" element={<BeautyServiceList />} />
                    <Route path="/beauty" element={<BeautyServiceList />} />
                    <Route path="/real-estate/:subcategory" element={<RealEstateList />} />
                    <Route path="/real-estate" element={<RealEstateList />} />
                    <Route path="/shopping/:subcategory" element={<ShoppingList />} />
                    <Route path="/shopping" element={<ShoppingList />} />
                    <Route path="/automotive/:subcategory" element={<AutomotiveList />} />
                    <Route path="/automotive" element={<AutomotiveList />} />
                    <Route path="/education/:subcategory" element={<EducationList />} />
                    <Route path="/education" element={<EducationList />} />
                    <Route path="/business/:subcategory" element={<BusinessList />} />
                    <Route path="/business" element={<BusinessList />} />
                    <Route path="/pet-services/:subcategory" element={<PetServiceList />} />
                    <Route path="/pet-services" element={<PetServiceList />} />
                    <Route path="/pet/:subcategory" element={<PetServiceList />} />
                    <Route path="/pet" element={<PetServiceList />} />
                    <Route path="/tech-digital-services/:subcategory" element={<TechDigitalServiceList />} />
                    <Route path="/tech-digital-services" element={<TechDigitalServiceList />} />
                    <Route path="/digital-services/:subcategory" element={<DigitalServiceList />} />
                    <Route path="/digital-services" element={<DigitalServiceList />} />
                    <Route path="/event-services/:subcategory" element={<EventList />} />
                    <Route path="/event-services" element={<EventList />} />
                    <Route path="/event/:subcategory" element={<EventServiceList />} />
                    <Route path="/event" element={<EventServiceList />} />
                    <Route path="/courier/:subcategory" element={<CourierList />} />
                    <Route path="/courier" element={<CourierList />} />
                    <Route path="/industrial-services/:subcategory" element={<IndustrialServiceList />} />
                    <Route path="/industrial-services" element={<IndustrialServiceList />} />
                    <Route path="/industrial/:subcategory" element={<IndustrialServiceList />} />
                    <Route path="/industrial" element={<IndustrialServiceList />} />
                    <Route path="/sports/:subcategory" element={<SportsServiceList />} />
                    <Route path="/sports" element={<SportsServiceList />} />
                    <Route path="/sports-services/:subcategory" element={<SportsServiceList />} />
                    <Route path="/sports-services" element={<SportsServiceList />} />
                    <Route path="/agriculture/:subcategory" element={<AgricultureList />} />
                    <Route path="/agriculture" element={<AgricultureList />} />
                    <Route path="/art-services/:subcategory" element={<ArtServiceList />} />
                    <Route path="/art-services" element={<ArtServiceList />} />
                    <Route path="/art/:subcategory" element={<ArtServiceList />} />
                    <Route path="/art" element={<ArtServiceList />} />
                    <Route path="/daily-wages/:subcategory" element={<DailyWagesList />} />
                    <Route path="/daily-wages" element={<DailyWagesList />} />
                    <Route path="/wedding-services/:subcategory" element={<WeddingServiceList />} />
                    <Route path="/wedding-services" element={<WeddingServiceList />} />
                    <Route path="/wedding/:subcategory" element={<WeddingServiceList />} />
                    <Route path="/wedding" element={<WeddingServiceList />} />
                    <Route path="/corporate/:subcategory" element={<CorporativeServiceList />} />
                    <Route path="/corporate" element={<CorporativeServiceList />} />
                    <Route path="/corporative/:subcategory" element={<CorporativeServiceList />} />
                    <Route path="/corporative" element={<CorporativeServiceList />} />
                    <Route path="/plumber/:subcategory" element={<PlumberServiceList />} />
                    <Route path="/plumber" element={<PlumberServiceList />} />
                    <Route path="/home-personal/:subcategory" element={<HomePersonalServiceList />} />
                    <Route path="/home-personal" element={<HomePersonalServiceList />} />
                    <Route path="/food/:subcategory" element={<FoodServiceList />} />
                    <Route path="/food" element={<FoodServiceList />} />
                    {/* Reviews route */}
                    <Route path="/reviews/:workerId" element={<Reviews />} />
                    {/* ── Worker-only routes ── */}
                    <Route
                        path="/add-skills"
                        element={
                            <WorkerRedirectHandler>
                                <AddSkills />
                            </WorkerRedirectHandler>
                        }
                    />
                    <Route
                        path="/worker-dashboard"
                        element={
                            <WorkerRedirectHandler>
                                <WorkerDashboard />
                            </WorkerRedirectHandler>
                        }
                    />

                    {/* ── Protected routes ── */}
                    <Route path="/listed-jobs" element={<ProtectedRoute><ListedJobsWrapper /></ProtectedRoute>} />
                    <Route path="/my-business" element={<ProtectedRoute><MyBusinessWrapper /></ProtectedRoute>} />
                    <Route path="/free-listing" element={<ProtectedRoute><FreeListing /></ProtectedRoute>} />
                    <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                    <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/policy" element={<ProtectedRoute><Policy /></ProtectedRoute>} />
                    <Route path="/feedback" element={<ProtectedRoute><FeedBack /></ProtectedRoute>} />
                    <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>

            {background && (
                <Routes>
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>
            )}
        </>
    );
};

// ── Root App ──────────────────────────────────────────────────────────────────
const App: React.FC = () => {
    return (
        <AuthProvider>
            <AccountProvider>
                <LocationProvider>
                    <Router>
                        <GoogleTranslate />
                        <AppRoutes />
                    </Router>
                </LocationProvider>
            </AccountProvider>
        </AuthProvider>
    );
};

export default App;