import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = auth.currentUser; //user 또는 null값을 받음.
    console.log(user);
    if (user === null) {
        return <Navigate to="/login" />;
    }
    return children;
}
