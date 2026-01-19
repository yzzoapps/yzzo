import { HiChevronLeft } from "react-icons/hi";
import {
  HEADER_CONTAINER_PRIMARY,
  HEADER_CONTAINER_SECONDARY,
} from "@yzzo/styles/constants";
import { Link } from "@tanstack/react-router";
import { HiCog6Tooth } from "react-icons/hi2";
import { IconButton } from "@yzzo/components";
import { useTheme } from "@yzzo/contexts";

interface HeaderProps {
  type?: "primary" | "secondary";
  title?: string;
  previousRoute?: string;
}

const Header: React.FC<HeaderProps> = ({
  type = "secondary",
  title,
  previousRoute,
}) => {
  const { effectiveTheme } = useTheme();

  return (
    <nav
      className={
        type == "secondary"
          ? HEADER_CONTAINER_SECONDARY
          : HEADER_CONTAINER_PRIMARY
      }
    >
      {type == "secondary" ? (
        <>
          {previousRoute && (
            <div className="absolute left-4">
              <IconButton
                link={previousRoute}
                icon={{ type: HiChevronLeft, size: 6, background: true }}
              />
            </div>
          )}
          <h1 className="text-primary dark:text-neutral-white font-semibold text-center text-lg">
            {title}
          </h1>
        </>
      ) : (
        <>
          <Link to="/" className="h-10 flex flex-row gap-1 items-center">
            <img src="/icon.svg" alt="YZZO logo" className="h-full w-auto" />
            <img
              src={
                effectiveTheme === "dark" ? "/text-dark.svg" : "/text-light.svg"
              }
              alt="YZZO text from logo"
              className="h-5 w-auto"
            />
          </Link>
          <div className="flex flex-row gap-4 items-start">
            <IconButton
              icon={{ type: HiCog6Tooth, background: false }}
              link="/settings"
            />
          </div>
        </>
      )}
    </nav>
  );
};

export default Header;
