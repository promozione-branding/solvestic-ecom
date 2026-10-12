"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll({ children }) {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            duration: 1.2,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            anchors: true,
        });

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}