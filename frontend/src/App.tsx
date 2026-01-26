import { BrowserRouter, Route, Routes } from "react-router";
import {Toaster} from 'sonner';
import SignIn from "./pages/SigninPage";
import SignUp from "./pages/SignupPage";
import ChatApp from "./pages/ChatApp";

function App() {
  return <>
    <Toaster richColors/>
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route
          path="/signin"
          element={<SignIn/>}
        />
        <Route
          path="/signup"
          element={<SignUp/>}
        />

        {/* protected routes */}
        <Route
          path="/"
          element={<ChatApp/>}
        />
      </Routes>
    </BrowserRouter>
  </>;
}

export default App;
