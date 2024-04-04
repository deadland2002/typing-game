import React from "react";
import { Link } from "react-router-dom";
import {Helmet} from "react-helmet"

const Home = () => {
  return (
    <>
        <title>Home</title>

      <div className="home_parent">
        <div>
          <span>Hi there traveller 👋</span>
          <span>select game mode to begin </span>
        </div>
        <div>
          {/*<Link to={"/singlePlayer"}>Single player</Link>*/}
          <Link to={"/multiPlayer"}>Multi player</Link>
        </div>
      </div>
    </>
  );
};

export default Home;
