import React, { useState } from 'react';
import Footer from './Footer';

function Layout({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <TopBarPage handleSidebarToggle={handleSidebarToggle} /> */}
      <div className="flex flex-grow">
        {/* <SideBarPage sidebarVisible={sidebarVisible} /> */}
        <div className="flex-grow flex flex-col">
          <div className="flex-grow md:p-4 p-2">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Layout;
