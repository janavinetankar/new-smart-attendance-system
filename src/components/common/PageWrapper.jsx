// src/components/common/PageWrapper.jsx
import Sidebar from './Sidebar';

export default function PageWrapper({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface bg-mesh">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
