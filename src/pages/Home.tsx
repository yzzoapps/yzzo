import { Link } from "@tanstack/react-router";

const Home = () => {
  return (
    <div className="h-full">
      <nav className="flex flex-row items-center justify-between h-16 px-4 py-10">
        <Link to="/" className="h-10">
          <img src="logo.svg" alt="Logo" className="h-full w-auto" />
        </Link>
        <div className="flex flex-row gap-4 items-start">
          <Link to="/settings">S</Link>
        </div>
      </nav>
      Home
    </div>
  );
};

export default Home;
