import React from "react";
import AboutInfoElement from "../../layouts/about/AboutInfoElement";
import AboutStoryElement from "../../layouts/about/AboutStoryElement";
import AboutProfileElement from "../../layouts/about/AboutProfileElement";
import AboutServicesElement from "../../layouts/about/AboutServicesElement";

const About = () => {
    return (
        <section>
            <div className="container mx-auto px-2">
                {/* 1. navigation path info */}
                <div className="py-10 text-sm ">
                    <div>Home / About</div>
                </div>

                {/* 2. story  */}
                <AboutStoryElement />

                {/* 3. information */}
                <AboutInfoElement />

                {/* 4. profile */}
                <AboutProfileElement />

                {/* 5. services */}
                <AboutServicesElement />
            </div>
        </section>
    );
};

export default About;
