import React from "react";
import Hero from "../components/Hero";
import HowItWorksWidget from "../Widgets/HowItWorksWidget";
import FeaturesWidget from "../Widgets/FeaturesWidget";
// import StatsWidget from "../Widgets/StatsWidget";
import CtaWidget from "../Widgets/CtaWidget";

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <HowItWorksWidget />
      <FeaturesWidget />
      {/* <StatsWidget /> */}
      <CtaWidget />
    </>
  );
};

export default HomePage;
