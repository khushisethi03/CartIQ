import { useState, useEffect } from "react";

export default function useResponsive() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return {
        width,
        isDesktop: width > 992,
        isTablet: width <= 992 && width > 768,
        isMobile: width <= 768,
    };
}