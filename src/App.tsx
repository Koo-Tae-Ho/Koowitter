import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import styled, { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import ProtectedRoute from "./components/protected-router";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
        ],
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/create-account",
        element: <CreateAccount />,
    },
]);

const GlobalStyles = createGlobalStyle`
${reset};
* {
  box-sizing: border-box;
  }
body {
  background-color: black;
  color: white;
  font-family: 'system-ui', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

function App() {
    const [isLoading, setLoading] = useState(true);
    const init = async () => {
        //wait for firebase
        // setTimeout(() => setLoading(false), 2000);// 2초뒤 로딩완료
        await auth.authStateReady(); // 파이어베이스에서 없는 함수 인듯?
        setLoading(false);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <Wrapper>
            <GlobalStyles />
            {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
        </Wrapper>
    );
}

const Wrapper = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
`;
export default App;
