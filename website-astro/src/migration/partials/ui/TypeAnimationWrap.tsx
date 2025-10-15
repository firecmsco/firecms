import { TypeAnimation } from "react-type-animation";

function TypeAnimationWrap() {
    return <TypeAnimation
        sequence={[
            "Products",
            1000,
            "Blogs",
            1000,
            "Invoices",
            1000,
            "Users",
            1000,
            "Podcasts",
            1000,
            "Fitness exercises",
            1000,
            "Recipes",
            1000,
            "Events",
            1000,
            "Inventory",
            1000,
        ]}
        wrapper="div"
        className={"md:inline text-text-primary"}
        cursor={true}
        repeat={Infinity}
    />;
}

export default TypeAnimationWrap;
