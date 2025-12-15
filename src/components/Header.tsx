import { HiChevronLeft } from "react-icons/hi";
import IconButton from "./IconButton";
import {
  HEADER_CONTAINER_PRIMARY,
  HEADER_CONTAINER_SECONDARY,
} from "@yzzo/styles/constants";
import { Link } from "@tanstack/react-router";
import { HiCog6Tooth } from "react-icons/hi2";

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
            <IconButton link={previousRoute} icon={HiChevronLeft} />
          )}
          <h1 className="text-primary font-bold text-center flex-1 text-lg">
            {title}
          </h1>
        </>
      ) : (
        <>
          <Link to="/" className="h-10 flex flex-row gap-1 items-center">
            <img src="icon.svg" alt="Logo" className="h-full w-auto" />
            <img src="text.svg" alt="Logo" className="h-5 w-auto" />
          </Link>
          <div className="flex flex-row gap-4 items-start">
            <Link to="/settings">
              <IconButton icon={HiCog6Tooth} onClick={() => {}} />
            </Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default Header;
