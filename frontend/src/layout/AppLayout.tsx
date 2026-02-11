import { Outlet } from "react-router";
import AppBottomMenu from "./AppBottomMenu";
import AppHeader from "./AppHeader";

const AppLayout: React.FC = () => {
  return (
    <div className="relative h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <AppHeader />
      <div className="w-full h-full overflow-auto">
        <Outlet />
      </div>
      <AppBottomMenu />
    </div>
  );
};

export default AppLayout;
