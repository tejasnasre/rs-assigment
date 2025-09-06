import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { Toaster } from "./components/ui/sonner";

// Create a router
const router = createBrowserRouter(routes);

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
