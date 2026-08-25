import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./router";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
