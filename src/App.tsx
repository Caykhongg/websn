import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { CreateWish } from "./pages/CreateWish"
import ViewWish from "./pages/ViewWish"
import { ErrorBoundary } from "./lib/ErrorBoundary"

function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="text-gray-500 text-sm">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-wish-500 to-wish-600
            text-white font-medium hover:from-wish-600 hover:to-wish-700 transition-all shadow-lg shadow-wish-200/50"
        >
          Create a wish
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateWish />} />
          <Route path="/wish/:id" element={
            <ErrorBoundary>
              <ViewWish />
            </ErrorBoundary>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
