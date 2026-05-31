import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Spinner } from "./components/Spinner";
import { useAuth } from "./context/AuthContext";
import { ContractDetail } from "./pages/ContractDetail";
import { Contracts } from "./pages/Contracts";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Signup } from "./pages/Signup";
import { Upload } from "./pages/Upload";

function RequireAuth({ children }: { children: JSX.Element }) {
    const { user, isReady } = useAuth();

    if (!isReady) {
        return (
            <div className="page">
                <Spinner size={32} />
                <p>Checking session...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/app"
                element={
                    <RequireAuth>
                        <AppShell />
                    </RequireAuth>
                }
            >
                <Route index element={<Navigate to="contracts" replace />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
                <Route path="upload" element={<Upload />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
