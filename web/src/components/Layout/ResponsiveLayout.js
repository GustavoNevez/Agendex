import React, { useState } from 'react';
import ResponsiveHeader from '../Header/ResponsiveHeader';
import ResponsiveSidebar from '../Sidebar/ResponsiveSidebar';

/**
 * Responsive Layout Component
 * 
 * This component integrates the ResponsiveHeader and ResponsiveSidebar components
 * to create a fully responsive layout. It handles the state for both the mobile sidebar
 * and the desktop sidebar toggle.
 * 
 * Usage:
 * ```jsx
 * <ResponsiveLayout>
 *   <YourContent />
 * </ResponsiveLayout>
 * ```
 */
function ResponsiveLayout({ children }) {
  // State for desktop sidebar expanded/collapsed
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // State for controlling mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toggle desktop sidebar expanded/collapsed state
  const toggleDesktopSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render header with separate toggle functions for desktop and mobile */}
      <ResponsiveHeader 
        toggleDesktopSidebar={toggleDesktopSidebar} 
        toggleMobileSidebar={toggleMobileSidebar} 
      />
      <ResponsiveSidebar
        isOpen={sidebarExpanded}
        setIsOpen={setSidebarExpanded}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      
      {/* Main content area - adjusts based on sidebar state */}
      <main 
        className={`transition-all duration-300 pt-4 px-4 pb-16 md:pt-6 md:px-6 md:pb-6 ${
          sidebarExpanded ? "md:ml-64" : "md:ml-16"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default ResponsiveLayout;