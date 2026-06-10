export function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Bhara. All rights reserved.
      </div>
    </footer>
  );
}

