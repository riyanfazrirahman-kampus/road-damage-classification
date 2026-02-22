import { Link, useLocation } from "react-router";
import { FoldersIcon, HomeIcon, PlusIcon } from "../icons";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  center?: boolean;
};

const AppBottomMenu: React.FC = () => {
  const location = useLocation();

  const menus: MenuItem[] = [
    {
      name: "Beranda",
      path: "/",
      icon: <HomeIcon />,
    },
    {
      name: "",
      path: "/classification",
      icon: <PlusIcon />,
      center: true,
    },
    {
      name: "Daftar Klasifikasi",
      path: "/classification-list",
      icon: <FoldersIcon />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-9999 w-full flex justify-center pb-0 sm:pb-2 px-0 sm:px-4 lg:pb-3 lg:px-8 pointer-events-none">
      <div className="w-full lg:max-w-6xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-none sm:rounded-2xl lg:rounded-full border-t sm:border border-white/20 dark:border-gray-800/30 shadow-lg pointer-events-auto theme-transition">
        <div className="relative grid grid-cols-3 px-2 sm:px-4 py-2 gap-1 sm:gap-2 h-20 sm:h-24">
          {menus.map((menu, i) => {
            // CENTER BUTTON (Floating)
            if (menu.center) {
              return (
                <div
                  key={i}
                  className="flex items-center justify-center -top-8 sm:-top-10 relative z-10"
                >
                  <Link
                    to={menu.path}
                    className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-200 group"
                  >
                    <span className="text-2xl sm:text-3xl group-hover:rotate-90 transition-transform duration-200">
                      {menu.icon}
                    </span>
                  </Link>
                </div>
              );
            }

            // NORMAL MENU
            const activeClass = isActive(menu.path)
              ? "text-blue-500 dark:text-blue-400 font-medium"
              : "text-gray-500 dark:text-gray-400";

            return (
              <Link
                key={i}
                to={menu.path}
                className={`flex flex-col items-center justify-center text-xs sm:text-sm transition hover:text-blue-500 active:scale-90 py-1 sm:py-2 px-1 sm:px-2 rounded-full ${activeClass}`}
              >
                <span className="mb-1 text-lg sm:text-2xl transition-transform duration-200 hover:scale-110">
                  {menu.icon}
                </span>
                <span className="truncate text-xs sm:text-sm">{menu.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AppBottomMenu;
